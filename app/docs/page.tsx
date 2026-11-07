import type { Metadata } from "next";
import { DocsPage } from "@/components/docs-page";
import { docs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Documentation",
  description: docs[0].description,
  alternates: { canonical: "/docs/" },
};

export default function Documentation() {
  return <DocsPage page={docs[0]} />;
}
