import {test, expect} from "@playwright/test";

test.describe("Simple Tests", () => {
  test("should redirect to login when accessing protected route", async ({
    page,
  }) => {
    await page.goto("/");

    // Should redirect to login page
    await expect(page).toHaveURL("/login");

    // Check that the page loads
    await expect(page).toHaveTitle(/Gazaconfirm/);

    // Check for login form heading
    await expect(page.getByRole("heading", {name: "Sign In"})).toBeVisible();
  });

  test("should navigate to register page from login", async ({page}) => {
    await page.goto("/login");

    // Click register link
    await page.getByRole("link", {name: "Create one"}).click();

    // Should navigate to register page
    await expect(page).toHaveURL("/register");

    // Check register form elements
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="fullName"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
  });

  test("should navigate to login page from register", async ({page}) => {
    await page.goto("/register");

    // Click login link
    await page.getByRole("link", {name: "Sign in"}).click();

    // Should navigate to login page
    await expect(page).toHaveURL("/login");

    // Check login form elements
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });
});
