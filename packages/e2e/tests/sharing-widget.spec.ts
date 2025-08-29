import { test, expect } from './global-test-hook';
import { testTRPC } from './utils/trpc-client';
import { assertNotNull, assertNotUndefined } from './utils/test-utils';

test.describe('Sharing Widget', () => {
  test('should display sharing widget and be responsive on mobile', async ({ page }) => {
    // Get a user to visit
    const users = await testTRPC.getUsersForCards.query({
      limit: 1,
      offset: 0,
    });

    expect(users.length).toBeGreaterThan(0);
    const user = users[0];
    assertNotNull(user);
    assertNotUndefined(user);

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Check that sharing widget is present
    await expect(page.locator('text=Share')).toBeVisible();

    // Wait for sharing widget to be fully loaded
    await page.locator('text=Share').waitFor();

    // Check for all sharing buttons using aria-label selectors
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on WhatsApp' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on Facebook' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on Twitter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on LinkedIn' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share via Email' })).toBeVisible();

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that sharing widget is still present and functional on mobile
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on WhatsApp' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on Facebook' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on Twitter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on LinkedIn' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share via Email' })).toBeVisible();
  });

  test('should handle all share button functionality with correct parameters', async ({ page }) => {
    // Mock window.open before navigation
    await page.addInitScript(() => {
      const originalOpen = window.open;
      const openCalls: string[] = [];

      window.open = (url?: string | URL, target?: string, features?: string) => {
        if (url) openCalls.push(url.toString());
        return originalOpen(url, target, features);
      };

      // Set our custom property
      window.openCalls = openCalls;
    });

    // Get a user to visit
    const users = await testTRPC.getUsersForCards.query({
      limit: 1,
      offset: 0,
    });

    expect(users.length).toBeGreaterThan(0);
    const user = users[0];
    assertNotNull(user);
    assertNotUndefined(user);

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Wait for page to be fully loaded and stable
    await page.waitForLoadState('domcontentloaded');
    await page.click('body');

    // Test WhatsApp share
    const whatsappButton = page.getByRole('button', { name: 'Share on WhatsApp' });
    await expect(whatsappButton).toBeVisible();
    await whatsappButton.click();
    let openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);
    expect(openCalls[0]).toContain('wa.me');
    expect(openCalls[0]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));
    expect(openCalls[0]).toContain(encodeURIComponent(user.full_name));

    // Clear any overlays and wait for stability
    await page.click('body');
    await page.waitForLoadState('domcontentloaded');

    // Test Facebook share
    const facebookButton = page.getByRole('button', { name: 'Share on Facebook' });
    await expect(facebookButton).toBeVisible();
    await facebookButton.click();

    // Wait for the click to register
    await page.waitForLoadState('domcontentloaded');
    openCalls = await page.evaluate(() => window.openCalls);

    expect(openCalls.length).toBe(2);
    expect(openCalls[1]).toContain('facebook.com/sharer');
    expect(openCalls[1]).toContain('quote=');
    expect(openCalls[1]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));

    // Clear any overlays and wait for stability
    await page.click('body');
    await page.waitForLoadState('domcontentloaded');

    // Test Twitter share
    const twitterButton = page.getByRole('button', { name: 'Share on Twitter' });
    await expect(twitterButton).toBeVisible();
    await twitterButton.click();
    openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(3);
    expect(openCalls[2]).toContain('twitter.com/intent/tweet');
    expect(openCalls[2]).toContain('text=');
    expect(openCalls[2]).toContain('url=');
    expect(openCalls[2]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));

    // Clear any overlays and wait for stability
    await page.click('body');
    await page.waitForLoadState('domcontentloaded');

    // Test LinkedIn share
    const linkedinButton = page.getByRole('button', { name: 'Share on LinkedIn' });
    await expect(linkedinButton).toBeVisible();
    await linkedinButton.click();
    openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(4);
    expect(openCalls[3]).toContain('linkedin.com/sharing/share-offsite');
    expect(openCalls[3]).toContain('url=');

    // Clear any overlays and wait for stability
    await page.click('body');
    await page.waitForLoadState('domcontentloaded');

    // Test email share
    const emailButton = page.getByRole('button', { name: 'Share via Email' });
    await expect(emailButton).toBeVisible();
    await emailButton.click();
    openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(5);
    expect(openCalls[4]).toContain('mailto:');
    expect(openCalls[4]).toContain('subject=');
    expect(openCalls[4]).toContain('body=');
    expect(openCalls[4]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));
  });

  test('should copy link to clipboard and validate share text content', async ({ page }) => {
    // Mock clipboard API
    await page.addInitScript(() => {
      const calls: string[][] = [];
      const mockWriteText = (text: string) => {
        calls.push([text]);
        return Promise.resolve(text);
      };
      mockWriteText.mock = { calls };

      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });
    });

    // Mock window.open for share text validation
    await page.addInitScript(() => {
      const originalOpen = window.open;
      const openCalls: string[] = [];

      window.open = (url?: string | URL, target?: string, features?: string) => {
        if (url) openCalls.push(url.toString());
        return originalOpen(url, target, features);
      };

      // Set our custom property
      window.openCalls = openCalls;
    });

    // Get a user to visit
    const users = await testTRPC.getUsersForCards.query({
      limit: 1,
      offset: 0,
    });

    expect(users.length).toBeGreaterThan(0);
    const user = users[0];
    assertNotNull(user);
    assertNotUndefined(user);

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Wait for page to be fully loaded and stable
    await page.waitForLoadState('domcontentloaded');
    await page.click('body');

    // Test copy link functionality
    await page.getByRole('button', { name: 'Copy link' }).click();
    await expect(page.locator('text=Link copied to clipboard!')).toBeVisible();

    // Clear any overlays and wait for stability
    await page.click('body');
    await page.waitForLoadState('domcontentloaded');

    // Test that share text includes user information
    await page.getByRole('button', { name: 'Share on WhatsApp' }).click();
    const openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);

    const shareUrl = openCalls[0];
    assertNotNull(shareUrl);
    assertNotUndefined(shareUrl);
    const textPart = shareUrl.split('text=')[1];
    assertNotNull(textPart);
    assertNotUndefined(textPart);
    const decodedText = decodeURIComponent(textPart);

    expect(decodedText).toContain('Help this confirmed person in Gaza');
    expect(decodedText).toContain(user.full_name);
    expect(decodedText).toContain(user.description);
    expect(decodedText).toContain(`/user/${user.url_id}`);
  });
});
