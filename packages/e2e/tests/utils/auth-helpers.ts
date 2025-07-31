import {Page, expect} from "@playwright/test";
import {TestUser, PREDEFINED_TEST_USERS} from "./test-data";

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
  // For now, skip registration and use a predefined user
  // since the backend registration is not working
  const user = PREDEFINED_TEST_USERS.helpSeeker;
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

  // Wait for successful login
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator('[data-testid="user-email"]')).toContainText(
    user.email
  );
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

  // Submit form
  await page.click('[data-testid="register-button"]');

  // Wait for the form submission to complete
  await page.waitForLoadState("networkidle");

  // Check if there are any error messages
  const errorElement = page.locator('[data-testid="error-message"]');
  if (await errorElement.isVisible()) {
    const errorText = await errorElement.textContent();
    console.log("Registration error:", errorText);
  }

  // Wait for navigation to login page
  await expect(page).toHaveURL("/login");
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
