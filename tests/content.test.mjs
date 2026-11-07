import assert from "node:assert/strict";
import test from "node:test";
import { parseMarkdown, plain, selectContent } from "../scripts/markdown.mjs";
import { rankSearch } from "../lib/search.ts";

test("markdown renders GFM with stable headings and sanitizes unsafe HTML and URLs", () => {
  const { tree, anchors } = parseMarkdown([
    "## SQL Preview", "", "## SQL Preview", "", "| a | b |", "| - | - |", "| x | y |", "",
    "<a id=\"legacy\"></a>", "<details><summary>Example</summary>safe text</details>",
    "<script>alert(1)</script>", "<iframe src=\"https://example.org\"></iframe>",
    "<a href=\"javascript:alert(1)\" onclick=\"alert(1)\">link</a>",
  ].join("\n"));
  assert.equal(anchors.get("sql-preview-1"), "sql-preview-1");
  assert.equal(anchors.get("legacy"), "user-content-legacy");
  assert.match(plain(tree), /Example safe text/);
  assert.match(JSON.stringify(tree), /"tagName":"table"/);
  assert.doesNotMatch(JSON.stringify(tree), /iframe|script|javascript:|onclick|alert\(1\)/);
});

test("a missing pinned section fails instead of rendering an empty page", () => {
  const { tree } = parseMarkdown("# Guide\n\n## Available\n\nText");
  assert.throws(() => selectContent(tree, "Missing"), /Upstream section is missing/);
  assert.equal(plain(selectContent(tree, "Available")), "Available Text");
});

test("search ranks exact matches, normalizes accents, and matches multiple terms", () => {
  const index = [
    { href: "/docs/schema/", title: "Schema", summary: "", text: "Generate Java with PostgreSQL" },
    { href: "/docs/cli/", title: "CLI", section: "Générate", summary: "", text: "Java client" },
    { href: "/docs/generate/", title: "Generate", summary: "", text: "Java client" },
  ];
  assert.deepEqual(rankSearch(index, "generate java").map(({ href }) => href), ["/docs/generate/", "/docs/cli/", "/docs/schema/"]);
  assert.equal(rankSearch(index, "generate")[0].href, "/docs/generate/");
  assert.deepEqual(rankSearch(index, "unknown"), []);
});
