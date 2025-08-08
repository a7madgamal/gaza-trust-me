import { createClient } from '@supabase/supabase-js';
import type { UserInsert, UserRole, SeekerStatus } from '../../../backend/src/types/supabase-types';

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
  role: UserRole;
  status: SeekerStatus;
  linkedin_url?: string;
  campaign_url?: string;
  email?: string;
}): Promise<number> {
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
  const userId = result.result.data.data.userId;

  // Create Supabase client for direct database access with service role key to bypass RLS
  const supabase = createClient(process.env['SUPABASE_URL']!, process.env['SUPABASE_SECRET_KEY']!);

  // First check if user exists in users table
  const { data: existingUser } = await supabase.from('users').select('*').eq('id', userId);

  // If user doesn't exist in users table, create the profile manually
  if (!existingUser || existingUser.length === 0) {
    const userInsert: UserInsert = {
      email: `test-${Date.now()}@example.com`,
      id: userId,
      full_name: userData.full_name,
      phone_number: userData.phone_number,
      description: userData.description,
      ...(userData.linkedin_url && { linkedin_url: userData.linkedin_url }),
      ...(userData.campaign_url && { campaign_url: userData.campaign_url }),
      status: userData.status,
      role: userData.role,
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert(userInsert)
      .select('url_id')
      .single();

    if (createError) {
      throw new Error(`Failed to create user profile: ${createError.message}`);
    }

    return createdUser.url_id;
  }

  // Update user status directly in Supabase
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ status: userData.status })
    .eq('id', userId)
    .select('url_id')
    .single();

  if (updateError) {
    throw new Error(`Failed to update user status: ${updateError.message}`);
  }

  if (!updatedUser) {
    throw new Error('Failed to get updated user data');
  }

  return updatedUser.url_id;
}
