import { test, expect } from '@playwright/test';
import { loginAsUser } from './utils/auth-helpers';

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display title and navigation when not logged in', async ({ page }) => {
    // Check title is visible and clickable
    const title = page.getByText('Help-Seeking Platform');
    await expect(title).toBeVisible();

    // Check login and register buttons are visible
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

    // Check no user menu is shown
    await expect(page.getByRole('button', { name: 'account of current user' })).toBeHidden();
  });

  test('should navigate to home when title is clicked', async ({ page }) => {
    // Navigate to a different page first
    await page.goto('http://localhost:3000/login');

    // Click the title
    await page.getByText('Help-Seeking Platform').click();

    // Should navigate back to home
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should navigate to login when login button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('should navigate to register when register button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL('http://localhost:3000/register');
  });

  test.describe('Logged in user', () => {
    test('should display user info and menu when logged in as help seeker', async ({ page }) => {
      await loginAsUser(page, 'helpSeeker');

      // Check user info is displayed
      await expect(page.getByText('Help Seeker')).toBeVisible();
      await expect(page.getByText('(Help Seeker)')).toBeVisible();

      // Check account menu button is visible
      await expect(page.getByRole('button', { name: 'account of current user' })).toBeVisible();

      // Check login/register buttons are hidden
      await expect(page.getByRole('button', { name: 'Login' })).toBeHidden();
      await expect(page.getByRole('button', { name: 'Register' })).toBeHidden();
    });

    test('should display user info and menu when logged in as admin', async ({ page }) => {
      await loginAsUser(page, 'admin');

      // Check user info is displayed - target the header specifically
      await expect(page.getByRole('banner').getByText('Admin 1')).toBeVisible();
      await expect(page.getByRole('banner').getByText('(Admin)')).toBeVisible();

      // Check account menu button is visible
      await expect(page.getByRole('button', { name: 'account of current user' })).toBeVisible();
    });

    test('should open user menu when account icon is clicked', async ({ page }) => {
      await loginAsUser(page, 'helpSeeker');

      // Click account menu
      await page.getByRole('button', { name: 'account of current user' }).click();

      // Check menu items are visible
      await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    });

    test('should navigate to profile when profile menu item is clicked', async ({ page }) => {
      await loginAsUser(page, 'helpSeeker');

      // Open menu and click profile
      await page.getByRole('button', { name: 'account of current user' }).click();
      await page.getByRole('menuitem', { name: 'Profile' }).click();

      // Should navigate to profile page
      await expect(page).toHaveURL('http://localhost:3000/profile');
    });

    test('should navigate to dashboard when dashboard menu item is clicked', async ({ page }) => {
      await loginAsUser(page, 'helpSeeker');

      // Open menu and click dashboard
      await page.getByRole('button', { name: 'account of current user' }).click();
      await page.getByRole('menuitem', { name: 'Dashboard' }).click();

      // Should navigate to dashboard page
      await expect(page).toHaveURL('http://localhost:3000/dashboard');
    });

    test('should navigate to admin dashboard when admin clicks dashboard', async ({ page }) => {
      await loginAsUser(page, 'admin');

      // Open menu and click dashboard
      await page.getByRole('button', { name: 'account of current user' }).click();
      await page.getByRole('menuitem', { name: 'Dashboard' }).click();

      // Should navigate to admin dashboard
      await expect(page).toHaveURL('http://localhost:3000/admin/dashboard');
    });

    test('should logout and redirect to home when logout is clicked', async ({ page }) => {
      await loginAsUser(page, 'helpSeeker');

      // Open menu and click logout
      await page.getByRole('button', { name: 'account of current user' }).click();
      await page.getByRole('menuitem', { name: 'Logout' }).click();

      // Should redirect to home
      await expect(page).toHaveURL('http://localhost:3000/');

      // Should show login/register buttons again
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

      // Should not show user menu
      await expect(page.getByRole('button', { name: 'account of current user' })).toBeHidden();
    });

    test('should close menu when clicking outside', async ({ page }) => {
      await loginAsUser(page, 'helpSeeker');

      // Open menu
      await page.getByRole('button', { name: 'account of current user' }).click();
      await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();

      // Click outside menu
      await page.click('body');

      // Menu should be closed
      await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeHidden();
    });

    test('should display full name when available', async ({ page }) => {
      await loginAsUser(page, 'helpSeeker');

      // Should show the full name from user profile
      await expect(page.getByText('Help Seeker')).toBeVisible();
    });
  });

  test.describe('Responsive behavior', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check title is still visible
      await expect(page.getByText('Help-Seeking Platform')).toBeVisible();

      // Check buttons are still accessible
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    });

    test('should work on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Check all elements are visible
      await expect(page.getByText('Help-Seeking Platform')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    });
  });
});
