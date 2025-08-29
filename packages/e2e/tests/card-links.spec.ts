import { test, expect } from './global-test-hook';
import { clearBrowserState } from './utils/auth-helpers';
import { createTestUserViaAPI } from './utils/test-data';
import { env } from './utils/env';
import { assertNotNull, assertNotUndefined } from './utils/test-utils';

test.describe('Card Links', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should display all external links for users with complete profile data', async ({ page }) => {
    // Create a test user with all external links
    const urlId = await createTestUserViaAPI('userWithLinkedinandcampaign');

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

    // Verify LinkedIn link is displayed with correct attributes
    const linkedinLink = page.getByRole('link', { name: 'LinkedIn Profile' });
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('target', '_blank');
    await expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/userWithLinkedinandcampaign');

    // Verify campaign link is displayed with correct attributes
    const campaignLink = page.getByRole('link', { name: 'Campaign/Fundraising' });
    await expect(campaignLink).toBeVisible();
    await expect(campaignLink).toHaveAttribute('target', '_blank');
    await expect(campaignLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(campaignLink).toHaveAttribute('href', 'https://gofundme.com/userWithLinkedinandcampaign');
  });

  test('should display WhatsApp link for users with phone numbers and handle navigation between users', async ({
    page,
  }) => {
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

    // Test navigation between users
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
    const isNextDisabled = nextButton;
    assertNotUndefined(initialUserName);

    // Skip test if Next button is disabled (end of list)
    await expect(isNextDisabled).toBeEnabled();

    await nextButton.click();

    // Wait for URL to change
    await page.waitForURL(url => url.toString() !== initialUrl);

    // Verify URL pattern is maintained but different
    expect(page.url()).toMatch(/\/user\/\d+$/);
    expect(page.url()).not.toBe(initialUrl);

    // Verify user data has changed
    const newUserName = page.locator('[data-testid="user-card"] h4');
    expect(initialUserName).toBeDefined();
    assertNotNull(initialUserName);
    await expect(newUserName).not.toHaveText(initialUserName);
  });
});
