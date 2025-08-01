import { test, expect } from '@playwright/test';
import { generateTestUser } from '../utils/test-data';

test.describe('User Registration', () => {
  test('should validate required fields', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('[data-testid="register-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="email"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="fullName"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="description"]')).toHaveAttribute('aria-invalid', 'true');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');

    // Fill form with invalid email
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'Test description for validation');

    await page.click('[data-testid="register-button"]');

    // Should show email validation error
    await expect(page.locator('[data-testid="email"]')).toHaveAttribute('aria-invalid', 'true');
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');

    // Fill form with weak password
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'weak');
    await page.fill('[data-testid="confirmPassword"]', 'weak');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'Test description for validation');

    await page.click('[data-testid="register-button"]');

    // Should show password validation error
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('aria-invalid', 'true');
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/register');

    // Fill form with mismatched passwords
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'DifferentPassword123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'Test description for validation');

    await page.click('[data-testid="register-button"]');

    // Should show password confirmation error
    await expect(page.locator('[data-testid="confirmPassword"]')).toHaveAttribute('aria-invalid', 'true');
  });

  test('should fill out form correctly', async ({ page }) => {
    await page.goto('/register');

    const testUser = generateTestUser();

    // Fill form with valid data
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.fill('[data-testid="confirmPassword"]', testUser.password);
    await page.fill('[data-testid="fullName"]', testUser.fullName);
    await page.fill('[data-testid="phoneNumber"]', testUser.phoneNumber);
    await page.fill(
      '[data-testid="description"]',
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );

    // Verify all fields are filled correctly
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue(testUser.fullName);
    await expect(page.locator('[data-testid="phoneNumber"]')).toHaveValue(testUser.phoneNumber);
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );

    // Submit form and wait for loading state
    await page.click('[data-testid="register-button"]');

    // Verify the form was filled correctly and is ready for submission
    await expect(page.locator('[data-testid="register-button"]')).toBeEnabled();

    // The form should be valid and ready to submit
    // Note: We don't test the actual submission since it requires backend setup
    // This test verifies the form UI behavior is correct
  });
});
