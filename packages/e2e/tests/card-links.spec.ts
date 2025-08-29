import { test, expect } from './global-test-hook';
import { clearBrowserState } from './utils/auth-helpers';
import { createTestUserViaAPI } from './utils/test-data';
import { env } from './utils/env';

test.describe('Card Links', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should display WhatsApp link when phone number is available', async ({ page }) => {
    // Create a test user with phone number
    const urlId = await createTestUserViaAPI('helpSeeker');

    console.log('Created test user with urlId:', urlId);

    // Navigate directly to the created user
    await page.goto(`${env.FRONTEND_URL}/user/${urlId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Verify WhatsApp link is displayed with correct attributes
    const whatsappLink = page.getByRole('link', { name: 'WhatsApp' });
    await expect(whatsappLink).toBeVisible();
    await expect(whatsappLink).toHaveAttribute('target', '_blank');
    await expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/9999999');
  });

  test('should display LinkedIn link when LinkedIn URL is available', async ({ page }) => {
    // Create a test user with LinkedIn URL
    const urlId = await createTestUserViaAPI('userWithLinkedinandcampaign');

    // Navigate directly to the created user
    await page.goto(`${env.FRONTEND_URL}/user/${urlId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Verify LinkedIn link is displayed with correct attributes
    const linkedinLink = page.getByRole('link', { name: 'LinkedIn Profile' });
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('target', '_blank');
    await expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/userWithLinkedinandcampaign');
  });

  test('should display campaign link when campaign URL is available', async ({ page }) => {
    // Create a test user with campaign URL
    const urlId = await createTestUserViaAPI('userWithLinkedinandcampaign');

    // Navigate directly to the created user
    await page.goto(`${env.FRONTEND_URL}/user/${urlId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Verify campaign link is displayed with correct attributes
    const campaignLink = page.getByRole('link', { name: 'Campaign/Fundraising' });
    await expect(campaignLink).toBeVisible();
    await expect(campaignLink).toHaveAttribute('target', '_blank');
    await expect(campaignLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(campaignLink).toHaveAttribute('href', 'https://gofundme.com/userWithLinkedinandcampaign');
  });

  test('should handle navigation between users regardless of order', async ({ page }) => {
    // Navigate to the public page
    await page.goto(env.FRONTEND_URL);

    // Wait for auto-redirect to user URL
    await page.waitForURL(/\/user\/\d+/);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Get initial user data
    const initialUrl = page.url();
    const initialUserName = await page.locator('[data-testid="user-card"] h4').textContent();

    // Click Next button if available
    const nextButton = page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();

    // Only proceed if Next button is enabled
    const isNextDisabled = await nextButton.isDisabled();
    if (!isNextDisabled) {
      await nextButton.click();

      // Wait for URL to change
      await page.waitForURL(url => url.toString() !== initialUrl);

      // Verify URL pattern is maintained but different
      expect(page.url()).toMatch(/\/user\/\d+$/);
      expect(page.url()).not.toBe(initialUrl);

      // Verify user data has changed
      const newUserName = page.locator('[data-testid="user-card"] h4');
      if (!initialUserName) {
        throw new Error('Initial user name is null');
      }
      await expect(newUserName).not.toHaveText(initialUserName);
    } else {
      // If Next is disabled, we might be at the end of the list
      // This is acceptable behavior
      console.log('Next button is disabled - likely at end of user list');
    }
  });
});
