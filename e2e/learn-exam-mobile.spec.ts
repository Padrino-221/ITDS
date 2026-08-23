import { test, expect } from "@playwright/test";

/**
 * Visual regression tests for the E-Learning Hub's exam page on mobile.
 *
 * The exam page has a question-by-question flow with a sticky header bar,
 * answer selection, and navigation buttons — all of which need to work
 * well on small touchscreens.
 *
 * NOTE: These tests require a published exam in the database. If none
 * exists, the tests are skipped.
 */

/** Try to find a real exam URL via the catalog. */
async function findExamUrl(
  page: import("@playwright/test").Page
): Promise<string | null> {
  await page.goto("/learn");
  await page.waitForLoadState("networkidle");

  const subjectLink = page.locator('a[href^="/learn/"]').first();
  if (!(await subjectLink.isVisible())) return null;

  await subjectLink.click();
  await page.waitForLoadState("networkidle");

  // Look for an exam link (marked with "Exam" badge)
  const examLink = page.locator('a[href$="/exam"]').first();
  if (await examLink.isVisible()) {
    return examLink.getAttribute("href");
  }

  return null;
}

test.describe("E-Learning Hub — exam page (mobile)", () => {
  test("exam pre-start screen renders correctly on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const examUrl = await findExamUrl(page);
    if (!examUrl) {
      test.skip(true, "No published exam found in the database");
      return;
    }

    await page.goto(examUrl);
    await page.waitForLoadState("networkidle");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);

    await expect(page).toHaveScreenshot("learn-exam-start-375w.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("exam pre-start screen renders at 320px width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    const examUrl = await findExamUrl(page);
    if (!examUrl) {
      test.skip(true, "No published exam found in the database");
      return;
    }

    await page.goto(examUrl);
    await page.waitForLoadState("networkidle");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(321);

    await expect(page).toHaveScreenshot("learn-exam-start-320w.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("exam start button meets minimum touch target", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const examUrl = await findExamUrl(page);
    if (!examUrl) {
      test.skip(true, "No published exam found in the database");
      return;
    }

    await page.goto(examUrl);
    await page.waitForLoadState("networkidle");

    const startBtn = page.locator('button:has-text("Start Exam")');
    if (await startBtn.isVisible()) {
      const box = await startBtn.boundingBox();
      if (box) {
        // Minimum 44px height for touch targets (WCAG)
        expect(box.height).toBeGreaterThanOrEqual(44);
        // Button should be wide enough to be easily tappable
        expect(box.width).toBeGreaterThanOrEqual(100);
      }
    }
  });
});
