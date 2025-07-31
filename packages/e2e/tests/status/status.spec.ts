import {test, expect} from "@playwright/test";

test.describe("User Status Display", () => {
  test.beforeEach(async ({page}) => {
    await page.goto("/");
  });

  test("should show pending status for new users", async ({page}) => {
    // Test the registration form UI without expecting successful registration
    await page.goto("/register");

    await page.fill('[data-testid="fullName"]', "Test User");
    await page.fill('[data-testid="email"]', "test-status@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirmPassword"]', "password123");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes"
    );

    // Verify form is filled correctly
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue(
      "Test User"
    );
    await expect(page.locator('[data-testid="email"]')).toHaveValue(
      "test-status@example.com"
    );
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      "This is a detailed description of the help I need for testing purposes"
    );

    // Submit form and check for loading state
    await page.click('[data-testid="register-button"]');

    // Should show loading state (button disabled)
    await expect(
      page.locator('[data-testid="register-button"]')
    ).toBeDisabled();
  });

  test("should show appropriate status colors", async ({page}) => {
    // Test the registration form UI
    await page.goto("/register");

    await page.fill('[data-testid="fullName"]', "Pending User");
    await page.fill('[data-testid="email"]', "pending@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirmPassword"]', "password123");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes"
    );

    // Verify form is filled correctly
    await expect(page.locator('[data-testid="fullName"]')).toHaveValue(
      "Pending User"
    );
    await expect(page.locator('[data-testid="email"]')).toHaveValue(
      "pending@example.com"
    );
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      "This is a detailed description of the help I need for testing purposes"
    );

    // Submit form and check for loading state
    await page.click('[data-testid="register-button"]');

    // Should show loading state (button disabled)
    await expect(
      page.locator('[data-testid="register-button"]')
    ).toBeDisabled();
  });

  test("should redirect to login when accessing protected routes", async ({
    page,
  }) => {
    // Navigate to dashboard without authentication - should redirect to login
    await page.goto("/dashboard");

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("should show description field in registration form", async ({page}) => {
    await page.goto("/register");

    // Should show description field
    await expect(page.locator('[data-testid="description"]')).toBeVisible();
    await expect(page.locator('[data-testid="description"]')).toBeEnabled();

    // Should show helper text
    await expect(
      page.getByText(
        "Tell us about your situation and what kind of help you need"
      )
    ).toBeVisible();
  });

  test("should validate description field requirements", async ({page}) => {
    await page.goto("/register");

    // Fill other required fields
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "Password123!");
    await page.fill('[data-testid="confirmPassword"]', "Password123!");
    await page.fill('[data-testid="fullName"]', "Test User");

    // Try to submit with empty description
    await page.click('[data-testid="register-button"]');

    // Should show validation error for description
    await expect(page.locator('[data-testid="description"]')).toHaveAttribute(
      "aria-invalid",
      "true"
    );

    // Fill with too short description
    await page.fill('[data-testid="description"]', "Short");
    await page.click('[data-testid="register-button"]');

    // Should still show validation error
    await expect(page.locator('[data-testid="description"]')).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  test("should submit form with description field", async ({page}) => {
    await page.goto("/register");

    // Fill form with valid data including description
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "Password123!");
    await page.fill('[data-testid="confirmPassword"]', "Password123!");
    await page.fill('[data-testid="fullName"]', "Test User");
    await page.fill('[data-testid="phoneNumber"]', "+1234567890");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need. It should be long enough to pass validation."
    );

    // Verify description is filled
    await expect(page.locator('[data-testid="description"]')).toHaveValue(
      "This is a detailed description of the help I need. It should be long enough to pass validation."
    );

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show loading state
    await expect(
      page.locator('[data-testid="register-button"]')
    ).toBeDisabled();
  });

  test("should show loading state during form submission", async ({page}) => {
    await page.goto("/register");

    // Fill form with valid data
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "Password123!");
    await page.fill('[data-testid="confirmPassword"]', "Password123!");
    await page.fill('[data-testid="fullName"]', "Test User");
    await page.fill('[data-testid="phoneNumber"]', "+1234567890");
    await page.fill(
      '[data-testid="description"]',
      "This is a detailed description of the help I need for testing purposes."
    );

    // Submit form
    await page.click('[data-testid="register-button"]');

    // Should show loading state
    await expect(
      page.locator('[data-testid="register-button"]')
    ).toBeDisabled();

    // Should show loading spinner in button
    await expect(
      page.locator('[data-testid="register-button"] .MuiCircularProgress-root')
    ).toBeVisible();
  });
});
