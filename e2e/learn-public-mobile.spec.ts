import { test, expect } from "@playwright/test";

/**
 * Visual regression tests for the E-Learning Hub's public pages.
 *
 * These pages are accessible without authentication and use mostly
 * static / server-rendered content, so they're ideal baseline targets.
 *
 * Screenshots are saved per-project (viewport) under:
 *   e2e/__screenshots__/learn-public--<project-name>/
 */
test.describe("E-Learning Hub — public pages (mobile)", () => {
  /* ── Catalog / Home ──────────────────────────────────────── */

  test("learn catalog page renders and is not wider than the viewport", async ({
    page,
  }) => {
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    // Verify key content is visible
    await expect(page.locator("text=ITDS E-Learning Hub")).toBeVisible();
    await expect(page.locator('[aria-label="Search lessons across all courses"]')).toBeVisible();

    // Take a full-page screenshot for visual regression
    await expect(page).toHaveScreenshot("learn-catalog.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });

    // Verify no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  /* ── Sign-in page ───────────────────────────────────────── */

  test("sign-in page renders correctly on mobile", async ({ page }) => {
    await page.goto("/learn/account/signin");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Welcome back")).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();

    await expect(page).toHaveScreenshot("learn-signin.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  /* ── Register page ───────────────────────────────────────── */

  test("register page renders correctly on mobile", async ({ page }) => {
    await page.goto("/learn/account/register");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Create your account")).toBeVisible();
    await expect(page.locator('button:has-text("Create account")')).toBeVisible();

    await expect(page).toHaveScreenshot("learn-register.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  /* ── Certificate callback (redirects to sign-in if not auth) ── */

  test("certificate callback redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    await page.goto("/learn/certificate/callback?error=no_reference");
    await page.waitForLoadState("networkidle");

    // Without a learner session, the page redirects to sign-in
    await expect(page).toHaveURL(/signin/);
  });
});

test.describe("E-Learning Hub — layout components (mobile)", () => {
  /* ── Header responsiveness ───────────────────────────────── */

  test("learn header hamburger menu opens and closes", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    // On mobile, the hamburger button should be visible
    const menuButton = page.getByRole("button", { name: /open account menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Menu should appear
      const dropdown = page.locator("#learn-account-menu");
      await expect(dropdown).toBeVisible();

      // Take screenshot with menu open
      await expect(page).toHaveScreenshot("learn-header-menu-open.png", {
        fullPage: false,
        maxDiffPixelRatio: 0.01,
      });

      // Close the menu by pressing Escape
      await page.keyboard.press("Escape");

      // Menu should disappear
      await expect(dropdown).not.toBeVisible();
    }
  });

  /* ── Subject nav horizontal scroll ───────────────────────── */

  test("subject navigation scrolls horizontally on small screens", async ({
    page,
  }) => {
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    // The subject nav should be present
    const nav = page.locator("nav.scrollbar-hide");
    if (await nav.isVisible()) {
      // Verify it has overflow-x-auto
      const overflow = await nav.evaluate(
        (el) => window.getComputedStyle(el).overflowX
      );
      expect(overflow).toBe("auto");
    }
  });

  /* ── Footer stacks on mobile ─────────────────────────────── */

  test("learn footer stacks vertically on mobile", async ({ page }) => {
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");

    // The inner div inside <footer> has the responsive flex layout
    const footerInner = page.locator("footer .flex.max-w-7xl");

    // On mobile, footer content should use flex-col (stacked)
    const flexDir = await footerInner.evaluate(
      (el) => window.getComputedStyle(el).flexDirection
    );
    expect(flexDir).toBe("column");
  });
});
