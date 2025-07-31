import {test, expect} from "@playwright/test";

test.describe("User Status Display", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");
  });

  test("should show pending status for new users", async ({page}) => {
    // Register a new user
    await page.goto("/register");

    await page.fill('[data-testid="fullName"]', "Test User");
    await page.fill('[data-testid="email"]', "test-status@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirmPassword"]', "password123");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes"
    );

    await page.click('[data-testid="register-button"]');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);

    // Login with the new user
    await page.fill('[data-testid="email"]', "test-status@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Check for pending status
    await expect(page.locator("text=PENDING VERIFICATION")).toBeVisible();
    await expect(
      page.locator("text=Your account is being reviewed by our team")
    ).toBeVisible();
    await expect(
      page.locator(
        "text=Our team is reviewing your submission. This usually takes 1-2 business days."
      )
    ).toBeVisible();

    // Should not show stats for pending users
    await expect(page.locator("text=Total Cases")).not.toBeVisible();
    await expect(page.locator("text=Recent Cases")).not.toBeVisible();

    // Submit case button should be disabled
    const submitButton = page.locator("text=Submit New Case");
    await expect(submitButton).toBeDisabled();
  });

  test("should show appropriate status colors", async ({page}) => {
    // Test pending status (yellow)
    await page.goto("/register");

    await page.fill('[data-testid="fullName"]', "Pending User");
    await page.fill('[data-testid="email"]', "pending@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirmPassword"]', "password123");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes"
    );

    await page.click('[data-testid="register-button"]');

    await page.goto("/login");
    await page.fill('[data-testid="email"]', "pending@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(/.*dashboard/);

    // Check for yellow background color (pending status)
    const statusBox = page
      .locator("text=PENDING VERIFICATION")
      .locator("..")
      .first();
    await expect(statusBox).toHaveCSS("background-color", "rgb(255, 243, 205)"); // Yellow background
  });

  test("should show error message when profile fails to load", async ({
    page,
  }) => {
    // Mock a failed profile fetch by using an invalid session
    await page.goto("/dashboard");

    // Should show error message
    await expect(
      page.locator(
        "text=Unable to load your account status. Please refresh the page."
      )
    ).toBeVisible();
  });

  test("should handle loading states correctly", async ({page}) => {
    // Navigate to dashboard and check for loading spinner
    await page.goto("/dashboard");

    // Should show loading spinner initially
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test("should show description field in registration form", async ({page}) => {
    await page.goto("/register");

    // Check that description field is present
    await expect(page.locator('[data-testid="description"]')).toBeVisible();
    await expect(
      page.locator(
        "text=Tell us about your situation and what kind of help you need"
      )
    ).toBeVisible();

    // Check that it's a textarea with multiple rows
    const descriptionField = page.locator('[data-testid="description"]');
    await expect(descriptionField).toHaveAttribute("rows", "6");
  });

  test("should validate description field requirements", async ({page}) => {
    await page.goto("/register");

    // Try to submit without description
    await page.fill('[data-testid="fullName"]', "Test User");
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirmPassword"]', "password123");

    await page.click('[data-testid="register-button"]');

    // Should show error for missing description
    await expect(page.locator("text=Description is required")).toBeVisible();

    // Try with too short description
    await page.fill('[data-testid="description"]', "Short");
    await page.click('[data-testid="register-button"]');

    // Should show error for short description
    await expect(
      page.locator("text=Description must be at least 10 characters long")
    ).toBeVisible();

    // Try with valid description
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes"
    );

    // Should not show error
    await expect(
      page.locator("text=Description is required")
    ).not.toBeVisible();
    await expect(
      page.locator("text=Description must be at least 10 characters long")
    ).not.toBeVisible();
  });

  test("should submit form with description field", async ({page}) => {
    await page.goto("/register");

    // Fill out form with valid data
    await page.fill('[data-testid="fullName"]', "Valid User");
    await page.fill('[data-testid="email"]', "valid@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirmPassword"]', "password123");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes"
    );

    // Mock successful registration
    await page.route("**/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "User registered successfully",
        }),
      });
    });

    await page.click('[data-testid="register-button"]');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test("should show loading state during form submission", async ({page}) => {
    await page.goto("/register");

    // Fill out form
    await page.fill('[data-testid="fullName"]', "Loading User");
    await page.fill('[data-testid="email"]', "loading@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirmPassword"]', "password123");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes"
    );

    // Mock slow response
    await page.route("**/auth/register", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "User registered successfully",
        }),
      });
    });

    await page.click('[data-testid="register-button"]');

    // Should show loading spinner
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Button should be disabled
    await expect(
      page.locator('[data-testid="register-button"]')
    ).toBeDisabled();

    // Form fields should be disabled
    await expect(page.locator('[data-testid="fullName"]')).toBeDisabled();
    await expect(page.locator('[data-testid="email"]')).toBeDisabled();
    await expect(page.locator('[data-testid="password"]')).toBeDisabled();
    await expect(
      page.locator('[data-testid="confirmPassword"]')
    ).toBeDisabled();
    await expect(page.locator('[data-testid="description"]')).toBeDisabled();
  });
});
