import { defineConfig, devices } from "@playwright/test";

const url = "http://127.0.0.1:4173";
const channel = process.env.PLAYWRIGHT_CHANNEL;
export default defineConfig({
  testDir: "./tests/e2e",
  reporter: "list",
  use: { baseURL: url, trace: "retain-on-failure", channel },
  webServer: { command: "node scripts/serve.mjs", url, reuseExistingServer: !process.env.CI },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" } },
  ],
});
