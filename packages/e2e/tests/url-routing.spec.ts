import { test, expect } from '@playwright/test';
import { createTestUser, cleanupTestUser } from './utils/test-data';

test.describe('URL Routing Tests', () => {
  let testUserIds: number[] = [];

  test.beforeAll(async () => {
    // Create multiple test users for navigation testing
    const user1Id = await createTestUser({
      full_name: 'Test User One',
      description: 'First test user for navigation',
      phone_number: '+1234567891',
      role: 'help_seeker',
      status: 'verified',
      linkedin_url: 'https://linkedin.com/in/test-user-one',
      campaign_url: 'https://gofundme.com/test-campaign-one',
    });

    const user2Id = await createTestUser({
      full_name: 'Test User Two',
      description: 'Second test user for navigation',
      phone_number: '+1234567892',
      role: 'help_seeker',
      status: 'verified',
      linkedin_url: 'https://linkedin.com/in/test-user-two',
      campaign_url: 'https://gofundme.com/test-campaign-two',
    });

    const user3Id = await createTestUser({
      full_name: 'Test User Three',
      description: 'Third test user for navigation',
      phone_number: '+1234567893',
      role: 'help_seeker',
      status: 'verified',
      linkedin_url: 'https://linkedin.com/in/test-user-three',
      campaign_url: 'https://gofundme.com/test-campaign-three',
    });

    testUserIds = [user1Id, user2Id, user3Id];
  });

  test.afterAll(async () => {
    // Clean up test users
    for (const userId of testUserIds) {
      await cleanupTestUser(userId);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should redirect home to user URL pattern', async ({ page }) => {
    // Navigate to the home page
    await page.goto(`${process.env['FRONTEND_URL']}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Check that the URL has been updated to include a user ID pattern
    await page.waitForURL(/\/user\/\d+/);

    // Verify the URL follows the expected pattern
    expect(page.url()).toMatch(/\/user\/\d+$/);
  });

  test('should change user data when navigating Next', async ({ page }) => {
    // Navigate to home and wait for initial load
    await page.goto(`${process.env['FRONTEND_URL']}`);
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await page.waitForURL(/\/user\/\d+/);

    // Get initial user data
    const initialUrl = page.url();
    const initialUserName = await page.locator('[data-testid="user-card"] h4').textContent();

    // Click Next button
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();
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
  });

  test('should change user data when navigating Previous', async ({ page }) => {
    // Navigate to home and wait for initial load
    await page.goto(`${process.env['FRONTEND_URL']}`);
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await page.waitForURL(/\/user\/\d+/);

    // Navigate to next user first to enable Previous button
    const nextButton = page.getByRole('button', { name: 'Next' });
    await nextButton.click();
    await page.waitForURL(/\/user\/\d+/);

    // Get current state
    const currentUrl = page.url();
    const currentUserName = await page.locator('[data-testid="user-card"] h4').textContent();

    // Click Previous button
    const previousButton = page.getByRole('button', { name: 'Previous' });
    await expect(previousButton).toBeVisible();
    await previousButton.click();

    // Wait for URL to change
    await page.waitForURL(url => url.toString() !== currentUrl);

    // Verify URL pattern is maintained but different
    expect(page.url()).toMatch(/\/user\/\d+$/);
    expect(page.url()).not.toBe(currentUrl);

    // Verify user data has changed
    const newUserName = page.locator('[data-testid="user-card"] h4');
    if (!currentUserName) {
      throw new Error('Current user name is null');
    }
    await expect(newUserName).not.toHaveText(currentUserName);
  });
});
