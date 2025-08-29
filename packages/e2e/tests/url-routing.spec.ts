import { test, expect } from './global-test-hook';
import { env } from './utils/env';

test.describe('URL Routing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should handle complete navigation flow with home redirect and user data changes', async ({ page }) => {
    // Navigate to the home page
    await page.goto(env.FRONTEND_URL);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Check that the URL has been updated to include a user ID pattern
    await page.waitForURL(/\/user\/\d+/);

    // Verify the URL follows the expected pattern
    expect(page.url()).toMatch(/\/user\/\d+$/);

    // Get initial user data
    const initialUrl = page.url();
    const initialUserName = await page.locator('[data-testid="user-card"] h4').textContent();

    // Click Next button if available
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();

    // Only proceed if Next button is enabled
    const isNextDisabled = await nextButton.isDisabled();
    if (!isNextDisabled) {
      await nextButton.click();

      // Wait for URL to change
      await page.waitForURL(url => url.toString() !== initialUrl);

      // Verify URL pattern is maintained but different
      expect(page.url()).toMatch(/\/user\/\d+$/);
      expect(page.url()).not.toBe(initialUrl);

      // Verify user data has changed
      const newUserName = page.locator('[data-testid="user-card"] h4');
      if (!initialUserName) {
        throw new Error('Initial user name is null');
      }
      await expect(newUserName).not.toHaveText(initialUserName);
    } else {
      // If Next is disabled, we might be at the end of the list
      // This is acceptable behavior
      console.log('Next button is disabled - likely at end of user list');
    }
  });

  test('should handle Previous navigation and direct URL access to specific users', async ({ page }) => {
    // Navigate to home and wait for initial load
    await page.goto(env.FRONTEND_URL);
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await page.waitForURL(/\/user\/\d+/);

    // Navigate to next user first if possible
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();

    const isNextDisabled = await nextButton.isDisabled();
    if (!isNextDisabled) {
      await nextButton.click();

      // Wait for URL to change
      await page.waitForURL(url => !url.toString().endsWith('/'));

      // Get the URL after clicking Next
      const urlAfterNext = page.url();
      const userNameAfterNext = await page.locator('[data-testid="user-card"] h4').textContent();

      // Now click Previous
      const previousButton = page.getByRole('button', { name: 'Previous' });
      await expect(previousButton).toBeVisible();
      await previousButton.click();

      // Wait for URL to change back
      await page.waitForURL(url => url.toString() !== urlAfterNext);

      // Verify URL pattern is maintained but different from the "next" URL
      expect(page.url()).toMatch(/\/user\/\d+$/);
      expect(page.url()).not.toBe(urlAfterNext);

      // Verify user data has changed back
      const userNameAfterPrevious = page.locator('[data-testid="user-card"] h4');
      if (!userNameAfterNext) {
        throw new Error('User name after next is null');
      }
      await expect(userNameAfterPrevious).not.toHaveText(userNameAfterNext);
    } else {
      // If Next is disabled, Previous should also be disabled (we're at the first user)
      const previousButton = page.getByRole('button', { name: 'Previous' });
      await expect(previousButton).toBeDisabled();
      console.log('Both Next and Previous buttons are disabled - likely only one user in the system');
    }

    // Test direct URL access to specific users
    await page.goto(`${env.FRONTEND_URL}/user/1`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Verify the URL is maintained
    expect(page.url()).toMatch(/\/user\/1$/);

    // Verify user data is displayed
    await expect(page.locator('[data-testid="user-card"] h4')).toBeVisible();
  });
});
