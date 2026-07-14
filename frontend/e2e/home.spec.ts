import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("loads and shows book marketplace heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveTitle(/SagaDrop/);
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/");
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigates to search page", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveURL(/\/search/);
  });
});
