import { test, expect } from './global-test-hook';
import { env } from './utils/env';

test.describe('URL Routing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should redirect home to user URL and display user card', async ({ page }) => {
    // Navigate to the home page
    await page.goto(env.FRONTEND_URL);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Check that the URL has been updated to include a user ID pattern
    await page.waitForURL(/\/user\/\d+/);

    // Verify the URL follows the expected pattern
    expect(page.url()).toMatch(/\/user\/\d+$/);
  });

  test('should navigate to next user when Next button is enabled', async ({ page }) => {
    // Navigate to the home page
    await page.goto(env.FRONTEND_URL);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await page.waitForURL(/\/user\/\d+/);

    // Get initial user data
    const initialUrl = page.url();

    // Click Next button
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // Wait for URL to change
    await page.waitForURL(url => url.toString() !== initialUrl);

    // Verify URL pattern is maintained but different
    expect(page.url()).toMatch(/\/user\/\d+$/);
    expect(page.url()).not.toBe(initialUrl);

    // Verify that navigation was successful by checking URL change
    const newUrl = page.url();
    expect(newUrl).not.toBe(initialUrl);
    expect(newUrl).toMatch(/\/user\/\d+$/);
  });

  test('should handle disabled Next button at end of user list', async ({ page }) => {
    // Navigate to the home page
    await page.goto(env.FRONTEND_URL);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await page.waitForURL(/\/user\/\d+/);

    // Navigate to the last user by clicking Next until disabled
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();

    // Keep clicking Next until it's disabled
    while (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(100); // Small delay to allow state update
    }

    // Verify Next button is now disabled
    await expect(nextButton).toBeDisabled();
  });

  test('should navigate to previous user when Previous button is enabled', async ({ page }) => {
    // Navigate to home and wait for initial load
    await page.goto(env.FRONTEND_URL);
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await page.waitForURL(/\/user\/\d+/);

    // Get the original URL before clicking Next
    const originalUrl = page.url();

    // Navigate to next user first
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // Wait for URL to change to a different user
    await page.waitForURL(url => {
      const currentUrl = url.toString();
      return currentUrl !== originalUrl && !!currentUrl.match(/\/user\/\d+$/);
    });

    // Get the URL after clicking Next
    const urlAfterNext = page.url();

    // Now click Previous
    const previousButton = page.getByRole('button', { name: 'Previous' });
    await expect(previousButton).toBeVisible();
    await expect(previousButton).toBeEnabled();

    // Click Previous and wait for navigation
    await previousButton.click();

    // Wait for URL to change back to original URL
    await page.waitForURL(originalUrl, { timeout: 10000 });

    // Verify URL pattern is maintained and we're back to original URL
    expect(page.url()).toMatch(/\/user\/\d+$/);
    expect(page.url()).toBe(originalUrl);
    expect(page.url()).not.toBe(urlAfterNext);

    // Verify user data has changed back
    const userNameAfterPrevious = page.locator('[data-testid="user-card"] h4');
    await expect(userNameAfterPrevious).toBeVisible();

    // Verify that navigation was successful by checking URL change
    const urlAfterPrevious = page.url();
    expect(urlAfterPrevious).not.toBe(urlAfterNext);
    expect(urlAfterPrevious).toMatch(/\/user\/\d+$/);
  });

  test('should handle disabled Previous button at start of user list', async ({ page }) => {
    // Navigate to home and wait for initial load
    await page.goto(env.FRONTEND_URL);
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await page.waitForURL(/\/user\/\d+/);

    // Navigate to the first user by clicking Previous until disabled
    const previousButton = page.getByRole('button', { name: 'Previous' });
    await expect(previousButton).toBeVisible();

    // Keep clicking Previous until it's disabled
    while (await previousButton.isEnabled()) {
      await previousButton.click();
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(100); // Small delay to allow state update
    }

    // Verify Previous button is now disabled
    await expect(previousButton).toBeDisabled();
  });

  test('should handle direct URL access to specific users', async ({ page }) => {
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
