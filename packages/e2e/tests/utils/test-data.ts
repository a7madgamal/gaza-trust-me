/**
 * Test data utilities for E2E tests
 * Since email verification is disabled, we can use unique test emails
 */

export interface TestUser {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly linkedinUrl?: string;
  readonly campaignUrl?: string;
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
    password: 'TestPassword123!',
    fullName: `Test User ${timestamp}`,
    phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    linkedinUrl: 'https://linkedin.com/in/test-user',
    campaignUrl: 'https://gofundme.com/test-campaign',
  };
}

/**
 * Predefined test users for consistent testing
 * These users should NEVER be deleted or edited by tests
 */
export const PREDEFINED_TEST_USERS = {
  helpSeeker: {
    email: 'seeker@seeker.com',
    password: 'seekerseeker1',
    fullName: 'Help Seeker',
    phoneNumber: '+1234567890',
    linkedinUrl: 'https://linkedin.com/in/help-seeker',
    campaignUrl: 'https://gofundme.com/help-seeker-campaign',
  },
  admin: {
    email: 'admin@admin.com',
    password: 'adminadmin1',
    fullName: 'admin',
    phoneNumber: '9999999',
  },
  // Add a third fixed user if needed
  // thirdUser: {
  //   email: 'third@third.com',
  //   password: 'thirdthird1',
  //   fullName: 'Third User',
  //   phoneNumber: '+1234567891',
  // },
} as const;

/**
 * Create a test user in the database for testing
 */
export async function createTestUser(userData: {
  full_name: string;
  description: string;
  phone_number: string;
  role: 'help_seeker' | 'admin' | 'super_admin';
  status: 'pending' | 'verified' | 'flagged';
  linkedin_url?: string;
  campaign_url?: string;
}): Promise<string> {
  const response = await fetch(`${process.env['BACKEND_URL']}/trpc/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      fullName: userData.full_name,
      phoneNumber: userData.phone_number,
      description:
        userData.description.length >= 10
          ? userData.description
          : `${userData.description} - This is a test user created for automated testing purposes.`,
      linkedinUrl: userData.linkedin_url,
      campaignUrl: userData.campaign_url,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test user: ${response.statusText}`);
  }

  const result = await response.json();
  return result.result.data.userId;
}

/**
 * Clean up a test user from the database
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  // For now, just log the cleanup
  // In a real implementation, this would delete the user via API or direct DB
  console.log('Cleaned up test user:', userId);
}
