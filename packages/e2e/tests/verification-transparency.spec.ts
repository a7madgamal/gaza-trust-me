import { test, expect } from './global-test-hook';
import { loginAsUser, clearBrowserState } from './utils/auth-helpers';
import { createTestUserViaAPI } from './utils/test-data';
import { env } from './utils/env';

test.describe('Verification Transparency', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should handle verification badge display and linking for verified and unverified users', async ({ page }) => {
    // Test unverified user - should not show badge
    const unverifiedUrlId = await createTestUserViaAPI('helpSeekerPending');
    await page.goto(`${env.FRONTEND_URL}/user/${unverifiedUrlId}`);
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="verification-badge"]')).toBeHidden();

    // Test admin profile verification badge functionality
    await createTestUserViaAPI('admin');
    await loginAsUser(page, 'admin');
    await page.goto(`${env.FRONTEND_URL}/admins/43e3b47a-f4d0-4a5f-9aad-eeddfa721c92`);

    // Should show admin profile
    await expect(page.getByText('Admin Profile')).toBeVisible();

    // Should show verification activity section
    await expect(page.getByText('Verification Activity')).toBeVisible();

    // Should show verification count
    await expect(page.getByText(/profiles verified/)).toBeVisible();
  });

  test('should display complete admin profile with verification information and contact details', async ({ page }) => {
    // Create an admin user first
    await createTestUserViaAPI('admin');

    // Login as admin to get their ID
    await loginAsUser(page, 'admin');

    // Navigate to the admin's profile using their known ID
    await page.goto(`${env.FRONTEND_URL}/admins/43e3b47a-f4d0-4a5f-9aad-eeddfa721c92`);

    // Should show admin profile
    await expect(page.getByText('Admin Profile')).toBeVisible();

    // Should show admin name
    await expect(page.getByRole('heading', { name: 'Ahmed Admn' })).toBeVisible();

    // Should show admin role
    await expect(page.getByText('Admin', { exact: true })).toBeVisible();

    // Should show verification activity section
    await expect(page.getByText('Verification Activity')).toBeVisible();

    // Should show verification count
    await expect(page.getByText(/profiles verified/)).toBeVisible();

    // Should show admin information section
    await expect(page.getByText('Admin Information')).toBeVisible();

    // Should show email
    await expect(page.getByText(/admin@admin\.com/)).toBeVisible();

    // Should show member since date
    await expect(page.getByText(/Member since/)).toBeVisible();

    // Should show verification summary
    await expect(page.getByText('Verification Summary')).toBeVisible();

    // Should show explanation text
    await expect(page.getByText(/This admin has verified/)).toBeVisible();
    await expect(page.getByText(/authenticity and legitimacy/)).toBeVisible();
  });

  test('should handle admin profile edge cases', async ({ page }) => {
    // Test non-existent admin profile
    await page.goto(`${env.FRONTEND_URL}/admins/00000000-0000-0000-0000-000000000000`);

    // Should show error message
    await expect(page.getByText('Admin not found or not accessible.')).toBeVisible();

    // Test accessing admin profile as non-admin user (should work - public access)
    await createTestUserViaAPI('helpSeeker');
    await loginAsUser(page, 'helpSeeker');
    await page.goto(`${env.FRONTEND_URL}/admins/43e3b47a-f4d0-4a5f-9aad-eeddfa721c92`);

    // Should show admin profile (public access allowed)
    await expect(page.getByText('Admin Profile')).toBeVisible();
  });
});
