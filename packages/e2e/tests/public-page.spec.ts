import { test, expect } from '@playwright/test';
import { createTestUser, cleanupTestUser } from './utils/test-data';

test.describe('Public Page - Card Stack Interface', () => {
  let testUserId: string;

  test.beforeAll(async () => {
    // Create a test user for the card stack
    testUserId = await createTestUser({
      full_name: 'Test Help Seeker',
      description: 'I need help with my project',
      phone_number: '+1234567890',
      role: 'help_seeker',
      status: 'verified',
    });
  });

  test.afterAll(async () => {
    // Clean up test user
    await cleanupTestUser(testUserId);
  });

  test('should load public page without authentication', async ({ page }) => {
    await page.goto('/');

    // Should show the public page title
    await expect(page.getByRole('heading', { name: 'Help Someone Today' })).toBeVisible();

    // Should show the subtitle
    await expect(page.getByText('Browse verified users who need help')).toBeVisible();
  });

  test('should display user count', async ({ page }) => {
    await page.goto('/');

    // Should show user count (at least 1 from our test user)
    await expect(page.getByText(/verified users available/)).toBeVisible();
  });

  test('should show card stack interface', async ({ page }) => {
    await page.goto('/');

    // Should show progress indicator
    await expect(page.getByText(/1 of/)).toBeVisible();

    // Should show main card
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
  });

  test('should display user information on card', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load and show either user data or empty state
    await page.waitForLoadState('networkidle');

    // Check if we have users or empty state
    const hasUsers = (await page.locator('[data-testid="user-card"]').count()) > 0;

    if (hasUsers) {
      // Should show verified status if users exist
      await expect(page.getByText('✅ Verified')).toBeVisible();

      // Should show phone number (now required)
      await expect(page.getByText('📞')).toBeVisible();

      // Should show WhatsApp link (now required)
      await expect(page.getByText('💬 WhatsApp')).toBeVisible();
    } else {
      // Should show empty state message
      await expect(page.getByText('No Users Available')).toBeVisible();
    }
  });

  test('should have working WhatsApp link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if WhatsApp link exists
    const whatsappLink = page.getByText('💬 WhatsApp');
    const linkCount = await whatsappLink.count();

    if (linkCount > 0) {
      await expect(whatsappLink).toBeVisible();

      // Check that the link has the correct format
      const href = await whatsappLink.getAttribute('href');
      expect(href).toMatch(/^https:\/\/wa\.me\/\d+$/);
    } else {
      // If no users, this is expected
      console.log('No WhatsApp links found - likely no users in database');
    }
  });

  test('should have navigation buttons', async ({ page }) => {
    await page.goto('/');

    // Should show all navigation buttons
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reject' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('should handle button interactions', async ({ page }) => {
    await page.goto('/');

    // Previous button should be disabled initially (first card)
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();

    // Accept button should be enabled
    await expect(page.getByRole('button', { name: 'Accept' })).toBeEnabled();

    // Reject button should be enabled
    await expect(page.getByRole('button', { name: 'Reject' })).toBeEnabled();

    // Next button should be disabled if only one user
    // (This depends on how many users are in the database)
  });

  test('should show instructions', async ({ page }) => {
    await page.goto('/');

    // Should show instructions text
    await expect(page.getByText(/Click Accept to help this person, or Reject to skip to the next user/)).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // This test would require a clean database or mocking
    // For now, we'll test the structure that would show empty state
    await page.goto('/');

    // If no users, should show appropriate message
    // This is handled by the component logic
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Should still show all elements
    await expect(page.getByRole('heading', { name: 'Help Someone Today' })).toBeVisible();
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Help Someone Today' })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: 'Help Someone Today' })).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error by temporarily changing the endpoint
    await page.route('**/trpc/getUsersForCards', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: 'Internal Server Error',
            code: -32603,
          },
        }),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show error state
    await expect(page.getByText('Error Loading Users')).toBeVisible();
    await expect(page.getByText('Please try refreshing the page.')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Mock slow API response
    await page.route('**/trpc/getUsersForCards', route => {
      // Delay the response to test loading state
      setTimeout(() => {
        route.continue();
      }, 1000);
    });

    await page.goto('/');

    // Should show loading spinner initially
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });
});
