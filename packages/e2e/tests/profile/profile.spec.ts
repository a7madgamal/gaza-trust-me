import { test, expect } from '../global-test-hook';
import { clearBrowserState } from '../utils/auth-helpers';

test.describe('Profile Management', () => {
  test('should handle complete authentication flow and form validation', async ({ page }) => {
    await clearBrowserState(page);
    await page.goto('/profile');

    // Wait for authentication check to complete and redirect to happen
    await page.waitForURL('/login');

    // Assert we're on the login page
    await expect(page).toHaveURL(/.*login/);

    // Should show login form
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // Should show registration link
    await expect(page.getByText("Don't have an account?")).toBeVisible();
    await expect(page.getByText('Create one')).toBeVisible();

    // Try to submit empty form
    await page.click('[data-testid="login-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="email"]')).toHaveAttribute('aria-invalid', 'true');

    // Fill with invalid credentials
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should handle invalid token scenarios and authentication errors', async ({ page }) => {
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

    // Navigate to profile page
    await page.goto('/profile');

    // Should redirect to login due to invalid token
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');

    // Set up a mock session with invalid token
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
    await expect(page).toHaveURL('/login');
  });
});
