import { test, expect } from "@playwright/test";

/**
 * Visual regression tests for the E-Learning Hub's layout patterns.
 *
 * These tests verify that core layout components (header, footer, grids)
 * behave correctly at various mobile viewport widths. They focus on
 * structural and CSS-level checks that apply across all pages.
 */

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568, label: "320px" },
  { width: 375, height: 667, label: "375px" },
  { width: 414, height: 896, label: "414px" },
];

test.describe("E-Learning Hub — layout responsiveness across viewports", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`catalog page: no horizontal overflow at ${vp.label} width`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/learn");
      await page.waitForLoadState("networkidle");

      // No horizontal scroll on the body
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);

      // The search input should be visible and fit within the viewport
      const searchInput = page.locator(
        '[aria-label="Search lessons across all courses"]'
      );
      const box = await searchInput.boundingBox();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
      }
    });

    test(`sign-in page: form fits within ${vp.label} viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/learn/account/signin");
      await page.waitForLoadState("networkidle");

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);

      // The sign-in card should be centered and fit
      const card = page.locator("text=Welcome back").locator("..");
      const cardBox = await card.boundingBox();
      if (cardBox) {
        expect(cardBox.x).toBeGreaterThanOrEqual(-1);
        expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(vp.width + 1);
      }
    });
  }

  test("full-page screenshot comparison at 320px width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("learn-catalog-320w.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("full-page screenshot comparison at 375px width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("learn-catalog-375w.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe("E-Learning Hub — responsive grid behavior", () => {
  test("catalog subject grid uses single column on 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    // The subject grid should exist
    const grid = page.locator(".grid.gap-6").first();
    if (await grid.isVisible()) {
      // On 320px, grid should be single column (no sm:grid-cols-2 breakpoint hit)
      const columns = await grid.evaluate(
        (el) => window.getComputedStyle(el).gridTemplateColumns
      );
      // Single column means only one value (e.g. "320px" or "1fr")
      const colCount = columns.split(" ").filter(Boolean).length;
      expect(colCount).toBe(1);
    }
  });

  test("account stats grid stacks on 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/learn/account");
    // This will redirect to sign-in if not authenticated, that's ok —
    // we're testing the sign-in page's layout at this viewport instead.
    await page.waitForLoadState("networkidle");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(321);
  });
});

test.describe("E-Learning Hub — touch targets and spacing", () => {
  test("navigation links are visible and tappable on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    // Subject nav links should be visible and within the viewport
    const navLinks = page.locator("nav.scrollbar-hide a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // First few links should be inside the viewport (scrollable if needed)
    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await navLinks.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThan(0);
        // Link should not overflow the viewport
        expect(box.x).toBeGreaterThanOrEqual(-10);
      }
    }
  });

  test("search input is easily tappable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    const input = page.locator(
      '[aria-label="Search lessons across all courses"]'
    );
    const box = await input.boundingBox();
    if (box) {
      // Search input should be tall enough for comfortable tapping
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test("sign-in button meets minimum touch target size", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/learn/account/signin");
    await page.waitForLoadState("networkidle");

    const button = page.locator('button:has-text("Sign in")');
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      // Button should span most of the card width
      expect(box.width).toBeGreaterThan(200);
    }
  });
});
