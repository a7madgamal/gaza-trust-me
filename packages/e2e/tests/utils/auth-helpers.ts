import {Page, expect} from "@playwright/test";
import {TestUser, PREDEFINED_TEST_USERS, generateTestUser} from "./test-data";

/**
 * Authentication helper functions for E2E tests
 */

/**
 * Login as a predefined test user
 */
export async function loginAsUser(
  page: Page,
  userType: keyof typeof PREDEFINED_TEST_USERS
): Promise<void> {
  const user = PREDEFINED_TEST_USERS[userType];
  await loginWithCredentials(page, user);
}

/**
 * Register and login with a unique test user
 */
export async function registerAndLoginUniqueUser(
  page: Page
): Promise<TestUser> {
  // Generate a unique test user
  const user = generateTestUser();

  // Register the user first
  await registerNewUser(page, user);

  // Then login
  await loginWithCredentials(page, user);

  return user;
}

/**
 * Login with custom credentials
 */
export async function loginWithCredentials(
  page: Page,
  user: TestUser
): Promise<void> {
  await page.goto("/login");

  // Fill login form
  await page.fill('[data-testid="email"]', user.email);
  await page.fill('[data-testid="password"]', user.password);

  // Submit form
  await page.click('[data-testid="login-button"]');

  // Wait for successful login - check for dashboard elements instead of URL
  await page.waitForSelector('[data-testid="dashboard-title"]', {
    timeout: 10000,
  });

  // Verify we're on the dashboard by checking for dashboard-specific elements
  await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
}

/**
 * Register a new test user
 */
export async function registerNewUser(
  page: Page,
  user: TestUser
): Promise<void> {
  await page.goto("/register");

  // Fill registration form
  await page.fill('[data-testid="email"]', user.email);
  await page.fill('[data-testid="password"]', user.password);
  await page.fill('[data-testid="fullName"]', user.fullName);
  await page.fill('[data-testid="phoneNumber"]', user.phoneNumber);
  await page.fill(
    '[data-testid="description"]',
    `Test description for ${user.fullName}. This is a test user created for E2E testing.`
  );

  // Submit form
  await page.click('[data-testid="register-button"]');

  // Wait for the form submission to complete
  await page.waitForLoadState("networkidle");

  // Check if there are any error messages
  const errorElement = page.locator('[data-testid="error-message"]');
  if (await errorElement.isVisible()) {
    const errorText = await errorElement.textContent();
    console.log("Registration error:", errorText);
    throw new Error(`Registration failed: ${errorText}`);
  }

  // Wait for navigation to login page or check for success
  try {
    await expect(page).toHaveURL("/login", {timeout: 10000});
  } catch (error) {
    // If we're still on register page, check if there's a success message
    const currentUrl = page.url();
    console.log("Current URL after registration:", currentUrl);

    if (currentUrl.includes("/register")) {
      // Check if there's a success message
      const successElement = page.locator('[data-testid="success-message"]');
      if (await successElement.isVisible()) {
        console.log("Registration successful but still on register page");
        // Try to navigate to login manually
        await page.goto("/login");
      } else {
        throw new Error(
          "Registration failed - still on register page with no success message"
        );
      }
    } else {
      throw error;
    }
  }
}

/**
 * Register and login a new test user in one flow
 */
export async function registerAndLoginUser(
  page: Page,
  user: TestUser
): Promise<void> {
  await registerNewUser(page, user);
  await loginWithCredentials(page, user);
}

/**
 * Logout current user
 */
export async function logoutUser(page: Page): Promise<void> {
  // Click user avatar/menu
  await page.click('[data-testid="user-avatar"]');

  // Click logout option
  await page.click('[data-testid="logout-button"]');

  // Should redirect to login page
  await expect(page).toHaveURL("/login");
}

/**
 * Check if user is logged in
 */
export async function isUserLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="user-avatar"]', {timeout: 5000});
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for user to be logged in
 */
export async function waitForUserLogin(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="user-avatar"]', {timeout: 10000});
}

/**
 * Wait for user to be logged out
 */
export async function waitForUserLogout(page: Page): Promise<void> {
  await expect(page).toHaveURL("/login");
}

/**
 * Clear all browser storage and ensure clean state
 */
export async function clearBrowserState(page: Page): Promise<void> {
  // Clear cookies
  await page.context().clearCookies();

  // Navigate to the app first to ensure we can access localStorage
  await page.goto("http://localhost:3000");

  // Clear localStorage and sessionStorage
  await page.evaluate(() => {
    // @ts-ignore - localStorage and sessionStorage are available in browser context
    localStorage.clear();
    // @ts-ignore - localStorage and sessionStorage are available in browser context
    sessionStorage.clear();
  });
}
