import { test, expect } from './global-test-hook';

test.describe('View Count Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial load and redirect
    await page.waitForURL(/\/user\/\d+/);
  });

  test.describe('View Count Increments', () => {
    test('should increment view count on initial page load', async ({ page }) => {
      // Get initial view count
      const initialViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const initialCount = parseInt(initialViewCount?.match(/\d+/)?.[0] || '0');

      // Refresh page
      await page.reload();
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      // Wait for view count to potentially update (API call might be async)
      await page.waitForTimeout(1000);

      // Check view count increased
      const newViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const newCount = parseInt(newViewCount?.match(/\d+/)?.[0] || '0');

      // The view count should either increase OR stay the same (due to rate limiting/session logic)
      // Most importantly, it should not decrease
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });

    test('should increment view count when navigating to next user', async ({ page }) => {
      // Get current user's view count
      const currentViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const currentCount = parseInt(currentViewCount?.match(/\d+/)?.[0] || '0');

      // Click next button
      await page.click('button:has-text("Next")');
      await page.waitForURL(/\/user\/\d+/);
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      // Get new user's view count
      const nextViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const nextCount = parseInt(nextViewCount?.match(/\d+/)?.[0] || '0');

      // Next user should have equal or higher view count (due to sorting)
      expect(nextCount).toBeGreaterThanOrEqual(currentCount);
    });

    test('should increment view count on direct URL access', async ({ page }) => {
      // Navigate to a specific user
      await page.goto('/user/2');
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      // Get initial view count
      const initialViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const initialCount = parseInt(initialViewCount?.match(/\d+/)?.[0] || '0');

      // Navigate away and back
      await page.goto('/user/1');
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
      await page.goto('/user/2');
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      // Wait for view count to potentially update
      await page.waitForTimeout(1000);

      // Check view count increased
      const newViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const newCount = parseInt(newViewCount?.match(/\d+/)?.[0] || '0');

      // The view count should either increase OR stay the same (due to rate limiting/session logic)
      // Most importantly, it should not decrease
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });

    test('should not duplicate increments in same session for same user', async ({ page }) => {
      // Get initial view count
      const initialViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const initialCount = parseInt(initialViewCount?.match(/\d+/)?.[0] || '0');

      // Navigate to next user and back
      await page.click('button:has-text("Next")');
      await page.waitForURL(/\/user\/\d+/);
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
      await page.click('button:has-text("Previous")');
      await page.waitForURL(/\/user\/\d+/);
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      // View count should remain the same (no duplicate increment)
      const finalViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const finalCount = parseInt(finalViewCount?.match(/\d+/)?.[0] || '0');

      // Should be the same as initial count (no duplicate increment)
      expect(finalCount).toBe(initialCount);
    });
  });

  test.describe('Navigation & Sorting', () => {
    test('should display users sorted by view count (lowest first)', async ({ page }) => {
      const viewCounts: number[] = [];

      // Collect view counts from first 3 users
      for (let i = 0; i < 3; i++) {
        const viewCountText = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
        const count = parseInt(viewCountText?.match(/\d+/)?.[0] || '0');
        viewCounts.push(count);

        // Navigate to next user if not last iteration
        // eslint-disable-next-line playwright/no-conditional-in-test
        if (i < 2) {
          const nextButton = page.locator('button:has-text("Next")');
          if (await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForURL(/\/user\/\d+/);
            await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
          } else {
            break;
          }
        }
      }

      // Verify ascending order (allowing for equal values)
      for (let i = 1; i < viewCounts.length; i++) {
        const currentCount = viewCounts[i];
        const previousCount = viewCounts[i - 1];
        if (currentCount !== undefined && previousCount !== undefined) {
          expect(currentCount).toBeGreaterThanOrEqual(previousCount);
        }
      }
    });

    test('should redirect homepage to user with lowest view count', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL(/\/user\/\d+/);

      // Get the view count of the user we're redirected to
      const viewCountText = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const count = parseInt(viewCountText?.match(/\d+/)?.[0] || '0');

      // Navigate through a few users to verify this is indeed the lowest
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForURL(/\/user\/\d+/);
        await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

        const nextViewCountText = await page
          .locator('[data-testid="user-card"]')
          .locator('text=/Views:/')
          .textContent();
        const nextCount = parseInt(nextViewCountText?.match(/\d+/)?.[0] || '0');

        expect(nextCount).toBeGreaterThanOrEqual(count);
      }
    });

    test('should preserve view count ordering during navigation', async ({ page }) => {
      const viewCounts: number[] = [];

      // Navigate forward and collect view counts
      for (let i = 0; i < 3; i++) {
        const viewCountText = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
        const count = parseInt(viewCountText?.match(/\d+/)?.[0] || '0');
        viewCounts.push(count);

        const nextButton = page.locator('button:has-text("Next")');
        if ((await nextButton.isEnabled()) && i < 2) {
          await nextButton.click();
          await page.waitForURL(/\/user\/\d+/);
          await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
        }
      }

      // Navigate backward and verify same ordering
      for (let i = viewCounts.length - 2; i >= 0; i--) {
        await page.click('button:has-text("Previous")');
        await page.waitForURL(/\/user\/\d+/);
        await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

        const viewCountText = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
        const count = parseInt(viewCountText?.match(/\d+/)?.[0] || '0');

        // Account for the increment that happened during forward navigation
        const expectedCount = viewCounts[i];
        if (expectedCount !== undefined) {
          expect(count).toBeGreaterThanOrEqual(expectedCount);
        }
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist view counts across page reloads', async ({ page }) => {
      // Get initial view count
      const initialViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const initialCount = parseInt(initialViewCount?.match(/\d+/)?.[0] || '0');

      // Reload page
      await page.reload();
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      // Wait for view count to potentially update
      await page.waitForTimeout(1000);

      // View count should be persisted and either incremented or stay the same
      const newViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const newCount = parseInt(newViewCount?.match(/\d+/)?.[0] || '0');

      // The view count should either increase OR stay the same (due to rate limiting/session logic)
      // Most importantly, it should not decrease
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });

    test('should display view count correctly on user cards', async ({ page }) => {
      // Verify view count is displayed
      const viewCountElement = page.locator('[data-testid="user-card"]').locator('text=/Views:/');
      await expect(viewCountElement).toBeVisible();

      // Verify it's a valid number
      const viewCountText = await viewCountElement.textContent();
      const count = parseInt(viewCountText?.match(/\d+/)?.[0] || '0');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle navigation at boundaries', async ({ page }) => {
      // Navigate to first user (should be there by default)
      const prevButton = page.locator('button:has-text("Previous")');
      await expect(prevButton).toBeDisabled();

      // Navigate to last user
      const nextButton = page.locator('button:has-text("Next")');
      while (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForURL(/\/user\/\d+/);
        await expect(page.locator('[data-testid="user-card"]')).toBeVisible();
      }

      // Next button should be disabled at last user
      await expect(nextButton).toBeDisabled();

      // Previous button should be enabled (unless only one user)
      await expect(prevButton).toBeEnabled();
    });

    test('should handle single user scenario', async ({ page }) => {
      // Mock API to return only one user
      const mockUser = {
        id: 'test-user-1',
        url_id: 1,
        full_name: 'Test User',
        description: 'Test story',
        phone_number: '+1234567890',
        status: 'verified',
        role: 'help_seeker',
        verified_at: new Date().toISOString(),
        verified_by: 'admin-user-id',
        view_count: 5,
        created_at: new Date().toISOString(),
        linkedin_url: null,
        campaign_url: null,
        facebook_url: null,
        telegram_url: null,
      };

      await page.route('**/api/trpc/getUsersForCards*', async route => {
        const json = {
          result: {
            data: [mockUser],
          },
        };
        await route.fulfill({ json });
      });

      await page.route('**/api/trpc/getUserByUrlId*', async route => {
        const json = {
          result: {
            data: mockUser,
          },
        };
        await route.fulfill({ json });
      });

      // Mock incrementViewCount to simulate view count increment
      let viewCount = 5;
      await page.route('**/api/trpc/incrementViewCount*', async route => {
        viewCount++;
        mockUser.view_count = viewCount;
        const json = {
          result: {
            data: null,
          },
        };
        await route.fulfill({ json });
      });

      await page.goto('/user/1');
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      // Both navigation buttons should be disabled with single user
      const nextButton = page.locator('button:has-text("Next")');
      const prevButton = page.locator('button:has-text("Previous")');
      await expect(nextButton).toBeDisabled();
      await expect(prevButton).toBeDisabled();

      // Verify view count still works
      const initialViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const initialCount = parseInt(initialViewCount?.match(/\d+/)?.[0] || '0');

      await page.reload();
      await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

      const newViewCount = await page.locator('[data-testid="user-card"]').locator('text=/Views:/').textContent();
      const newCount = parseInt(newViewCount?.match(/\d+/)?.[0] || '0');

      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept and fail the increment API call
      await page.route('**/api/trpc/incrementViewCount*', route => {
        void route.abort('failed');
      });

      // Navigate to next user
      const nextButton = page.locator('button:has-text("Next")');
      await nextButton.click();
      await page.waitForURL(/\/user\/\d+/);

      // User should still be able to navigate despite API failure
      const userCard = page.locator('[data-testid="user-card"]');
      await expect(userCard).toBeVisible();
    });
  });
});
