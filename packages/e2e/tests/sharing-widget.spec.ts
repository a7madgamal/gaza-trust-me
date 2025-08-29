import { test, expect } from './global-test-hook';
import { testTRPC } from './utils/trpc-client';

test.describe('Sharing Widget', () => {
  test('should display sharing widget on public page', async ({ page }) => {
    // Get a user to visit
    const users = await testTRPC.getUsersForCards.query({
      limit: 1,
      offset: 0,
    });

    expect(users.length).toBeGreaterThan(0);
    const user = users[0];
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Check that sharing widget is present
    await expect(page.locator('text=Share')).toBeVisible();

    // Wait for sharing widget to be fully loaded
    await page.locator('text=Share').waitFor();

    // Check for all sharing buttons using role selectors
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on WhatsApp' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on Facebook' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on Twitter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share on LinkedIn' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share via Email' })).toBeVisible();
  });

  test('should copy link to clipboard', async ({ page }) => {
    // Get a user to visit
    const users = await testTRPC.getUsersForCards.query({
      limit: 1,
      offset: 0,
    });

    expect(users.length).toBeGreaterThan(0);
    const user = users[0];
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

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

    // Click copy link button
    await page.getByRole('button', { name: 'Copy link' }).click();

    // Check for success message
    await expect(page.locator('text=Link copied to clipboard!')).toBeVisible();
  });

  test('should open WhatsApp share with correct text', async ({ page }) => {
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
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Click WhatsApp share button
    await page.getByRole('button', { name: 'Share on WhatsApp' }).click();

    // Check that WhatsApp URL was opened
    const openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);
    expect(openCalls[0]).toContain('wa.me');
    expect(openCalls[0]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));
    expect(openCalls[0]).toContain(encodeURIComponent(user.full_name));
  });

  test('should open Facebook share with correct parameters', async ({ page }) => {
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
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Click Facebook share button
    await page.getByRole('button', { name: 'Share on Facebook' }).click();

    // Check that Facebook URL was opened with correct parameters
    const openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);
    expect(openCalls[0]).toContain('facebook.com/sharer');
    expect(openCalls[0]).toContain('quote=');
    expect(openCalls[0]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));
  });

  test('should open Twitter share with correct parameters', async ({ page }) => {
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
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Click Twitter share button
    await page.getByRole('button', { name: 'Share on Twitter' }).click();

    // Check that Twitter URL was opened with correct parameters
    const openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);
    expect(openCalls[0]).toContain('twitter.com/intent/tweet');
    expect(openCalls[0]).toContain('text=');
    expect(openCalls[0]).toContain('url=');
    expect(openCalls[0]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));
  });

  test('should open LinkedIn share with correct parameters', async ({ page }) => {
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
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Click LinkedIn share button
    await page.getByRole('button', { name: 'Share on LinkedIn' }).click();

    // Check that LinkedIn URL was opened with correct parameters
    const openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);
    expect(openCalls[0]).toContain('linkedin.com/sharing/share-offsite');
    expect(openCalls[0]).toContain('url=');
  });

  test('should open email share with correct parameters', async ({ page }) => {
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
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Click email share button
    await page.getByRole('button', { name: 'Share via Email' }).click();

    // Check that email URL was opened with correct parameters
    const openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);
    expect(openCalls[0]).toContain('mailto:');
    expect(openCalls[0]).toContain('subject=');
    expect(openCalls[0]).toContain('body=');
    expect(openCalls[0]).toContain(encodeURIComponent('Help this confirmed person in Gaza'));
  });

  test('should include user information in share text', async ({ page }) => {
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
    if (!user) throw new Error('User not found');

    // Navigate to the public page
    await page.goto(`/user/${user.url_id}`);

    // Wait for the page to load
    await page.locator('[data-testid="user-card"]').waitFor();

    // Click WhatsApp share button
    await page.getByRole('button', { name: 'Share on WhatsApp' }).click();

    // Check that the share text includes user information
    const openCalls = await page.evaluate(() => window.openCalls);
    expect(openCalls.length).toBe(1);

    const shareUrl = openCalls[0];
    if (!shareUrl) throw new Error('Share URL not found');
    const textPart = shareUrl.split('text=')[1];
    if (!textPart) throw new Error('Text parameter not found in share URL');
    const decodedText = decodeURIComponent(textPart);

    expect(decodedText).toContain('Help this confirmed person in Gaza');
    expect(decodedText).toContain(user.full_name);
    expect(decodedText).toContain(user.description);
    expect(decodedText).toContain(`/user/${user.url_id}`);
  });
});
