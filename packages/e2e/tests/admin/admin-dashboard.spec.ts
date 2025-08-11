import { test, expect } from '@playwright/test';
import { loginAsUser, clearBrowserState } from '../utils/auth-helpers';
import { createTestUserViaAPI } from '../utils/test-data';
import { env } from '../utils/env';

test.describe('Admin Dashboard', () => {
  test.beforeAll(async () => {
    // Create admin user
    await createTestUserViaAPI('admin');

    // Create help seeker user
    await createTestUserViaAPI('helpSeeker');
  });

  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should redirect non-admin users to regular dashboard', async ({ page }) => {
    // Login as the fixed help seeker user
    await loginAsUser(page, 'helpSeeker');

    // Try to access admin dashboard
    await page.goto('/admin/dashboard');

    // Should be redirected to regular dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('should show admin dashboard for admin users', async ({ page }) => {
    // Login as admin
    await loginAsUser(page, 'admin');

    // After login, admin users should be redirected to admin dashboard
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-welcome-message"]')).toContainText('admin');
  });

  test('should display users table with correct columns', async ({ page }) => {
    await loginAsUser(page, 'admin');
    await page.goto('/admin/dashboard');

    // Check table headers
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
  });

  test('should filter users by status', async ({ page }) => {
    await loginAsUser(page, 'admin');
    await page.goto('/admin/dashboard');

    // Check status filter dropdown
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await expect(statusFilter).toBeVisible();

    // Test filtering by pending status
    await statusFilter.click();

    // Click on the dropdown option specifically, not any "Pending" text in the table
    await page.locator('[role="option"]:has-text("Pending")').click();

    // Wait for the filter to be applied
    await page.waitForLoadState('domcontentloaded');

    // Verify filter is applied by checking if the select shows "Pending"
    await expect(page.locator('[data-testid="status-filter"]')).toContainText('Pending');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access admin dashboard without logging in
    await page.goto('/admin/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should make verified user names clickable and link to card pages', async ({ page }) => {
    await loginAsUser(page, 'admin');
    await page.goto('/admin/dashboard');

    // Wait for the table to load
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // Filter by verified status first
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await statusFilter.click();
    await page.locator('[role="option"]:has-text("Verified")').click();

    // Wait for the filter to be applied
    await page.waitForLoadState('domcontentloaded');

    // Now look for verified users in the filtered table
    const verifiedRows = page.locator('tbody tr').filter({
      has: page.locator('td:nth-child(5)').filter({ hasText: 'verified' }),
    });

    // Get the first verified row
    const firstVerifiedRow = verifiedRows.first();

    // Find the name cell (first column) in this row
    const nameCell = firstVerifiedRow.locator('td:first-child');

    // Check if the name is a clickable link
    const nameLink = nameCell.locator('a');
    await expect(nameLink).toBeVisible();

    // Get the href attribute to verify it follows the /user/:urlId pattern
    const href = await nameLink.getAttribute('href');
    expect(href).toMatch(/^\/user\/\d+$/);

    // Click the link and verify navigation
    await nameLink.click();

    // Should navigate to the user card page
    await expect(page).toHaveURL(new RegExp(`^${env.FRONTEND_URL}/user/\\d+$`));

    // Verify we're on a card page by checking for card content
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
  });
});
