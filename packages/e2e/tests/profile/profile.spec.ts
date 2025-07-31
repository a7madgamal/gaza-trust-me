import {test, expect} from "@playwright/test";
import {clearBrowserState} from "../utils/auth-helpers";

test.describe("Profile Management", () => {
  test("should redirect to login when not authenticated", async ({page}) => {
    await clearBrowserState(page);
    await page.goto("/profile");

    // Wait for authentication check to complete and redirect to happen
    await page.waitForURL("/login", {timeout: 10000});
  });

  test("should show login form when accessing profile without auth", async ({
    page,
  }) => {
    await clearBrowserState(page);
    await page.goto("/profile");

    // Should show login form
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test("should show registration link when not logged in", async ({page}) => {
    await page.goto("/login");

    // Should show link to registration
    await expect(page.getByText("Don't have an account?")).toBeVisible();
    await expect(page.getByText("Create one")).toBeVisible();
  });

  test("should have proper form validation on login", async ({page}) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.click('[data-testid="login-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="email"]')).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  test("should show proper error messages for invalid login", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fill with invalid credentials
    await page.fill('[data-testid="email"]', "invalid@example.com");
    await page.fill('[data-testid="password"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });
});
