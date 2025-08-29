import { test, expect } from './global-test-hook';
import { createTestUserViaAPI } from './utils/test-data';
import { loginAsUser } from './utils/auth-helpers';

test.describe('Profile Editing - Help Seeker Users', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test user for each test
    await createTestUserViaAPI('helpSeeker');
    // Login with the test user
    await loginAsUser(page, 'helpSeeker');
  });

  test('should handle complete profile editing workflow for help seekers', async ({ page }) => {
    await page.goto('/profile');

    // Check that edit button and verification status are visible
    await expect(page.locator('[data-testid="profile-edit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-edit-button"]')).toHaveText('Edit Profile');
    await expect(page.locator('[data-testid="profile-status"]')).toBeVisible();

    // Click edit button and handle warning dialog
    await page.click('[data-testid="profile-edit-button"]');
    await expect(page.locator('[data-testid="warning-dialog-cancel"]')).toBeVisible();
    await expect(page.locator('[data-testid="warning-dialog-continue"]')).toBeVisible();
    await page.click('[data-testid="warning-dialog-continue"]');

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Check that form fields are now editable
    await expect(page.locator('[data-testid="profile-fullName-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-phoneNumber-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-description"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-linkedin-url"]')).toBeEnabled();
    await expect(page.locator('[data-testid="profile-campaign-url"]')).toBeEnabled();

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

    // Check that the info message shows the correct text
    await expect(
      page.locator('text=Profile information is collected during registration and cannot be edited')
    ).toBeVisible();
  });

  test('should handle edit mode cancellation and no-changes scenarios', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button and handle warning dialog
    await page.click('[data-testid="profile-edit-button"]');
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

    // Enter edit mode again and try to save without changes
    await page.click('[data-testid="profile-edit-button"]');
    await page.locator('[data-testid="warning-dialog-continue"]').click();
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Try to save without making changes
    await page.click('[data-testid="profile-save-button"]');

    // Should show info message about no changes
    await expect(page.locator('[data-testid="toast-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-info"]')).toContainText('No changes to save');

    // Should exit edit mode
    await expect(page.locator('[data-testid="profile-edit-button"]')).toBeVisible();
  });
});

test.describe('Profile Editing - Admin Users', () => {
  test('should handle profile editing workflow for admin users', async ({ page }) => {
    // Create an admin user and login
    await createTestUserViaAPI('admin');
    await loginAsUser(page, 'admin');

    await page.goto('/profile');

    // Admin users should not see verification status chip
    await expect(page.locator('[data-testid="profile-status"]')).toBeHidden();

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
});

test.describe('Profile Editing - Super Admin Users', () => {
  test('should handle profile editing workflow for super admin users', async ({ page }) => {
    // Create a super admin user and login
    await createTestUserViaAPI('superAdmin');
    await loginAsUser(page, 'superAdmin');

    await page.goto('/profile');

    // Super admin users should not see verification status chip
    await expect(page.locator('[data-testid="profile-status"]')).toBeHidden();

    // Click edit button - super admin users should go directly to edit mode
    await page.click('[data-testid="profile-edit-button"]');

    // Wait for edit mode to be activated
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();

    // Should be in edit mode
    await expect(page.locator('[data-testid="profile-save-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="warning-dialog-cancel"]')).toBeHidden();
  });
});
