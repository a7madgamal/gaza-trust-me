import { test, expect } from '@playwright/test';
import { loginAsUser, clearBrowserState } from '../utils/auth-helpers';

test.describe('Admin Dashboard', () => {
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

    // Navigate to admin dashboard
    await page.goto('/admin/dashboard');

    // Should be on admin dashboard
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
    await page.locator('text=Pending').click();

    // Wait for the filter to be applied
    await page.waitForLoadState('networkidle');

    // Verify filter is applied by checking if the select shows "Pending"
    await expect(page.locator('[data-testid="status-filter"]')).toContainText('Pending');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access admin dashboard without logging in
    await page.goto('/admin/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });
});
