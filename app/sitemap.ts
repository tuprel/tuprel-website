import type { MetadataRoute } from "next";
import { docHref, docs } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return ["/", "/examples/", ...docs.map(({ slug }) => docHref(slug))]
    .map((path) => ({ url: new URL(path, siteUrl).href }));
}
