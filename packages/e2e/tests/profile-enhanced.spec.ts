import { test, expect } from './global-test-hook';
import { loginAsUser, clearBrowserState } from './utils/auth-helpers';
import { env } from './utils/env';

test.describe('Enhanced Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should display complete profile with all fields and external links for users with full data', async ({
    page,
  }) => {
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

    // Check LinkedIn button is present and clickable
    const linkedinButton = page.getByRole('link', { name: 'View LinkedIn Profile' });
    await expect(linkedinButton).toBeVisible();
    await expect(linkedinButton).toHaveAttribute('target', '_blank');
    await expect(linkedinButton).toHaveAttribute('rel', 'noopener noreferrer');

    // Check campaign button is present and clickable
    const campaignButton = page.getByRole('link', { name: 'View Campaign' });
    await expect(campaignButton).toBeVisible();
    await expect(campaignButton).toHaveAttribute('target', '_blank');
    await expect(campaignButton).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should display public profile link and handle missing optional fields gracefully', async ({ page }) => {
    // Login as a predefined test user
    await loginAsUser(page, 'helpSeeker');

    // Navigate to profile page
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-fullName"]')).toBeVisible();

    // Check public profile button is present
    const publicProfileButton = page.getByRole('link', { name: 'View Public Profile' });
    await expect(publicProfileButton).toBeVisible();
    await expect(publicProfileButton).toHaveAttribute('target', '_blank');
    await expect(publicProfileButton).toHaveAttribute('rel', 'noopener noreferrer');

    // Login as admin user without LinkedIn/campaign URLs
    await clearBrowserState(page);
    await loginAsUser(page, 'admin');
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Wait for profile to load
    await expect(page.locator('[data-testid="profile-fullName"]')).toBeVisible();

    // Check that fields show "Not provided" for missing data
    await expect(page.locator('[data-testid="profile-linkedin-url"]')).toHaveValue('Not provided');
    await expect(page.locator('[data-testid="profile-campaign-url"]')).toHaveValue('Not provided');

    // External links section should not be visible
    await expect(page.getByText('External Links')).toBeHidden();
  });

  test('should display proper loading states and handle authentication scenarios', async ({ page }) => {
    // Login first to avoid immediate redirect
    await loginAsUser(page, 'helpSeeker');

    // Navigate to profile page
    await page.goto(`${env.FRONTEND_URL}/profile`);

    // Check that either loading state or profile content is visible
    // This handles the brief loading flash
    await expect(
      page.locator('svg[role="progressbar"]').or(page.locator('[data-testid="profile-fullName"]'))
    ).toBeVisible();

    // Should eventually show the profile content
    await expect(page.locator('[data-testid="profile-fullName"]')).toBeVisible();

    // Test authentication scenarios
    await clearBrowserState(page);
    await page.goto('/profile');

    // Wait for authentication check to complete and redirect to happen
    await page.waitForURL('/login');

    // Assert we're on the login page
    await expect(page).toHaveURL(/.*login/);

    // Should show login form
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // Should show registration link
    await expect(page.getByText("Don't have an account?")).toBeVisible();
    await expect(page.getByText('Create one')).toBeVisible();
  });
});
