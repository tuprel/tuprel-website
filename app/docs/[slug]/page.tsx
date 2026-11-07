import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPage } from "@/components/docs-page";
import { docHref, docs } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return docs.filter(({ slug }) => slug !== "overview").map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

async function getPage(params: Props["params"]) {
  const { slug } = await params;
  return docs.find((page) => page.slug === slug && page.slug !== "overview") ?? notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params);
  return { title: page.title, description: page.description, alternates: { canonical: docHref(page.slug) } };
}

export default async function Document({ params }: Props) {
  return <DocsPage page={await getPage(params)} />;
}
