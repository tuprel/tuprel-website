import GithubSlugger from "github-slugger";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const schema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames, "details", "summary"],
  attributes: { ...defaultSchema.attributes, details: ["open"] },
  strip: [...(defaultSchema.strip ?? []), "iframe", "object", "style", "template"],
};

const processor = unified().use(remarkParse).use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, schema);

export const plain = (node) => node.type === "text" ? node.value
  : (node.children ?? []).map(plain).join(node.tagName === "pre" ? "" : " ").replace(/\s+/g, " ").trim();

export function parseMarkdown(markdown) {
  const tree = processor.runSync(processor.parse(markdown));
  const slugger = new GithubSlugger();
  const anchors = new Map();
  visit(tree, (node) => {
    delete node.position;
    if (node.type !== "element") return;
    if (node.properties.id) {
      const id = String(node.properties.id);
      anchors.set(id.replace(/^user-content-/, ""), id);
    }
    if (/^h[1-6]$/.test(node.tagName)) {
      const id = slugger.slug(plain(node));
      node.properties.id = id;
      if (id) anchors.set(id, id);
    }
  });
  return { tree, anchors };
}

export function selectContent(tree, section, fragment) {
  const nodes = [...tree.children];
  const start = section
    ? nodes.findIndex((node) => node.type === "element" && node.tagName === "h2" && plain(node) === section)
    : -1;
  if (section && start === -1) throw new Error(`Upstream section is missing: ${section}`);
  if (section) {
    const end = nodes.findIndex((node, index) => index > start && node.type === "element" && /^h[12]$/.test(node.tagName));
    const selected = nodes.slice(start, end === -1 ? undefined : end);
    if (!fragment) return { type: "root", children: selected };
    const code = selected.find((node) => node.type === "element" && node.tagName === "pre");
    const table = selected.find((node) => node.type === "element" && node.tagName === "table");
    const command = code?.children[0]?.children[0];
    const matchingLines = command?.value.split("\n").filter((line) => line.startsWith(`tuprel ${fragment} `));
    const body = table?.children.find((node) => node.type === "element" && node.tagName === "tbody");
    const rows = body?.children.filter((node) => node.type === "element" && plain(node.children[0]) === fragment);
    if (!matchingLines?.length || !rows?.length) throw new Error(`Missing upstream command: ${fragment}`);
    command.value = matchingLines.join("\n") + "\n";
    body.children = rows;
    return { type: "root", children: [selected[0], code, table] };
  }
  const title = nodes.findIndex((node) => node.type === "element" && node.tagName === "h1");
  if (title >= 0) nodes.splice(title, 1);
  if (nodes[0]?.tagName === "p" && plain(nodes[0]).startsWith("Documentation /")) nodes.shift();
  return { type: "root", children: nodes };
}
