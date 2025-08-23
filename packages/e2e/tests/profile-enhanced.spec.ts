import { test, expect } from './global-test-hook';
import { loginAsUser, clearBrowserState } from './utils/auth-helpers';
import { env } from './utils/env';

test.describe('Enhanced Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should display all profile fields including new ones', async ({ page }) => {
    // Login as a predefined test user with all fields populated
    await loginAsUser(page, 'userWithLinkedinandcampaign');

    // Navigate to profile page
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-fullName"]')).toBeVisible();

    // Check all basic fields are displayed
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-role-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-fullName-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-phoneNumber-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-status"]')).toBeVisible();

    // Check new fields are displayed
    await expect(page.locator('[data-testid="profile-linkedin-url"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-campaign-url"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-url-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-created-at"]')).toBeVisible();
  });

  test('should display clickable external links when available', async ({ page }) => {
    // Login as a predefined test user with LinkedIn and campaign URLs
    await loginAsUser(page, 'userWithLinkedinandcampaign');

    // Navigate to profile page
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-fullName"]')).toBeVisible();

    // Check LinkedIn button is present and clickable
    const linkedinButton = page.getByRole('button', { name: 'View LinkedIn Profile' });
    await expect(linkedinButton).toBeVisible();
    await expect(linkedinButton).toHaveAttribute('target', '_blank');
    await expect(linkedinButton).toHaveAttribute('rel', 'noopener noreferrer');

    // Check campaign button is present and clickable
    const campaignButton = page.getByRole('button', { name: 'View Campaign' });
    await expect(campaignButton).toBeVisible();
    await expect(campaignButton).toHaveAttribute('target', '_blank');
    await expect(campaignButton).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should display public profile link when url_id is available', async ({ page }) => {
    // Login as a predefined test user
    await loginAsUser(page, 'helpSeeker');

    // Navigate to profile page
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-fullName"]')).toBeVisible();

    // Check public profile button is present
    const publicProfileButton = page.getByRole('button', { name: 'View Public Profile' });
    await expect(publicProfileButton).toBeVisible();
    await expect(publicProfileButton).toHaveAttribute('target', '_blank');
    await expect(publicProfileButton).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should handle missing optional fields gracefully', async ({ page }) => {
    // Login as a predefined test user without LinkedIn/campaign URLs
    await loginAsUser(page, 'helpSeeker');

    // Navigate to profile page
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-fullName"]')).toBeVisible();

    // Check that fields show "Not provided" for missing data
    await expect(page.locator('[data-testid="profile-linkedin-url"]')).toContainText('Not provided');
    await expect(page.locator('[data-testid="profile-campaign-url"]')).toContainText('Not provided');

    // External links section should not be visible
    await expect(page.getByText('External Links')).toBeHidden();
  });

  test('should display proper loading states', async ({ page }) => {
    // Navigate to profile page without logging in
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Should show loading spinner initially
    await expect(page.locator('svg[role="progressbar"]')).toBeVisible();

    // Should redirect to login since not authenticated
    await page.waitForURL(/\/login/);
  });
});
