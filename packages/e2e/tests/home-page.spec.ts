import { test, expect } from './global-test-hook';
import { loginAsUser, clearBrowserState } from './utils/auth-helpers';
import { env } from './utils/env';

test.describe('Home Page', () => {
  test('should load public page and display card stack interface', async ({ page }) => {
    await page.goto('/');

    // Wait for auto-redirect to user URL
    await page.waitForURL(/\/user\/\d+/);

    // Should show the public page title
    await expect(page.getByRole('heading', { name: 'Confirmed from Gaza' })).toBeVisible();

    // Should show the subtitle
    await expect(page.getByText('Browse verified users who need help')).toBeVisible();

    // Should show progress indicator
    await expect(page.getByText(/1 of/)).toBeVisible();

    // Should show main card
    await expect(page.locator('[data-testid="user-card"]')).toBeVisible();

    // Wait for the page to load and show either user data or empty state
    await page.waitForLoadState('domcontentloaded');

    // Check if we have users or empty state
    // We know we have a test user from beforeAll
    await expect(page.locator('[data-testid="user-card"]').getByText('Verified')).toBeVisible();
    await expect(page.locator('[data-testid="user-card"]').getByText('WhatsApp')).toBeVisible();

    // Check if WhatsApp link exists and validate it
    const whatsappLink = page.locator('[data-testid="user-card"]').getByText('WhatsApp');
    const linkCount = await whatsappLink.count();

    // Require at least one WhatsApp link for this test
    expect(linkCount).toBeGreaterThan(0);

    // If we have users, expect WhatsApp link to be present
    await expect(whatsappLink).toBeVisible();

    // Check that the link has the correct format
    const href = await whatsappLink.getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+$/);
  });

  test('should have navigation buttons and handle interactions', async ({ page }) => {
    await page.goto('/');

    // Wait for auto-redirect to user URL
    await page.waitForURL(/\/user\/\d+/);

    // Should show all navigation buttons
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'I contacted' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();

    // Previous button should be disabled initially (first card)
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();

    // I contacted button should be enabled
    await expect(page.getByRole('button', { name: 'I contacted' })).toBeEnabled();

    // Should show instructions
    await expect(page.getByText(/Click "I contacted" when you've reached out to help this person/)).toBeVisible();
  });

  test('should handle API errors and loading states', async ({ page }) => {
    // Mock API error by temporarily changing the endpoint
    await page.route('**/trpc/**', route => {
      console.log('Intercepted tRPC request to:', route.request().url());
      if (route.request().url().includes('getUsersForCards')) {
        void route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              message: 'Internal Server Error',
              code: -32603,
            },
          }),
        });
      } else {
        void route.continue();
      }
    });

    await page.goto('/');

    // Wait for the page to load and error to be displayed
    await page.waitForLoadState('domcontentloaded');

    // Wait for error state to appear
    await expect(page.getByText('Error Loading Users')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Please try refreshing the page.')).toBeVisible();

    // Reset route and test loading state
    await page.unroute('**/trpc/**');

    // Mock slow API response
    await page.route('**/trpc/getUsersForCards', route => {
      // Delay the response to test loading state
      void setTimeout(() => {
        void route.continue();
      }, 1000);
    });

    await page.goto('/');

    // Should show loading spinner initially
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test('should display header and handle navigation when not logged in', async ({ page }) => {
    await page.goto(env.FRONTEND_URL);

    // Check title is visible and clickable
    const title = page.getByText('Help-Seeking Platform');
    await expect(title).toBeVisible();

    // Check login and register buttons are visible
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();

    // Check no user menu is shown
    await expect(page.getByRole('button', { name: 'account of current user' })).toBeHidden();

    // Navigate to a different page first
    await page.goto(`${env.FRONTEND_URL}/login`);

    // Click the title
    void page.getByText('Help-Seeking Platform').click();

    // Should navigate back to home and auto-redirect to user URL
    await page.waitForURL(/\/user\/\d+/);

    // Test navigation buttons
    void page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(`${env.FRONTEND_URL}/login`);

    await page.goto(`${env.FRONTEND_URL}/`);
    void page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(`${env.FRONTEND_URL}/register`);
  });

  test('should handle header navigation for logged in users', async ({ page }) => {
    await page.goto(env.FRONTEND_URL);

    // Test help seeker login
    await loginAsUser(page, 'helpSeeker');

    // Check user info is displayed - target the header specifically
    await expect(page.getByRole('banner').getByText('Help Seeker', { exact: true })).toBeVisible();
    await expect(page.getByRole('banner').getByText('(Help Seeker)')).toBeVisible();

    // Check account menu button is visible
    await expect(page.getByRole('button', { name: 'account of current user' })).toBeVisible();

    // Check login/register buttons are hidden
    await expect(page.getByRole('button', { name: 'Login' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Register' })).toBeHidden();

    // Click account menu
    await page.getByRole('button', { name: 'account of current user' }).click();

    // Check menu items are visible
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();

    // Test navigation to profile
    await page.getByRole('menuitem', { name: 'Profile' }).click();
    await expect(page).toHaveURL(`${env.FRONTEND_URL}/profile`);

    // Go back and test dashboard navigation
    await page.goto(`${env.FRONTEND_URL}/`);
    await page.getByRole('button', { name: 'account of current user' }).click();
    await page.getByRole('menuitem', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(`${env.FRONTEND_URL}/dashboard`);

    // Test logout
    await page.goto(`${env.FRONTEND_URL}/`);
    await page.getByRole('button', { name: 'account of current user' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    // Should show login form
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should handle admin user header and responsive behavior', async ({ page }) => {
    await page.goto(env.FRONTEND_URL);

    // Test admin login
    await loginAsUser(page, 'admin');

    // Check user info is displayed - target the header specifically
    await expect(page.getByRole('banner').getByText('Ahmed Admn', { exact: true })).toBeVisible();
    await expect(page.getByRole('banner').getByText('(Admin)')).toBeVisible();

    // Check account menu button is visible
    await expect(page.getByRole('button', { name: 'account of current user' })).toBeVisible();

    // Test admin dashboard navigation
    await page.getByRole('button', { name: 'account of current user' }).click();
    await page.getByRole('menuitem', { name: 'Dashboard' }).click();

    // Should navigate to admin dashboard
    await expect(page).toHaveURL(`${env.FRONTEND_URL}/admin/dashboard`);

    // Test responsive behavior - go back to home page
    await page.goto(`${env.FRONTEND_URL}/`);
    await page.setViewportSize({ width: 375, height: 667 });

    // Check title is still visible
    await expect(page.getByText('Help-Seeking Platform')).toBeVisible();

    // When logged in as admin, should show user menu, not login/register buttons
    await expect(page.getByRole('button', { name: 'account of current user' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Register' })).toBeHidden();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Check all elements are visible
    await expect(page.getByText('Help-Seeking Platform')).toBeVisible();
    await expect(page.getByRole('button', { name: 'account of current user' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Register' })).toBeHidden();
  });

  test('should handle menu interactions and basic navigation', async ({ page }) => {
    await page.goto(env.FRONTEND_URL);

    // Test menu close behavior
    await loginAsUser(page, 'helpSeeker');

    // Open menu
    await page.getByRole('button', { name: 'account of current user' }).click();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();

    // Click outside menu
    await page.click('body');

    // Menu should be closed
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeHidden();

    // Test basic navigation redirects
    await clearBrowserState(page);
    await page.goto('/dashboard');

    // Wait for authentication check to complete and redirect to happen
    await page.waitForURL('/login');

    // Check that the page loads
    await expect(page).toHaveTitle(/Gazaconfirm/);

    // Check for login form heading
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // Test navigation between auth pages
    await page.getByRole('link', { name: 'Create one' }).click();
    await expect(page).toHaveURL('/register');

    // Check register form elements
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="fullName"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();

    // Navigate back to login
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/login');

    // Check login form elements
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });
});
