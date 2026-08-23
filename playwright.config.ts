import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for visual regression testing of the E-Learning Hub
 * on mobile viewports. Run against the dev server:
 *
 *   npm run dev          # terminal 1
 *   npx playwright test  # terminal 2
 *
 * First run captures baseline screenshots. Subsequent runs compare against
 * them and flag any visual changes. Update baselines with:
 *
 *   npx playwright test --update-snapshots
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    /* ── Mobile viewports ─────────────────────────────────────── */
    {
      name: "iPhone SE",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "iPhone 12",
      use: { ...devices["iPhone 12"] },
    },
    {
      name: "Pixel 5",
      use: { ...devices["Pixel 5"] },
    },

    /* ── Tablet viewports ─────────────────────────────────────── */
    {
      name: "iPad Mini",
      use: { ...devices["iPad Mini"] },
    },
  ],
});
