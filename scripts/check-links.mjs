import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

const root = resolve("out");
const pages = (await readdir(root, { recursive: true })).filter((path) => path.endsWith(".html"));
if (pages.length < 3) throw new Error("Run pnpm build before checking links.");

const documents = new Map(await Promise.all(pages.map(async (path) => {
  const absolute = join(root, path);
  const html = await readFile(absolute, "utf8");
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id));
  return [absolute, { html, ids }];
})));
const errors = [];
let checked = 0;
for (const [page, { html }] of documents) {
  const location = page.slice(root.length).split(sep).join("/").replace(/index\.html$/, "");
  for (const [, href] of html.matchAll(/<a\b[^>]*?\shref="([^"]+)"/g)) {
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    const url = new URL(href, "https://preview.invalid" + location);
    if (url.origin !== "https://preview.invalid") continue;
    const target = resolve(root, "." + decodeURIComponent(url.pathname) + (url.pathname.endsWith("/") ? "index.html" : ""));
    const document = documents.get(target);
    const anchor = decodeURIComponent(url.hash.slice(1));
    checked++;
    if (document && (!anchor || document.ids.has(anchor))) continue;
    if (!document && !anchor && (await stat(target).catch(() => undefined))?.isFile()) continue;
    errors.push(`${location} -> ${href}`);
  }
}
if (errors.length) throw new Error("Invalid internal links:\n" + [...new Set(errors)].sort().join("\n"));
console.log(`Checked ${checked} internal links and anchors across ${pages.length} HTML pages.`);
