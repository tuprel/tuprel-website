import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage connects to the real guides and examples", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Own the query.");
  await expect(page.getByText("List<Product> available", { exact: false })).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "Documentation", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tuprel Documentation");
  if (testInfo.project.name === "mobile") await page.getByText("Browse documentation", { exact: true }).click();
  await page.getByRole("navigation", { name: "Documentation", exact: true }).getByRole("link", { name: "Installation", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Installation");
  await expect(page.getByRole("heading", { name: "Build the launcher", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Previous and next documents" }).getByRole("link", { name: "Next First project" })).toBeVisible();
  await page.goto("/examples/");
  await expect(page.getByRole("heading", { name: "Inspect the generated SELECT." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: testInfo.project.name === "mobile" ? "Mobile navigation" : "Main navigation" }).getByRole("link", { name: "Roadmap" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Roadmap");
});

test("search opens by shortcut, finds real content and follows a result", async ({ page }) => {
  await page.goto("/docs/");
  const search = page.getByRole("dialog", { name: "Search documentation" });
  await expect(async () => {
    if (!(await search.isVisible())) await page.keyboard.press("Control+k");
    await expect(search).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 8000 });
  await search.getByRole("searchbox").fill("exit codes");
  await search.getByRole("link", { name: /^Diagnostics and exit codes/ }).first().click();
  await expect(page).toHaveURL(/\/docs\/diagnostics\//);
  await expect(search).toBeHidden();
});

test("theme persists, documentation code copies, and primary pages pass axe", async ({ page }) => {
  await page.goto("/docs/quickstart/");
  await page.getByRole("button", { name: /theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(page.getByText("Copied", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toHaveLength(0);

  for (const url of ["/docs/", "/"]) {
    await page.goto(url);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  }
  await page.getByRole("button", { name: /theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/docs/");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
});

test("unknown routes provide a way back to documentation", async ({ page }) => {
  const response = await page.goto("/missing/");
  expect(response?.status()).toBe(404);
  await page.getByRole("link", { name: "Browse documentation" }).click();
  await expect(page).toHaveURL(/\/docs\/$/);
});
