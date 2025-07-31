/**
 * Test data utilities for E2E tests
 * Since email verification is disabled, we can use unique test emails
 */

export interface TestUser {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly phoneNumber: string;
}

export interface TestCase {
  readonly title: string;
  readonly description: string;
  readonly category: string;
}

/**
 * Generate a unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `e2e-test-${timestamp}-${random}@test.e2e`;
}

/**
 * Generate a unique test user
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return {
    email: `e2e-test-${timestamp}-${random}@test.e2e`,
    password: "TestPassword123!",
    fullName: `Test User ${timestamp}`,
    phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  };
}

/**
 * Generate test case data
 */
export function generateTestCase(): TestCase {
  const timestamp = Date.now();

  return {
    title: `Test Case ${timestamp}`,
    description: `This is a test case for E2E testing created at ${new Date().toISOString()}`,
    category: "general",
  };
}

/**
 * Predefined test users for consistent testing
 */
export const PREDEFINED_TEST_USERS = {
  helpSeeker: {
    email: "test-user@example.com",
    password: "password123",
    fullName: "Test User",
    phoneNumber: "+1234567890",
  },
  admin: {
    email: "admin@example.com",
    password: "admin123",
    fullName: "Admin User",
    phoneNumber: "+1234567891",
  },
} as const;

/**
 * Test case templates
 */
export const TEST_CASES = {
  basic: {
    title: "Basic Help Request",
    description: "I need help with basic daily tasks",
    category: "general",
  },
  urgent: {
    title: "Urgent Medical Help",
    description: "Need immediate medical assistance",
    category: "medical",
  },
  financial: {
    title: "Financial Assistance",
    description: "Need help with bills and expenses",
    category: "financial",
  },
} as const;
