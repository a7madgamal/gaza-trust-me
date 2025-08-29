import { createClient } from '@supabase/supabase-js';
import type { UserRole, SeekerStatus } from '../../../backend/src/types/supabase-types';
import type { Database } from '../../../backend/src/types/GENERATED_database.types';
import { env } from './env';
import { testTRPC } from './trpc-client';

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

// important: keep all emails here lowwer case!
const TEST_USERS = {
  helpSeeker: {
    email: 'seeker@seeker.com',
    password: 'testtest1',
    fullName: 'Help Seeker',
    phoneNumber: '9999999',
    linkedinUrl: 'https://linkedin.com/in/help-seeker',
    campaignUrl: 'https://gofundme.com/help-seeker-campaign',
    role: 'help_seeker' as const,
    status: 'verified' as const,
  },
  helpSeekerPending: {
    email: 'seeker-pending@seeker.com',
    password: 'testtest1',
    fullName: 'Help Seeker Pending',
    phoneNumber: '9999999',
    linkedinUrl: 'https://linkedin.com/in/help-seeker-pending',
    campaignUrl: 'https://gofundme.com/help-seeker-pending-campaign',
    role: 'help_seeker' as const,
    status: 'pending' as const,
  },
  admin: {
    email: 'admin@admin.com',
    password: 'testtest1',
    fullName: 'Ahmed Admn',
    phoneNumber: '9999999',
    role: 'admin' as const,
    status: 'verified' as const,
  },
  adminWithLinks: {
    email: 'admin-with-links@admin.com',
    password: 'testtest1',
    fullName: 'Admin With Links',
    phoneNumber: '9999999',
    linkedinUrl: 'https://linkedin.com/in/admin-with-links',
    campaignUrl: 'https://gofundme.com/admin-with-links-campaign',
    role: 'admin' as const,
    status: 'verified' as const,
  },
  superAdmin: {
    email: 'superadmin@test.com',
    password: 'testtest1',
    fullName: 'Super Admin',
    phoneNumber: '9999999',
    role: 'super_admin' as const,
    status: 'verified' as const,
  },
  userWithLinkedinandcampaign: {
    email: 'liandcampaing@liandcampain.com',
    password: 'testtest1',
    fullName: 'userWithLinkedinandcampaign',
    phoneNumber: '9999999',
    linkedinUrl: 'https://linkedin.com/in/userWithLinkedinandcampaign',
    campaignUrl: 'https://gofundme.com/userWithLinkedinandcampaign',
    role: 'help_seeker' as const,
    status: 'verified' as const,
  },
} as const;
/**
 * Predefined test users for consistent testing
 * These users should NEVER be deleted or edited by tests
 */
export const PREDEFINED_TEST_USERS: Record<
  keyof typeof TEST_USERS,
  {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    linkedinUrl?: string;
    campaignUrl?: string;
    role: UserRole;
    status: SeekerStatus;
  }
> = TEST_USERS;

/**
 * Create a predefined test user in the database for testing
 */
export async function createTestUserViaAPI(userType: keyof typeof PREDEFINED_TEST_USERS): Promise<number> {
  const user = PREDEFINED_TEST_USERS[userType];

  // Create Supabase client for direct database access with service role key to bypass RLS
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

  // First check if user exists in users table
  const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email);

  if (existingUserError) {
    console.log({ existingUserError });
  }

  // If user doesn't exist in users table, create the profile manually
  if (!existingUser || existingUser.length === 0) {
    // Check if orphaned auth user exists (auth user without profile)
    // Get ALL auth users without pagination to ensure we find any orphaned user
    const { data: authUsers, error: getUserError } = await supabase.auth.admin.listUsers();

    if (getUserError) {
      console.log('DEBUG: Error fetching auth users:', getUserError);
    }

    const orphanedAuthUser = authUsers?.users?.find(u => u.email?.toLowerCase() === user.email.toLowerCase());

    if (orphanedAuthUser) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(orphanedAuthUser.id);

      if (deleteError) {
        console.log(`DEBUG: Failed to delete orphaned auth user:`, deleteError);
      }
    } else {
      console.log('DEBUG: No orphaned auth user found, proceeding with registration');
    }

    console.log('DEBUG: Attempting to register new user via API...');
    try {
      // Use typed tRPC client instead of raw fetch
      const result = await testTRPC.register.mutate({
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        description: `${user.fullName} test user - This is a test user created for automated testing purposes.`,
        linkedinUrl: user.linkedinUrl || '',
        campaignUrl: user.campaignUrl || '',
      });

      // The result is wrapped in an ApiResponse structure
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('DEBUG: Error creating test user via API:', error);
      throw new Error(`Failed to create test user: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Update user data to match TEST_USERS definition
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      full_name: user.fullName,
      phone_number: user.phoneNumber,
      linkedin_url: user.linkedinUrl || null,
      campaign_url: user.campaignUrl || null,
      status: user.status,
      role: user.role,
    })
    .eq('email', user.email)
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
