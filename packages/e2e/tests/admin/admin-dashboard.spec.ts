import { test, expect } from '../global-test-hook';
import { loginAsUser, clearBrowserState } from '../utils/auth-helpers';
import { createTestUserViaAPI } from '../utils/test-data';
import { env } from '../utils/env';

test.describe('Admin Dashboard', () => {
  test.beforeAll(async () => {
    // Create admin user
    await createTestUserViaAPI('admin');

    // Create super admin user
    await createTestUserViaAPI('superAdmin');

    // Create help seeker user
    await createTestUserViaAPI('helpSeeker');
  });

  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should handle authentication and access control for different user types', async ({ page }) => {
    // Test non-admin user access
    await loginAsUser(page, 'helpSeeker');
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();

    // Test admin user access
    await clearBrowserState(page);
    await loginAsUser(page, 'admin');
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();

    // Test unauthenticated access
    await clearBrowserState(page);
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should display complete users table with filtering and navigation functionality', async ({ page }) => {
    await loginAsUser(page, 'admin');
    await page.goto('/admin/dashboard');

    // Wait for the admin dashboard to load
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();

    // Wait for the users table to be visible
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Check for expected column headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Phone")')).toBeVisible();
    await expect(page.locator('th:has-text("Role")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Description")')).toBeVisible();
    await expect(page.locator('th:has-text("Created")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();

    // Test status filtering
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();
    await page.locator('[role="option"]:has-text("Pending")').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="status-filter"]')).toContainText('Pending');

    // Test verified user navigation
    await statusFilter.click();
    await page.locator('[role="option"]:has-text("Verified")').click();
    await page.waitForLoadState('domcontentloaded');

    const verifiedRows = page.locator('tbody tr').filter({
      has: page.locator('td:nth-child(5)').filter({ hasText: 'verified' }),
    });

    const firstVerifiedRow = verifiedRows.first();
    const nameCell = firstVerifiedRow.locator('td:first-child');
    const nameLink = nameCell.locator('a');
    await expect(nameLink).toBeVisible();

    const href = await nameLink.getAttribute('href');
    expect(href).toMatch(/^\/user\/\d+$/);

    await nameLink.click();
    await expect(page).toHaveURL(new RegExp(`^${env.FRONTEND_URL}/user/\\d+$`));
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
  });

  test('should handle super admin role management with upgrade and downgrade functionality', async ({ page }) => {
    await loginAsUser(page, 'superAdmin');
    await page.goto('/admin/dashboard');

    // Wait for the admin dashboard to load
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();

    // Wait for the table to load
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // Test upgrade to admin functionality
    const makeAdminButton = page.locator('[data-testid^="upgrade-to-admin-"]').first();
    await expect(makeAdminButton).toBeVisible();
    await expect(makeAdminButton).toHaveText('Make Admin');

    // Get the user ID from the button's data-testid
    const buttonTestId = await makeAdminButton.getAttribute('data-testid');
    const userId = buttonTestId?.replace('upgrade-to-admin-', '');

    // Click the upgrade button
    await makeAdminButton.click();

    // Verify the role upgrade dialog appears
    await expect(page.locator('[data-testid="role-upgrade-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-upgrade-dialog-title"]')).toHaveText('Upgrade to Admin');

    // Add remarks
    const remarksInput = page.locator('[data-testid="role-upgrade-remarks-input"] textarea').first();
    await remarksInput.fill('Promoting to admin for testing');

    // Confirm the upgrade
    await page.locator('[data-testid="confirm-role-upgrade-button"]').click();

    // Wait for success message
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('upgraded to admin');

    // Verify the dialog is closed
    await expect(page.locator('[data-testid="role-upgrade-dialog"]')).toBeHidden();

    // Wait for the table to refresh and verify the user is no longer visible
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator(`[data-testid="upgrade-to-admin-${userId}"]`)).toBeHidden();
  });

  test('should verify role upgrade button visibility for different user types', async ({ page }) => {
    // Test regular admin - should not see upgrade buttons
    await loginAsUser(page, 'admin');
    await page.goto('/admin/dashboard');

    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // Verify that role upgrade buttons are not visible for regular admins
    await expect(page.locator('[data-testid^="upgrade-to-admin-"]')).toBeHidden();
    await expect(page.locator('[data-testid^="downgrade-to-help-seeker-"]')).toBeHidden();

    // Test super admin - should not see upgrade buttons for super admin users
    await clearBrowserState(page);
    await loginAsUser(page, 'superAdmin');
    await page.goto('/admin/dashboard');

    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // Find super admin rows
    const superAdminRows = page.locator('tbody tr').filter({
      has: page.locator('td:nth-child(4)').filter({ hasText: 'super_admin' }),
    });

    // Verify that role upgrade buttons are not visible for super admin users
    for (let i = 0; i < (await superAdminRows.count()); i++) {
      const row = superAdminRows.nth(i);
      await expect(row.locator('[data-testid^="upgrade-to-admin-"]')).toBeHidden();
      await expect(row.locator('[data-testid^="downgrade-to-help-seeker-"]')).toBeHidden();
    }
  });
});
