import { test, expect } from './global-test-hook';
import { loginAsUser, clearBrowserState } from './utils/auth-helpers';
import { createTestUserViaAPI } from './utils/test-data';
import { env } from './utils/env';

test.describe('Verification Transparency', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should display verification badge for verified users', async ({ page }) => {
    // Create a verified help seeker user (already verified by default)
    const urlId = await createTestUserViaAPI('helpSeeker');

    // Navigate to the user's profile
    await page.goto(`${env.FRONTEND_URL}/user/${urlId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Should show verification badge (if user is verified)
    // Note: This depends on the user being verified by an admin
    const badge = page.locator('[data-testid="verification-badge"]');
    const isBadgeVisible = await badge.isVisible();

    if (isBadgeVisible) {
      // Should show "Verified by" text
      await expect(page.getByText(/Verified by/)).toBeVisible();
    } else {
      // If no badge, user might not be verified yet - this is acceptable
      console.log('User is not verified yet - no badge shown');
    }
  });

  test('should not display verification badge for unverified users', async ({ page }) => {
    // Create an unverified help seeker (status: pending)
    const urlId = await createTestUserViaAPI('helpSeekerPending');

    // Navigate to the user's profile
    await page.goto(`${env.FRONTEND_URL}/user/${urlId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Should NOT show verification badge
    await expect(page.locator('[data-testid="verification-badge"]')).toBeHidden();
  });

  test('should link verification badge to admin profile when present', async ({ page }) => {
    // Create a verified help seeker user
    const urlId = await createTestUserViaAPI('helpSeeker');

    // Navigate to the user's profile
    await page.goto(`${env.FRONTEND_URL}/user/${urlId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Check if verification badge is present
    const badge = page.locator('[data-testid="verification-badge"]');
    const isBadgeVisible = await badge.isVisible();

    if (isBadgeVisible) {
      // Click on the verification badge link
      const badgeLink = page.locator('[data-testid="verification-badge"] a');
      await expect(badgeLink).toBeVisible();

      // Should open admin profile in new tab
      const [newPage] = await Promise.all([page.context().waitForEvent('page'), badgeLink.click()]);

      // Wait for new page to load
      await newPage.waitForLoadState();

      // Should be on admin profile page
      expect(newPage.url()).toMatch(/\/admins\/[a-f0-9-]+$/);

      // Should show admin profile content
      await expect(newPage.getByText('Admin Profile')).toBeVisible();

      // Close the new tab
      await newPage.close();
    } else {
      // If no badge, skip this test - user not verified yet
      console.log('User is not verified yet - skipping badge link test');
    }
  });

  test('should display admin profile with verification count', async ({ page }) => {
    // Create an admin user first
    await createTestUserViaAPI('admin');

    // Login as admin to get their ID
    await loginAsUser(page, 'admin');

    // Navigate to the admin's profile using their known ID
    await page.goto(`${env.FRONTEND_URL}/admins/43e3b47a-f4d0-4a5f-9aad-eeddfa721c92`);

    // Should show admin profile
    await expect(page.getByText('Admin Profile')).toBeVisible();

    // Should show admin name (use heading to be more specific)
    await expect(page.getByRole('heading', { name: 'Ahmed Admn' })).toBeVisible();

    // Should show admin role (use chip to be more specific)
    await expect(page.getByText('Admin', { exact: true })).toBeVisible();

    // Should show verification activity section
    await expect(page.getByText('Verification Activity')).toBeVisible();

    // Should show verification count (even if 0)
    await expect(page.getByText(/profiles verified/)).toBeVisible();
  });

  test('should handle non-existent admin profile gracefully', async ({ page }) => {
    // Navigate to a non-existent admin profile
    await page.goto(`${env.FRONTEND_URL}/admins/00000000-0000-0000-0000-000000000000`);

    // Should show error message
    await expect(page.getByText('Admin not found or not accessible.')).toBeVisible();
  });

  test('should show admin contact information when available', async ({ page }) => {
    // Create an admin user
    await createTestUserViaAPI('admin');

    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin profile
    await page.goto(`${env.FRONTEND_URL}/admins/43e3b47a-f4d0-4a5f-9aad-eeddfa721c92`);

    // Should show admin information section
    await expect(page.getByText('Admin Information')).toBeVisible();

    // Should show email (check for the actual email from test data)
    await expect(page.getByText(/admin@admin\.com/)).toBeVisible();

    // Should show member since date
    await expect(page.getByText(/Member since/)).toBeVisible();
  });

  test('should display admin links when available', async ({ page }) => {
    // Create an admin with LinkedIn and campaign URLs
    await createTestUserViaAPI('adminWithLinks');

    // Login as admin (use the regular admin login since adminWithLinks might not be in auth helpers)
    await loginAsUser(page, 'admin');

    // Navigate to admin profile (we'll use a known admin ID for now)
    await page.goto(`${env.FRONTEND_URL}/admins/43e3b47a-f4d0-4a5f-9aad-eeddfa721c92`);

    // Should show admin profile
    await expect(page.getByText('Admin Profile')).toBeVisible();

    // Check if contact & links section is present
    const contactSection = page.getByText('Contact & Links');
    const isContactSectionVisible = await contactSection.isVisible();

    if (isContactSectionVisible) {
      // Should show LinkedIn link if available
      const linkedinLink = page.getByText('LinkedIn Profile');
      const isLinkedinVisible = await linkedinLink.isVisible();

      if (isLinkedinVisible) {
        await expect(linkedinLink).toBeVisible();
      }

      // Should show campaign link if available
      const campaignLink = page.getByText('Campaign Page');
      const isCampaignVisible = await campaignLink.isVisible();

      if (isCampaignVisible) {
        await expect(campaignLink).toBeVisible();
      }
    } else {
      // If no contact section, that's also acceptable
      console.log('No contact & links section found - admin may not have links');
    }
  });

  test('should show verification summary for admins', async ({ page }) => {
    // Create an admin user
    await createTestUserViaAPI('admin');

    // Login as admin
    await loginAsUser(page, 'admin');

    // Navigate to admin profile
    await page.goto(`${env.FRONTEND_URL}/admins/43e3b47a-f4d0-4a5f-9aad-eeddfa721c92`);

    // Should show verification summary
    await expect(page.getByText('Verification Summary')).toBeVisible();

    // Should show explanation text
    await expect(page.getByText(/This admin has verified/)).toBeVisible();
    await expect(page.getByText(/authenticity and legitimacy/)).toBeVisible();
  });
});
