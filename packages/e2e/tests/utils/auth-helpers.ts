import { Page, expect } from '@playwright/test';
import { TestUser, PREDEFINED_TEST_USERS, generateTestUser } from './test-data';
import { env } from './env';

/**
 * Authentication helper functions for E2E tests
 */

/**
 * Login as a predefined test user
 */
export async function loginAsUser(page: Page, userType: keyof typeof PREDEFINED_TEST_USERS): Promise<void> {
  const user = PREDEFINED_TEST_USERS[userType];
  if (!user) {
    throw new Error(`User type ${userType} not found in PREDEFINED_TEST_USERS`);
  }
  await loginWithCredentials(page, user, userType);
}

/**
 * Register and login with a unique test user
 */
export async function registerAndLoginUniqueUser(page: Page): Promise<TestUser> {
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
  user: TestUser,
  userType?: keyof typeof PREDEFINED_TEST_USERS
): Promise<void> {
  await page.goto('/login');

  // Fill login form
  await page.fill('[data-testid="email"]', user.email);
  await page.fill('[data-testid="password"]', user.password);

  // Submit form
  await page.click('[data-testid="login-button"]');

  // Wait for successful login - check for dashboard elements based on user type
  if (userType === 'admin') {
    // Admin users should be redirected to admin dashboard
    await page.waitForSelector('[data-testid="admin-dashboard-title"]');
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();
    await expect(page).toHaveURL('/admin/dashboard');
  } else {
    // Regular users should be redirected to regular dashboard
    await page.waitForSelector('[data-testid="dashboard-title"]');
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  }
}

/**
 * Register a new test user
 */
export async function registerNewUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');

  // Fill registration form
  await page.fill('[data-testid="email"]', user.email);
  await page.fill('[data-testid="password"]', user.password);
  await page.fill('[data-testid="confirmPassword"]', user.password);
  await page.fill('[data-testid="fullName"]', user.fullName);
  await page.fill('[data-testid="phoneNumber"]', user.phoneNumber);
  await page.fill(
    '[data-testid="description"]',
    `Test description for ${user.fullName}. This is a test user created for E2E testing.`
  );

  // Fill optional LinkedIn and campaign URLs if provided
  if (user.linkedinUrl) {
    await page.fill('[data-testid="linkedinUrl"]', user.linkedinUrl);
  }
  if (user.campaignUrl) {
    await page.fill('[data-testid="campaignUrl"]', user.campaignUrl);
  }

  // Submit form
  await page.click('[data-testid="register-button"]');

  // Wait for the form submission to complete
  await page.waitForLoadState('domcontentloaded');

  // Check if there are any error messages
  const errorElement = page.locator('[data-testid="error-message"]');
  if (await errorElement.isVisible()) {
    const errorText = await errorElement.textContent();
    console.log('Registration error:', errorText);
    throw new Error(`Registration failed: ${errorText}`);
  }

  // Wait for navigation to login page or check for success
  try {
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  } catch (error) {
    // If we're still on register page, check if there's a success message
    const currentUrl = page.url();
    console.log('Current URL after registration:', currentUrl);

    if (currentUrl.includes('/register')) {
      // Check if there's a success message
      const successElement = page.locator('[data-testid="success-message"]');
      if (await successElement.isVisible()) {
        console.log('Registration successful but still on register page');
        // Try to navigate to login manually
        await page.goto('/login');
      } else {
        throw new Error('Registration failed - still on register page with no success message');
      }
    } else {
      throw error;
    }
  }
}

/**
 * Register and login a new test user in one flow
 */
export async function registerAndLoginUser(page: Page, user: TestUser): Promise<void> {
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
  await expect(page).toHaveURL('/login');
}

/**
 * Check if user is logged in
 */
export async function isUserLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="user-avatar"]', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for user to be logged in
 */
export async function waitForUserLogin(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="user-avatar"]', { timeout: 10000 });
}

/**
 * Wait for user to be logged out
 */
export async function waitForUserLogout(page: Page): Promise<void> {
  await expect(page).toHaveURL('/login');
}

/**
 * Clear all browser storage and ensure clean state
 */
export async function clearBrowserState(page: Page): Promise<void> {
  // Clear cookies
  await page.context().clearCookies();

  // Navigate to the app first to ensure we can access localStorage
  await page.goto(env.FRONTEND_URL);

  // Clear localStorage and sessionStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Create a test user and verify them as admin so they appear in public cards
 */
export async function createAndVerifyTestUserViaUI(page: Page, user: TestUser): Promise<void> {
  // First register the user
  await registerNewUser(page, user);

  // Then login as admin to verify the user
  await loginAsUser(page, 'admin');

  // Navigate to admin dashboard
  await page.goto('/admin/dashboard');

  // Find and verify the user
  // This is a simplified version - in a real implementation you'd need to find the specific user
  // For now, we'll just verify the first pending user we find
  const verifyButtons = page.locator('button:has-text("Verify")');
  if ((await verifyButtons.count()) > 0) {
    await verifyButtons.first().click();

    // Handle the verification dialog
    const remarksInput = page.locator('input[placeholder*="remarks"], textarea[placeholder*="remarks"]');
    if (await remarksInput.isVisible()) {
      await remarksInput.fill('Verified for testing');
    }

    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Verify")');
    await confirmButton.click();
  }

  // Logout admin
  await logoutUser(page);
}
