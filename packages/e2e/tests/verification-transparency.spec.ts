import { test, expect } from './global-test-hook';
import { loginAsUser } from './utils/auth-helpers';

test.describe('Verification Transparency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('admin profile page loads correctly', async ({ page }) => {
    // Test that admin profile page route works and shows proper structure
    await page.goto('/admins/test-admin-id');

    // Check admin profile page loads
    await expect(page.locator('text=Admin Profile')).toBeVisible();
    await expect(page.locator('text=Verification Activity')).toBeVisible();
    await expect(page.locator('text=Admin Information')).toBeVisible();
  });

  test('verification badge component renders correctly', async ({ page }) => {
    // Test that verification badge component exists and renders
    // This tests the component structure, not specific data

    // Go to a public profile page
    await page.goto('/user/1');

    // Check that verification badge component exists
    const verificationBadge = page.locator('[data-testid="verification-badge"]');
    await expect(verificationBadge).toBeVisible();
  });

  test('admin dashboard loads with verification features', async ({ page }) => {
    await loginAsUser(page, 'admin');

    // Go to admin dashboard
    await page.goto('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();

    // Check that admin dashboard loads correctly
    await expect(page.locator('text=Users')).toBeVisible();
  });

  test('admin profile route exists and is accessible', async ({ page }) => {
    // Test that admin profile route is accessible
    await page.goto('/admins/test-admin-id');

    // Should show admin profile page
    await expect(page.locator('text=Admin Profile')).toBeVisible();
  });

  test('verification transparency features are implemented', async ({ page }) => {
    // Test that verification transparency features exist in the codebase
    // This is a smoke test to ensure the feature is implemented

    // Check that admin profile route exists
    await page.goto('/admins/test-admin-id');

    // Should show admin profile page
    await expect(page.locator('text=Admin Profile')).toBeVisible();
  });
});
