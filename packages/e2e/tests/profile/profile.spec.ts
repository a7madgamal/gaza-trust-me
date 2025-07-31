import {test, expect} from "@playwright/test";
import {registerAndLoginUniqueUser} from "../utils/auth-helpers";

// TODO: Enable these tests once backend authentication is properly configured
test.describe.skip("Profile Management", () => {
  test.beforeEach(async ({page}) => {
    // Register and login a unique test user before each test
    await registerAndLoginUniqueUser(page);
  });

  test("should display profile form elements", async ({page}) => {
    await page.goto("/profile");

    // Should show profile form elements
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="profile-fullName-input"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="profile-phoneNumber-input"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="edit-profile-button"]')
    ).toBeVisible();
  });

  test("should allow editing profile information", async ({page}) => {
    await page.goto("/profile");

    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');

    // Update profile information
    const newFullName = "Updated Test User";
    const newPhoneNumber = "+1987654321";

    await page.fill('[data-testid="profile-fullName-input"]', newFullName);
    await page.fill(
      '[data-testid="profile-phoneNumber-input"]',
      newPhoneNumber
    );

    // Verify the values are set
    await expect(
      page.locator('[data-testid="profile-fullName-input"]')
    ).toHaveValue(newFullName);
    await expect(
      page.locator('[data-testid="profile-phoneNumber-input"]')
    ).toHaveValue(newPhoneNumber);

    // Save changes (will fail due to backend config, but we can test the form behavior)
    await page.click('[data-testid="save-profile-button"]');

    // Should show loading state
    await expect(
      page.locator('[data-testid="save-profile-button"]')
    ).toBeDisabled();
  });

  test("should validate profile form fields", async ({page}) => {
    await page.goto("/profile");

    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');

    // Clear required fields
    await page.fill('[data-testid="profile-fullName-input"]', "");

    // Try to save
    await page.click('[data-testid="save-profile-button"]');

    // Should show validation error
    await expect(
      page.locator('[data-testid="profile-fullName-input"]')
    ).toHaveAttribute("aria-invalid", "true");
  });

  test("should cancel profile editing", async ({page}) => {
    await page.goto("/profile");

    // Store original values
    const originalFullName = await page
      .locator('[data-testid="profile-fullName-input"]')
      .inputValue();

    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');

    // Make changes
    await page.fill('[data-testid="profile-fullName-input"]', "Changed Name");

    // Cancel editing
    await page.click('[data-testid="cancel-profile-button"]');

    // Verify original values are restored
    await expect(
      page.locator('[data-testid="profile-fullName-input"]')
    ).toHaveValue(originalFullName);
  });

  test("should show email as read-only", async ({page}) => {
    await page.goto("/profile");

    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');

    // Verify email field is disabled
    await expect(page.locator('[data-testid="profile-email"]')).toBeDisabled();
  });
});
