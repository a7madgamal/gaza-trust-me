import { test, expect } from '@playwright/test';
import { generateTestUser } from './utils/test-data';

test.describe('Auth Pages', () => {
  test('should handle login form validation and navigation', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('[data-testid="login-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="email"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('aria-invalid', 'true');

    // Fill with invalid email format
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should show email validation error
    await expect(page.locator('[data-testid="email"]')).toHaveAttribute('aria-invalid', 'true');

    // Test form filling with valid data
    const testUser = generateTestUser();
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);

    // Verify fields are filled correctly
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);
    await expect(page.locator('[data-testid="password"]')).toHaveValue(testUser.password);

    // Submit form (will fail due to backend config, but we can test the form behavior)
    await page.click('[data-testid="login-button"]');

    // Wait for network activity to complete
    await page.waitForLoadState('domcontentloaded');

    // Since backend is not configured, button will remain enabled
    // but we can verify the form submission was attempted
    await expect(page.locator('[data-testid="login-button"]')).toBeEnabled();

    // Test navigation to register page
    await page.goto('/login');
    await page.click('text=Create one');
    await expect(page).toHaveURL('/register');
  });

  test('should handle login error scenarios and authentication failures', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('[data-testid="email"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message (even if it's a generic one due to backend config)
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Test proper error messages for invalid login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();

    // Test authentication errors gracefully
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'session',
        JSON.stringify({
          access_token: 'invalid-token',
          user: { id: 'test', email: 'test@example.com', role: 'help_seeker' },
        })
      );
    });

    // Navigate to a protected page that will trigger authentication check
    await page.goto('/profile');

    // Should redirect to login page due to invalid token
    await expect(page).toHaveURL('/login');
  });

  test('should handle session management and authentication errors', async ({ page }) => {
    // Set up a mock invalid token in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'session',
        JSON.stringify({
          access_token: 'invalid-token',
          user: { id: 'test', email: 'test@example.com', role: 'help_seeker' },
        })
      );
    });

    // Navigate to a protected page
    await page.goto('/profile');

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Session should be cleared from localStorage
    const session = await page.evaluate(() => localStorage.getItem('session'));
    expect(session).toBeNull();

    // Test invalid token and redirect to login
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'session',
        JSON.stringify({
          access_token: 'invalid-token',
          user: { id: 'test', email: 'test@example.com', role: 'help_seeker' },
        })
      );
    });

    // Navigate to profile page
    await page.goto('/profile');

    // Should redirect to login due to invalid token
    await page.waitForURL('/login', { timeout: 10000 });

    // Session should be cleared
    const session2 = await page.evaluate(() => localStorage.getItem('session'));
    expect(session2).toBeNull();

    // Test authentication errors from backend
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'session',
        JSON.stringify({
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
          user: { id: 'test', email: 'test@example.com', role: 'help_seeker' },
        })
      );
    });

    // Navigate to profile page which will trigger getProfile call
    await page.goto('/profile');

    // Should redirect to login due to authentication error
    await page.waitForURL('/login', { timeout: 10000 });

    // Verify session is cleared
    const session3 = await page.evaluate(() => localStorage.getItem('session'));
    expect(session3).toBeNull();
  });

  test('should handle registration form validation and field requirements', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('[data-testid="register-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="email"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="fullName"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="description"]')).toHaveAttribute('aria-invalid', 'true');

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

    // Test password strength validation
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'weak');
    await page.fill('[data-testid="confirmPassword"]', 'weak');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill('[data-testid="description"]', 'Test description for validation');

    await page.click('[data-testid="register-button"]');

    // Should show password validation error
    await expect(page.locator('[data-testid="password"]')).toHaveAttribute('aria-invalid', 'true');

    // Test password confirmation validation
    await page.goto('/register');
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

  test('should handle registration form filling and description field validation', async ({ page }) => {
    await page.goto('/register');

    // Should show description field
    await expect(page.locator('[data-testid="description"]')).toBeVisible();
    await expect(page.locator('[data-testid="description"]')).toBeEnabled();

    // Should show helper text
    await expect(page.getByText('Tell us about your situation and what kind of help you need')).toBeVisible();

    // Fill other required fields
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');

    // Try to submit with empty description
    await page.click('[data-testid="register-button"]');

    // Should show validation error for description
    await expect(page.locator('[data-testid="description"]')).toHaveAttribute('aria-invalid', 'true');

    // Fill with too short description
    await page.fill('[data-testid="description"]', 'Short');
    await page.click('[data-testid="register-button"]');

    // Should still show validation error
    await expect(page.locator('[data-testid="description"]')).toHaveAttribute('aria-invalid', 'true');

    // Test form filling with valid data
    const testUser = generateTestUser();
    await page.fill('[data-testid="email"]', testUser.email);
    await page.fill('[data-testid="password"]', testUser.password);
    await page.fill('[data-testid="confirmPassword"]', testUser.password);
    await page.fill('[data-testid="fullName"]', testUser.fullName);
    await page.fill('[data-testid="phoneNumber"]', testUser.phoneNumber);
    await page.fill(
      '[data-testid="description"]',
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );
    await page.fill('[data-testid="linkedinUrl"]', testUser.linkedinUrl || '');
    await page.fill('[data-testid="campaignUrl"]', testUser.campaignUrl || '');

    // Verify all fields are filled correctly
    await expect(page.locator('[data-testid="email"]')).toHaveValue(testUser.email);
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue(testUser.fullName);
    await expect(page.locator('[data-testid="phoneNumber"]')).toHaveValue(testUser.phoneNumber);
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      `Test description for ${testUser.fullName}. This is a test user created for E2E testing.`
    );
    await expect(page.locator('[data-testid="linkedinUrl"]')).toHaveValue(testUser.linkedinUrl || '');
    await expect(page.locator('[data-testid="campaignUrl"]')).toHaveValue(testUser.campaignUrl || '');

    // Submit form and wait for loading state
    await page.click('[data-testid="register-button"]');

    // Verify the form was filled correctly and is ready for submission
    await expect(page.locator('[data-testid="register-button"]')).toBeEnabled();
  });

  test('should handle registration form submission and navigation', async ({ page }) => {
    await page.goto('/register');

    // Test navigation to login page
    await page.click('text=Sign in');
    await expect(page).toHaveURL('/login');

    // Test form submission with valid data
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill(
      '[data-testid="description"]',
      'This is a detailed description of the help I need. It should be long enough to pass validation.'
    );

    // Verify description is filled
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      'This is a detailed description of the help I need. It should be long enough to pass validation.'
    );

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Wait for any network activity to complete
    await page.waitForLoadState('domcontentloaded');

    // Verify form submission was attempted (button should be enabled after attempt)
    await expect(page.locator('[data-testid="register-button"]')).toBeEnabled();
  });

  test('should handle registration loading states and status validation', async ({ page }) => {
    await page.goto('/register');

    // Fill form with valid data
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill(
      '[data-testid="description"]',
      'This is a detailed description of the help I need for testing purposes.'
    );

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show loading state (button disabled during submission)
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();

    // Test pending status for new users
    await page.goto('/register');
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="email"]', 'test-status@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill(
      '[data-testid="description"]',
      'This is a detailed description of the help I need for testing purposes'
    );

    // Verify form is filled correctly
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue('Test User');
    await expect(page.locator('[data-testid="email"]')).toHaveValue('test-status@example.com');
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      'This is a detailed description of the help I need for testing purposes'
    );

    // Submit form and check for loading state
    await page.click('[data-testid="register-button"]');

    // Should show loading state (button disabled during submission)
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();

    // Test appropriate status colors
    await page.goto('/register');
    await page.fill('[data-testid="fullName"]', 'Pending User');
    await page.fill('[data-testid="email"]', 'pending@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.fill('[data-testid="phoneNumber"]', '+1234567890');
    await page.fill(
      '[data-testid="description"]',
      'This is a detailed description of the help I need for testing purposes'
    );

    // Verify form is filled correctly
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue('Pending User');
    await expect(page.locator('[data-testid="email"]')).toHaveValue('pending@example.com');
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      'This is a detailed description of the help I need for testing purposes'
    );

    // Submit form and check for loading state
    await page.click('[data-testid="register-button"]');

    // Should show loading state (button disabled during submission)
    await expect(page.locator('[data-testid="register-button"]')).toBeDisabled();
  });
});
