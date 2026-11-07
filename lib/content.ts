import data from "@/generated/content.json";
import type { Root } from "hast";
import type { SearchEntry } from "./search";

export type Heading = { id: string; label: string; depth: number };
export type DocPage = {
  slug: string;
  title: string;
  description: string;
  group: string;
  sourceUrl?: string;
  headings: Heading[];
  tree?: Root;
};

export const docs = data.pages as DocPage[];
export const groups = data.groups;
export const examples = data.examples;
export const sourceCommit = data.commit;
export const searchIndex: SearchEntry[] = data.search;
export const docHref = (slug: string) => slug === "overview" ? "/docs/" : `/docs/${slug}/`;
