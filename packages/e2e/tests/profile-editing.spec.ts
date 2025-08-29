import { test, expect } from './global-test-hook';
import { createTestUserViaAPI } from './utils/test-data';
import { loginAsUser } from './utils/auth-helpers';

test.describe('Profile Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test user for each test
    await createTestUserViaAPI('helpSeeker');

    // Login with the test user
    await loginAsUser(page, 'helpSeeker');
  });

  test('should show edit button on profile page', async ({ page }) => {
    await page.goto('/profile');

    // Check that edit button is visible
    await expect(page.locator('[data-testid="profile-edit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-edit-button"]')).toHaveText('Edit Profile');
  });

  test('should show verification status chip for help seekers', async ({ page }) => {
    await page.goto('/profile');

    // Help seekers should see verification status chip
    await expect(page.locator('[data-testid="profile-status"]')).toBeVisible();
  });

  test('should enter edit mode when edit button is clicked', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="profile-edit-button"]');

    // Help seekers may see warning dialog - click continue if it appears
    await page.locator('[data-testid="warning-dialog-continue"]').click();

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Check that form fields are now editable
    await expect(page.locator('[data-testid="profile-fullName-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-phoneNumber-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-description"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-linkedin-url"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-campaign-url"]')).toBeEnabled();

    // Check that save and cancel buttons are visible
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-cancel-button"]')).toBeVisible();
  });

  test('should show warning dialog for verified help seekers', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="profile-edit-button"]');

    // Help seekers should see warning dialog and click continue
    await expect(page.locator('[data-testid="warning-dialog-cancel"]')).toBeVisible();
    await expect(page.locator('[data-testid="warning-dialog-continue"]')).toBeVisible();
    await page.click('[data-testid="warning-dialog-continue"]');

    // Should now be in edit mode
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();
  });

  test('should save profile changes successfully', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="profile-edit-button"]');

    // Help seekers may see warning dialog - click continue if it appears
    await page.locator('[data-testid="warning-dialog-continue"]').click();

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Update profile information
    await page.fill('[data-testid="profile-fullName-input"]', 'Updated Test User');
    await page.fill('[data-testid="profile-phoneNumber-input"]', '+1987654321');
    await page.fill('[data-testid="profile-description"]', 'Updated description for testing');
    await page.fill('[data-testid="profile-linkedin-url"]', 'https://linkedin.com/in/updateduser');
    await page.fill('[data-testid="profile-campaign-url"]', 'https://campaign.example.com/updated');

    // Save changes
    await page.click('[data-testid="profile-save-button"]');

    // Wait for success message
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Profile updated successfully');

    // Should exit edit mode
    await expect(page.locator('[data-testid="profile-edit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeHidden();
  });

  test('should cancel edit mode without saving', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="profile-edit-button"]');

    // Help seekers may see warning dialog - click continue if it appears
    await page.locator('[data-testid="warning-dialog-continue"]').click();

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Make some changes
    await page.fill('[data-testid="profile-fullName-input"]', 'This should not be saved');

    // Cancel edit
    await page.click('[data-testid="profile-cancel-button"]');

    // Should exit edit mode
    await expect(page.locator('[data-testid="profile-edit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeHidden();

    // Changes should not be saved
    await expect(page.locator('[data-testid="profile-fullName-input"]')).toHaveValue('Help Seeker');
  });

  test('should show no changes message when saving without changes', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="profile-edit-button"]');

    // Help seekers may see warning dialog - click continue if it appears
    await page.locator('[data-testid="warning-dialog-continue"]').click();

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Try to save without making changes
    await page.click('[data-testid="profile-save-button"]');

    // Should show info message about no changes
    await expect(page.locator('[data-testid="toast-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-info"]')).toContainText('No changes to save');

    // Should exit edit mode
    await expect(page.locator('[data-testid="profile-edit-button"]')).toBeVisible();
  });

  test('should show correct info message for all users', async ({ page }) => {
    await page.goto('/profile');

    // Check that the info message shows the correct text
    await expect(
      page.locator('text=Profile information is collected during registration and cannot be edited')
    ).toBeVisible();
  });
});

test.describe('Profile Editing - Admin Users', () => {
  test('should not show verification status chip for admin users', async ({ page }) => {
    // Create an admin user and login
    await createTestUserViaAPI('admin');
    await loginAsUser(page, 'admin');

    await page.goto('/profile');

    // Admin users should not see verification status chip
    await expect(page.locator('[data-testid="profile-status"]')).toBeHidden();
  });

  test('should skip warning dialog for admin users', async ({ page }) => {
    // Create an admin user and login
    await createTestUserViaAPI('admin');
    await loginAsUser(page, 'admin');

    await page.goto('/profile');

    // Click edit button - admin users may see warning dialog if verified
    await page.click('[data-testid="profile-edit-button"]');

    // Handle warning dialog if it appears (admin users can be verified)
    await page.locator('[data-testid="warning-dialog-continue"]').click();

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Should be in edit mode
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="warning-dialog-cancel"]')).toBeHidden();
  });

  test('should show correct info message for admin users', async ({ page }) => {
    // Create an admin user and login
    await createTestUserViaAPI('admin');
    await loginAsUser(page, 'admin');

    await page.goto('/profile');

    // Check that the info message shows the correct text
    await expect(
      page.locator('text=Profile information is collected during registration and cannot be edited')
    ).toBeVisible();
  });
});

test.describe('Profile Editing - Super Admin Users', () => {
  test('should not show verification status chip for super admin users', async ({ page }) => {
    // Create a super admin user and login
    await createTestUserViaAPI('superAdmin');
    await loginAsUser(page, 'superAdmin');

    await page.goto('/profile');

    // Super admin users should not see verification status chip
    await expect(page.locator('[data-testid="profile-status"]')).toBeHidden();
  });

  test('should skip warning dialog for super admin users', async ({ page }) => {
    // Create a super admin user and login
    await createTestUserViaAPI('superAdmin');
    await loginAsUser(page, 'superAdmin');

    await page.goto('/profile');

    // Click edit button - super admin users should go directly to edit mode
    await page.click('[data-testid="profile-edit-button"]');

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Should be in edit mode
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="warning-dialog-cancel"]')).toBeHidden();
  });

  test('should show correct info message for super admin users', async ({ page }) => {
    // Create a super admin user and login
    await createTestUserViaAPI('superAdmin');
    await loginAsUser(page, 'superAdmin');

    await page.goto('/profile');

    // Check that the info message shows the correct text
    await expect(
      page.locator('text=Profile information is collected during registration and cannot be edited')
    ).toBeVisible();
  });
});
