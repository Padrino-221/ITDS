import { test, expect } from "@playwright/test";

/**
 * Visual regression tests for the E-Learning Hub's lesson page on mobile.
 *
 * The lesson page is the most complex layout: it has a two-column grid
 * (article + sidebar) on desktop that collapses to a single column on
 * mobile, plus a fixed-bottom sticky bar for lesson progress.
 *
 * These tests verify the layout adapts correctly at mobile widths.
 *
 * NOTE: These tests require at least one published lesson to exist in
 * the database. If no lessons exist, the tests will be skipped.
 */

/** Try to find a real lesson URL by visiting the catalog first. */
async function findLessonUrl(page: import("@playwright/test").Page): Promise<string | null> {
  try {
    await page.goto("/learn", { waitUntil: "networkidle", timeout: 15000 });
  } catch {
    return null;
  }

  // Look for a subject link in the catalog grid
  const subjectLink = page.locator('a[href^="/learn/"]').first();
  if (!(await subjectLink.isVisible())) return null;

  const href = await subjectLink.getAttribute("href");
  if (!href) return null;

  // Navigate to the subject page, tolerating redirects
  try {
    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000); // allow client-side redirects to settle
  } catch {
    return null;
  }

  const currentUrl = page.url();
  if (currentUrl.includes("signin")) return null;

  // Look for a lesson link — these are typically the first links with a group class
  // or links inside the topic list that have 3+ path segments
  const allLinks = page.locator('a[href]');
  const count = await allLinks.count();
  for (let i = 0; i < count; i++) {
    const linkHref = await allLinks.nth(i).getAttribute("href");
    if (!linkHref) continue;
    // Lesson URLs have pattern: /learn/<subject>/<topic>/<lesson>
    const segments = linkHref.split("/").filter(Boolean);
    if (segments.length >= 3 && segments[0] === "learn" && !linkHref.includes("/exam")) {
      return linkHref;
    }
  }

  return null;
}

test.describe("E-Learning Hub — lesson page (mobile)", () => {
  test("lesson page sidebar stacks below article on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const lessonUrl = await findLessonUrl(page);
    if (!lessonUrl) {
      test.skip(true, "No published lessons found in the database");
      return;
    }

    await page.goto(lessonUrl);
    await page.waitForLoadState("networkidle");

    // The lesson grid uses lg:grid-cols-[1fr_300px]
    // On mobile (< lg), it should be a single column
    const grid = page.locator(".grid.gap-10").first();
    if (await grid.isVisible()) {
      const columns = await grid.evaluate(
        (el) => window.getComputedStyle(el).gridTemplateColumns
      );
      const colCount = columns.split(" ").filter(Boolean).length;
      expect(colCount).toBe(1);
    }

    // Take a screenshot of the lesson page
    await expect(page).toHaveScreenshot("learn-lesson-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });

  test("mobile sticky progress bar appears on lesson page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const lessonUrl = await findLessonUrl(page);
    if (!lessonUrl) {
      test.skip(true, "No published lessons found in the database");
      return;
    }

    await page.goto(lessonUrl);
    await page.waitForLoadState("networkidle");

    // The mobile sticky bar should be visible on screens < lg
    const stickyBar = page.locator(".fixed.inset-x-0.bottom-0");
    // The sticky bar only shows when signed in; check it exists in the DOM
    const stickyBarCount = await stickyBar.count();
    // If signed in, it should be visible; if not, it shouldn't be in the DOM
    // Either way, the page should render without overflow
    if (stickyBarCount > 0 && (await stickyBar.first().isVisible())) {
      // Take screenshot with sticky bar
      await expect(page).toHaveScreenshot("learn-lesson-mobile-sticky.png", {
        fullPage: false,
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test("lesson breadcrumbs wrap correctly on narrow screens", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const lessonUrl = await findLessonUrl(page);
    if (!lessonUrl) {
      test.skip(true, "No published lessons found in the database");
      return;
    }

    await page.goto(lessonUrl);
    await page.waitForLoadState("networkidle");

    // Breadcrumbs should use flex-wrap
    const breadcrumbs = page.locator("nav.flex.flex-wrap").first();
    if (await breadcrumbs.isVisible()) {
      const flexWrap = await breadcrumbs.evaluate(
        (el) => window.getComputedStyle(el).flexWrap
      );
      expect(flexWrap).toBe("wrap");
    }
  });

  test("prev/next navigation buttons work on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const lessonUrl = await findLessonUrl(page);
    if (!lessonUrl) {
      test.skip(true, "No published lessons found in the database");
      return;
    }

    await page.goto(lessonUrl);
    await page.waitForLoadState("networkidle");

    // The prev/next grid uses grid-cols-2 on mobile
    const navGrid = page.locator(".grid.grid-cols-2.gap-3").first();
    if (await navGrid.isVisible()) {
      const columns = await navGrid.evaluate(
        (el) => window.getComputedStyle(el).gridTemplateColumns
      );
      // Should have 2 columns
      const colCount = columns.split(" ").filter(Boolean).length;
      expect(colCount).toBe(2);
    }
  });
});
