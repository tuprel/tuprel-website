const configuredUrl = process.env.SITE_URL;

export const siteUrl = configuredUrl ? new URL(configuredUrl) : undefined;

if (siteUrl && (siteUrl.protocol !== "https:" || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password)) {
  throw new Error("SITE_URL must be the HTTPS origin of the website.");
}
