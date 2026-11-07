import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { Header } from "@/components/site-shell";
import { siteUrl } from "@/lib/site-url";

const description = "A schema-first Java toolkit for typed PostgreSQL access. Generate a Java client, inspect SQL and review migrations.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Tuprel — Typed PostgreSQL for Java", template: "%s | Tuprel" },
  description,
  applicationName: "Tuprel",
  robots: siteUrl ? undefined : { index: false, follow: false },
  openGraph: { type: "website", siteName: "Tuprel", title: "Tuprel — Typed PostgreSQL for Java", description, images: siteUrl ? [{ url: "/social-card.png", width: 1200, height: 630, alt: "Tuprel — Define the schema. Own the query." }] : undefined },
  twitter: { card: "summary_large_image" },
};

const theme = `try {
  var saved = localStorage.getItem("tuprel-theme");
  document.documentElement.dataset.theme = saved === "light" || saved === "dark"
    ? saved : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
} catch {}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: theme }} /></head>
    <body><a className="skip-link" href="#content">Skip to content</a><Header />{children}</body>
  </html>;
}
