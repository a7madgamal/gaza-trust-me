import { test, expect } from '@playwright/test';
import { clearBrowserState } from './utils/auth-helpers';
import { createTestUser } from './utils/test-data';

test.describe('Card Links', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserState(page);
  });

  test('should display LinkedIn and campaign links on user cards when available', async ({ page }) => {
    // Create a test user with LinkedIn and campaign URLs
    const userId = await createTestUser({
      full_name: 'Test User with Links',
      description: 'This is a test user with LinkedIn and campaign links for testing card display functionality.',
      phone_number: '+1234567890',
      role: 'help_seeker',
      status: 'verified',
      linkedin_url: 'https://linkedin.com/in/test-user-with-links',
      campaign_url: 'https://gofundme.com/test-campaign-with-links',
    });

    // Navigate directly to the created user
    await page.goto(`${process.env['FRONTEND_URL']}/user/${userId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Verify LinkedIn link is displayed with correct attributes
    const linkedinLink = page.getByRole('link', { name: 'LinkedIn Profile' });
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('target', '_blank');
    await expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/test-user-with-links');

    // Verify campaign link is displayed with correct attributes
    const campaignLink = page.getByRole('link', { name: 'Campaign/Fundraising' });
    await expect(campaignLink).toBeVisible();
    await expect(campaignLink).toHaveAttribute('target', '_blank');
    await expect(campaignLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(campaignLink).toHaveAttribute('href', 'https://gofundme.com/test-campaign-with-links');
  });

  test('should handle card navigation and display user information', async ({ page }) => {
    // Navigate to the public page
    await page.goto(`${process.env['FRONTEND_URL']}`);

    // Wait for auto-redirect to user URL
    await page.waitForURL(/\/user\/\d+/);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Check that basic card elements are present
    await expect(page.locator('[data-testid="user-card"]')).toContainText('Needs Help With:');

    // Check for navigation buttons
    const nextButton = page.getByRole('button', { name: 'Next' });
    const previousButton = page.getByRole('button', { name: 'Previous' });

    // These buttons should be present even if disabled
    await expect(nextButton).toBeVisible();
    await expect(previousButton).toBeVisible();

    // Check for action button
    const contactedButton = page.getByRole('button', { name: 'I contacted' });

    await expect(contactedButton).toBeVisible();
  });

  test('should display WhatsApp link when phone number is available', async ({ page }) => {
    // Create a test user with phone number
    const urlId = await createTestUser({
      full_name: 'Test User with Phone',
      description: 'This is a test user with phone number for testing WhatsApp link functionality.',
      phone_number: '+1234567890',
      role: 'help_seeker',
      status: 'verified',
    });

    console.log('Created test user with urlId:', urlId);

    // Navigate directly to the created user
    await page.goto(`${process.env['FRONTEND_URL']}/user/${urlId}`);

    // Wait for the card to load
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Verify WhatsApp link is displayed with correct attributes
    const whatsappLink = page.getByRole('link', { name: 'WhatsApp' });
    await expect(whatsappLink).toBeVisible();
    await expect(whatsappLink).toHaveAttribute('target', '_blank');
    await expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/1234567890');
  });
});
