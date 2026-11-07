import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";
import { parseMarkdown, plain, selectContent } from "./markdown.mjs";
import manifest from "../content/upstream.json" with { type: "json" };

const root = fileURLToPath(new URL("../", import.meta.url));
const { commit, repository, groups, examples } = manifest;
if (repository !== "https://github.com/tuprel/tuprel" || !/^[0-9a-f]{40}$/.test(commit)) {
  throw new Error("The documentation manifest must pin a full commit from tuprel/tuprel.");
}

const candidate = resolve(root, process.env.TUPREL_DOCS_SOURCE ?? "../tuprel");
function git(args) {
  return execFileSync("git", ["-C", candidate, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

let useLocal = false;
if (process.env.TUPREL_DOCS_REMOTE !== "1") {
  try {
    git(["cat-file", "-e", commit + "^{commit}"]);
    useLocal = true;
  } catch {
    if (process.env.TUPREL_DOCS_SOURCE) throw new Error("TUPREL_DOCS_SOURCE does not contain the pinned commit.");
  }
}

async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Pinned source unavailable (${response.status}): ${url}`);
  return response;
}

const rawBase = `https://raw.githubusercontent.com/tuprel/tuprel/${commit}/`;
const blobBase = `${repository}/blob/${commit}/`;
const treeBase = `${repository}/tree/${commit}/`;
const sources = new Map();
function read(path) {
  if (!sources.has(path)) {
    sources.set(path, useLocal ? Promise.resolve(git(["show", `${commit}:${path}`]))
      : download(rawBase + path.split("/").map(encodeURIComponent).join("/")).then((response) => response.text()));
  }
  return sources.get(path);
}

const fileNames = useLocal ? git(["ls-tree", "-r", "--name-only", commit]).trim().split(/\r?\n/)
  : (await (await download(`https://api.github.com/repos/tuprel/tuprel/git/trees/${commit}?recursive=1`)).json()).tree
    .filter(({ type }) => type === "blob").map(({ path }) => path);
const files = new Set(fileNames);
const directories = new Set();
for (const path of files) {
  for (let parent = posix.dirname(path); parent !== "."; parent = posix.dirname(parent)) directories.add(parent);
}

const docHref = (slug) => slug === "overview" ? "/docs/" : `/docs/${slug}/`;
const entries = groups.flatMap(({ label, pages }) => pages.map((page) => ({ ...page, group: label })));
const missing = new Set();
const search = [];
const parsed = await Promise.all(entries.map(async (page) => {
  if (!page.source) return { ...page, headings: [] };
  const { tree, anchors } = parseMarkdown(await read(page.source));
  const selected = selectContent(tree, page.section, page.fragment);
  const renderedAnchors = new Set();
  const headings = [];
  visit(selected, "element", (node) => {
    if (node.properties.id) renderedAnchors.add(String(node.properties.id));
    if (/^h[23]$/.test(node.tagName)) headings.push({ id: node.properties.id, label: plain(node), depth: Number(node.tagName[1]) });
  });
  const sectionAnchor = headings[0]?.id;
  return { ...page, tree: selected, anchors, renderedAnchors, headings,
    sourceUrl: blobBase + page.source + (page.section && sectionAnchor ? "#" + sectionAnchor : "") };
}));

const canonical = new Map(parsed.filter(({ source, section }) => source && !section).map((page) => [page.source, page]));
const hrefForPath = new Map([["README.md", "/"], ["docs/README.md", "/docs/"]]);
function rewrite(url, page, image = false) {
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return url;
  const [path, rawFragment] = url.split("#", 2);
  const fragment = rawFragment ? decodeURIComponent(rawFragment) : "";
  if (fragment && /[\s<>]/.test(fragment)) throw new Error(`Invalid source anchor: ${url}`);
  const target = path ? posix.normalize(posix.join(posix.dirname(page.source), decodeURIComponent(path))).replace(/\/$/, "") : page.source;
  if (!files.has(target) && !directories.has(target)) {
    missing.add(`${page.source} -> ${url}`);
    return url;
  }
  if (image) return rawBase + target;
  const mapped = canonical.get(target);
  const fragmentId = (!path && page.renderedAnchors.has(page.anchors.get(fragment)))
    ? page.anchors.get(fragment)
    : mapped?.anchors.get(fragment);
  if (!path && fragmentId && page.renderedAnchors.has(fragmentId)) return "#" + encodeURIComponent(fragmentId);
  if (mapped && (!fragment || mapped.renderedAnchors.has(fragmentId))) {
    return docHref(mapped.slug) + (fragment ? "#" + encodeURIComponent(fragmentId) : "");
  }
  if (!fragment && hrefForPath.has(target)) return hrefForPath.get(target);
  if (mapped && fragment && !mapped.anchors.has(fragment)) missing.add(`${page.source} -> ${url} (missing anchor)`);
  return (directories.has(target) ? treeBase : blobBase) + target + (fragment ? "#" + encodeURIComponent(fragment) : "");
}

const pages = parsed.map(({ anchors, renderedAnchors, ...page }) => {
  if (page.tree) visit(page.tree, "element", (node) => {
    if (node.tagName === "a" && typeof node.properties.href === "string") {
      node.properties.href = rewrite(node.properties.href, { ...page, anchors, renderedAnchors });
    }
    if (node.tagName === "img" && typeof node.properties.src === "string") {
      node.properties.src = rewrite(node.properties.src, { ...page, anchors, renderedAnchors }, true);
    }
  });
  const href = docHref(page.slug);
  search.push({ href, title: page.title, summary: page.description, text: page.tree ? plain(page.tree).slice(0, 1800) : "" });
  let section;
  let text = "";
  function addSection() {
    if (!section?.id) return;
    search.push({ href: href + "#" + encodeURIComponent(section.id), title: page.title, section: section.label, summary: text.slice(0, 145), text: text.slice(0, 1800) });
  }
  for (const node of page.tree?.children ?? []) {
    if (node.type === "element" && /^h[23]$/.test(node.tagName)) {
      addSection();
      section = { id: node.properties.id, label: plain(node) };
      text = "";
    } else if (section) {
      text += (text ? " " : "") + plain(node);
    }
  }
  addSection();
  return page;
});

if (missing.size) {
  throw new Error("Broken links in pinned documentation:\n" + [...missing].sort().join("\n"));
}

const [readme, schema, cli, migrations] = await Promise.all(Object.values(examples).map(read));
function snippet(markdown, pattern, label) {
  const result = markdown.match(pattern)?.[1]?.trimEnd();
  if (!result) throw new Error("Upstream example unavailable: " + label);
  return result.replace(/\r\n/g, "\n");
}

const code = {
  query: snippet(readme, /```java\r?\n(TuprelClient db = new TuprelClient[\s\S]*?)\r?\n```/, "playground query"),
  preview: snippet(readme, /```java\r?\n(RenderedSql preview = db\.product[\s\S]*?)\r?\n```/, "SQL preview"),
  schema: snippet(schema, /((?:model Product) \{[\s\S]*?^\})/m, "Product schema"),
  workflow: snippet(readme, /```bash\r?\n(tuprel validate --schema[\s\S]*?)\r?\n```/, "generation workflow"),
  quickstart: snippet(cli, /\n(tuprel init \[--dry-run\][\s\S]*?tuprel generate \[--check \| --dry-run\][^\r\n]*)/, "CLI quickstart")
    .split("\n").filter((line) => !line.includes("format")).map((line) => line.replace(/ \[.*$/, "")).join("\n"),
  migration: snippet(migrations, /```powershell\r?\n(tuprel\.bat migrate deploy --target-schema app --dry-run[\s\S]*?)\r?\n```/, "reviewed migration"),
};

await mkdir(resolve(root, "generated"), { recursive: true });
await writeFile(resolve(root, "generated/content.json"), JSON.stringify({ commit, groups, pages, search, examples: code }) + "\n");
console.log(`Synced ${pages.length} documentation pages from ${commit.slice(0, 12)} (${useLocal ? "local Git" : "GitHub"}).`);
