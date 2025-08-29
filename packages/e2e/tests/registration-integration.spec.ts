import { test, expect } from './global-test-hook';
import { generateTestUser } from './utils/test-data';

test.describe('Registration Integration', () => {
  test('should handle complete registration workflow with all optional URLs', async ({ page }) => {
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

    // Fill LinkedIn, campaign, Facebook, and Telegram URLs
    await page.fill('[data-testid="linkedinUrl"]', testUser.linkedinUrl ?? '');
    await page.fill('[data-testid="campaignUrl"]', testUser.campaignUrl ?? '');
    await page.fill('[data-testid="facebookUrl"]', testUser.facebookUrl ?? '');
    await page.fill('[data-testid="telegramUrl"]', testUser.telegramUrl ?? '');

    // Verify all fields are filled correctly
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue(testUser.fullName);
    await expect(page.locator('[data-testid="phoneNumber"]')).toHaveValue(testUser.phoneNumber);
    await expect(page.locator('[data-testid="linkedinUrl"]')).toHaveValue(testUser.linkedinUrl ?? '');
    await expect(page.locator('[data-testid="campaignUrl"]')).toHaveValue(testUser.campaignUrl ?? '');
    await expect(page.locator('[data-testid="facebookUrl"]')).toHaveValue(testUser.facebookUrl ?? '');
    await expect(page.locator('[data-testid="telegramUrl"]')).toHaveValue(testUser.telegramUrl ?? '');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Wait for form submission to complete
    await page.waitForLoadState('domcontentloaded');

    // Check for success - either redirect to login or success message
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();

    // Check for success - should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should handle registration with partial optional URLs and validation', async ({ page }) => {
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

    // Test registration with only campaign URL
    await page.goto('/register');
    await page.fill('[data-testid="email"]', generateTestUser().email);
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

    // Test registration without any optional URLs
    await page.goto('/register');
    await page.fill('[data-testid="email"]', generateTestUser().email);
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

  test('should validate URL formats for all optional URLs', async ({ page }) => {
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

    // Test invalid campaign URL
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test2@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User 2');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'This is a detailed description of the help I need.');

    // Fill invalid campaign URL
    await page.fill('[data-testid="campaignUrl"]', 'invalid-url-format');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show validation error for campaign URL
    await expect(page.locator('[data-testid="campaignUrl"]')).toHaveAttribute('aria-invalid', 'true');

    // Test invalid Facebook URL
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test3@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User 3');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'This is a detailed description of the help I need.');

    // Fill invalid Facebook URL
    await page.fill('[data-testid="facebookUrl"]', 'not-a-valid-facebook-url');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show validation error for Facebook URL
    await expect(page.locator('[data-testid="facebookUrl"]')).toHaveAttribute('aria-invalid', 'true');

    // Test invalid Telegram URL
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test4@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User 4');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'This is a detailed description of the help I need.');

    // Fill invalid Telegram URL
    await page.fill('[data-testid="telegramUrl"]', 'invalid-telegram-format');

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show validation error for Telegram URL
    await expect(page.locator('[data-testid="telegramUrl"]')).toHaveAttribute('aria-invalid', 'true');
  });
});
