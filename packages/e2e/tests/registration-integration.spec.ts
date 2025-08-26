import { test, expect } from './global-test-hook';
import { generateTestUser } from './utils/test-data';

test.describe('Registration Integration', () => {
  test('should successfully register user with LinkedIn and campaign URLs', async ({ page }) => {
    const testUser = generateTestUser();

    await page.goto('/register');

    // Fill all required fields
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.fill('[data-testid="confirmPassword"]', testUser.password);
    await page.fill('[data-testid="fullName"]', testUser.fullName);
    await page.fill('[data-testid="phoneNumber"]', testUser.phoneNumber);
    await page.fill(
      '[data-testid="description"]',
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );

    // Fill LinkedIn and campaign URLs
    await page.fill('[data-testid="linkedinUrl"]', testUser.linkedinUrl ?? '');
    await page.fill('[data-testid="campaignUrl"]', testUser.campaignUrl ?? '');

    // Verify all fields are filled correctly
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue(testUser.fullName);
    await expect(page.locator('[data-testid="phoneNumber"]')).toHaveValue(testUser.phoneNumber);
    await expect(page.locator('[data-testid="linkedinUrl"]')).toHaveValue(testUser.linkedinUrl ?? '');
    await expect(page.locator('[data-testid="campaignUrl"]')).toHaveValue(testUser.campaignUrl ?? '');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Wait for form submission to complete
    await page.waitForLoadState('domcontentloaded');

    // Check for success - either redirect to login or success message
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();

    // Check for success - should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should handle registration with only LinkedIn URL', async ({ page }) => {
    const testUser = generateTestUser();

    await page.goto('/register');

    // Fill all required fields
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.fill('[data-testid="confirmPassword"]', testUser.password);
    await page.fill('[data-testid="fullName"]', testUser.fullName);
    await page.fill('[data-testid="phoneNumber"]', testUser.phoneNumber);
    await page.fill(
      '[data-testid="description"]',
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );

    // Fill only LinkedIn URL
    await page.fill('[data-testid="linkedinUrl"]', testUser.linkedinUrl ?? '');
    // Leave campaign URL empty

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Wait for form submission to complete
    await page.waitForLoadState('domcontentloaded');

    // Should succeed even with only LinkedIn URL
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();
  });

  test('should handle registration with only campaign URL', async ({ page }) => {
    const testUser = generateTestUser();

    await page.goto('/register');

    // Fill all required fields
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.fill('[data-testid="confirmPassword"]', testUser.password);
    await page.fill('[data-testid="fullName"]', testUser.fullName);
    await page.fill('[data-testid="phoneNumber"]', testUser.phoneNumber);
    await page.fill(
      '[data-testid="description"]',
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );

    // Fill only campaign URL
    await page.fill('[data-testid="campaignUrl"]', testUser.campaignUrl ?? '');
    // Leave LinkedIn URL empty

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Wait for form submission to complete
    await page.waitForLoadState('domcontentloaded');

    // Should succeed even with only campaign URL
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();
  });

  test('should handle registration without LinkedIn or campaign URLs', async ({ page }) => {
    const testUser = generateTestUser();

    await page.goto('/register');

    // Fill all required fields only
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.fill('[data-testid="confirmPassword"]', testUser.password);
    await page.fill('[data-testid="fullName"]', testUser.fullName);
    await page.fill('[data-testid="phoneNumber"]', testUser.phoneNumber);
    await page.fill(
      '[data-testid="description"]',
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );

    // Leave LinkedIn and campaign URLs empty

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Wait for form submission to complete
    await page.waitForLoadState('domcontentloaded');

    // Should succeed without optional URLs
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();
  });

  test('should validate LinkedIn URL format', async ({ page }) => {
    await page.goto('/register');

    // Fill required fields
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'This is a detailed description of the help I need.');

    // Fill invalid LinkedIn URL
    await page.fill('[data-testid="linkedinUrl"]', 'not-a-valid-url');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show validation error for LinkedIn URL
    await expect(page.locator('[data-testid="linkedinUrl"]')).toHaveAttribute('aria-invalid', 'true');
  });

  test('should validate campaign URL format', async ({ page }) => {
    await page.goto('/register');

    // Fill required fields
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'This is a detailed description of the help I need.');

    // Fill invalid campaign URL
    await page.fill('[data-testid="campaignUrl"]', 'invalid-url-format');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show validation error for campaign URL
    await expect(page.locator('[data-testid="campaignUrl"]')).toHaveAttribute('aria-invalid', 'true');
  });
});
