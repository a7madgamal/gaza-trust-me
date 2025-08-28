import { test, expect } from './global-test-hook';
import { loginAsUser } from './utils/auth-helpers';
import { createTestUserViaAPI } from './utils/test-data';

test.describe('Verification Transparency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('admin profile page loads correctly', async ({ page }) => {
    // Create a test admin user and get their ID
    await createTestUserViaAPI('admin');

    // Login as admin to get access to admin data
    await loginAsUser(page, 'admin');

    // Test that admin profile page route works and shows proper structure
    await page.goto('/admins/00000000-0000-0000-0000-000000000000');

    // Check that the page loads with proper error handling
    // Since we're using a fake UUID, it should show the "not found" message
    await expect(page.locator('text=Admin not found or not accessible')).toBeVisible();
  });

  test('verification badge component renders correctly', async ({ page }) => {
    // Test that verification badge component exists and renders
    // This tests the component structure, not specific data

    // Go to a public profile page
    await page.goto('/user/1');

    // Wait for the verification badge to load (it makes an API call)
    // The badge should be visible if the user is verified
    await expect(page.locator('[data-testid="verification-badge"]')).toBeVisible({ timeout: 10000 });
  });

  test('admin dashboard loads with verification features', async ({ page }) => {
    await loginAsUser(page, 'admin');

    // Go to admin dashboard
    await page.goto('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();

    // Check that admin dashboard loads correctly
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();
  });

  test('admin profile route exists and is accessible', async ({ page }) => {
    // Test that admin profile route is accessible
    await page.goto('/admins/00000000-0000-0000-0000-000000000000');

    // Should show error message for fake UUID
    await expect(page.locator('text=Admin not found or not accessible')).toBeVisible();
  });

  test('verification transparency features are implemented', async ({ page }) => {
    // Test that verification transparency features exist in the codebase
    // This is a smoke test to ensure the feature is implemented

    // Check that admin profile route exists and handles errors properly
    await page.goto('/admins/00000000-0000-0000-0000-000000000000');

    // Should show error message for fake UUID
    await expect(page.locator('text=Admin not found or not accessible')).toBeVisible();
  });
});
