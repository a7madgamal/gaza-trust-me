import { test, expect } from './global-test-hook';
import { loginAsUser, clearBrowserState } from './utils/auth-helpers';
import { env } from './utils/env';

test.describe('Enhanced Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should display verify and flag buttons for pending users', async ({ page }) => {
    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin dashboard
    await page.goto(`${env.FRONTEND_URL}/admin/dashboard`);

    // Wait for dashboard to load
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();

    // Check that verify and flag buttons are present for users
    const verifyButtons = page.getByRole('button', { name: 'Verify' });
    const flagButtons = page.getByRole('button', { name: 'Flag' });

    await expect(verifyButtons.first()).toBeVisible();
    await expect(flagButtons.first()).toBeVisible();
  });

  test('should display clickable WhatsApp phone numbers', async ({ page }) => {
    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin dashboard
    await page.goto(`${env.FRONTEND_URL}/admin/dashboard`);

    // Wait for dashboard to load
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();

    // Wait for users table to load
    await expect(page.getByTestId('users-table')).toBeVisible();

    // Check that phone numbers are clickable WhatsApp links
    // Look for any link that has a WhatsApp href pattern
    const whatsappLinks = page.locator('a[href*="wa.me"]');
    await expect(whatsappLinks.first()).toBeVisible();
    await expect(whatsappLinks.first()).toHaveAttribute('target', '_blank');
    await expect(whatsappLinks.first()).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should handle verify action with confirmation dialog', async ({ page }) => {
    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin dashboard
    await page.goto(`${env.FRONTEND_URL}/admin/dashboard`);

    // Wait for dashboard to load
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();

    // Click first verify button
    const verifyButton = page.getByRole('button', { name: 'Verify' }).first();
    await verifyButton.click();

    // Check that confirmation dialog appears
    await expect(page.getByTestId('action-dialog')).toBeVisible();
    await expect(page.getByTestId('action-dialog-title')).toHaveText('Verify User');

    // Check that remarks input is present
    await expect(page.getByTestId('remarks-input')).toBeVisible();

    // Cancel the action
    await page.getByTestId('cancel-action-button').click();

    // Dialog should close
    await expect(page.getByTestId('action-dialog')).toBeHidden();
  });

  test('should handle flag action with confirmation dialog', async ({ page }) => {
    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin dashboard
    await page.goto(`${env.FRONTEND_URL}/admin/dashboard`);

    // Wait for dashboard to load
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();

    // Click first flag button
    const flagButton = page.getByRole('button', { name: 'Flag' }).first();
    await flagButton.click();

    // Check that confirmation dialog appears
    await expect(page.getByTestId('action-dialog')).toBeVisible();
    await expect(page.getByTestId('action-dialog-title')).toHaveText('Flag User');

    // Check that remarks input is present
    await expect(page.getByTestId('remarks-input')).toBeVisible();

    // Cancel the action
    await page.getByTestId('cancel-action-button').click();

    // Dialog should close
    await expect(page.getByTestId('action-dialog')).toBeHidden();
  });

  test('should display status filter functionality', async ({ page }) => {
    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin dashboard
    await page.goto(`${env.FRONTEND_URL}/admin/dashboard`);

    // Wait for dashboard to load
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();

    // Check that status filter is present
    const statusFilter = page.getByTestId('status-filter');
    await expect(statusFilter).toBeVisible();

    // Test filtering by pending status
    await statusFilter.click();
    await page.getByRole('option', { name: 'Pending' }).click();

    // Should show filtered results
    await expect(page.getByTestId('users-table')).toBeVisible();
  });

  test('should display super admin role management for super admins', async ({ page }) => {
    // Login as super admin
    await loginAsUser(page, 'superAdmin');

    // Navigate to admin dashboard
    await page.goto(`${env.FRONTEND_URL}/admin/dashboard`);

    // Wait for dashboard to load
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();

    // Check that upgrade buttons are present for super admins
    const upgradeButtons = page.getByRole('button', { name: 'Make Admin' });
    await expect(upgradeButtons.first()).toBeVisible();
  });

  test('should display verified users as clickable links', async ({ page }) => {
    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin dashboard
    await page.goto(`${env.FRONTEND_URL}/admin/dashboard`);

    // Wait for dashboard to load
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();

    // Wait for users table to load
    await expect(page.getByTestId('users-table')).toBeVisible();

    // Check that verified user names are clickable links
    // Look for any link that has a user URL pattern
    const userLinks = page.locator('a[href*="/user/"]');
    await expect(userLinks.first()).toBeVisible();
    await expect(userLinks.first()).toHaveAttribute('href', /\/user\/\d+/);
  });
});
