import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteUrl ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).href : undefined,
  };
}
