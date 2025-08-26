// Type utilities for tRPC integration
// These extend the generated Supabase types for easier use in tRPC

import type { Database } from './GENERATED_database.types';
import { z } from 'zod';

// User table types
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type SeekerStatus = Database['public']['Enums']['seeker_status'];

// Helper types for common operations
export type UserProfileUpdate = Pick<UserUpdate, 'full_name' | 'phone_number' | 'description'>;

// Re-export constants for convenience
export const USER_ROLES = ['help_seeker', 'admin', 'super_admin'] as const;
export const SEEKER_STATUSES = ['pending', 'verified', 'flagged'] as const;

// tRPC Input/Output schemas using Supabase types
export const AuthRegistrationInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
  campaignUrl: z.string().url('Invalid campaign URL').or(z.literal('')).optional(),
});

export const AuthLoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const AuthRegistrationOutputSchema = z.object({
  userId: z.string(),
});

export const AuthLoginOutputSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum(USER_ROLES),
    status: z.enum(SEEKER_STATUSES).nullable(),
  }),
});

export const AuthLogoutOutputSchema = z.object({
  success: z.boolean(),
});

// Admin router schemas
export const AdminUserListInputSchema = z.object({
  status: z.enum(SEEKER_STATUSES).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export const AdminUserListOutputSchema = z.object({
  users: z.array(
    z.object({
      id: z.string(),
      url_id: z.number(),
      email: z.string(),
      full_name: z.string(),
      description: z.string(),
      phone_number: z.string(),
      status: z.enum(SEEKER_STATUSES).nullable(),
      role: z.enum(USER_ROLES),
      verified_by: z.string().nullable(),
      created_at: z.string().nullable(),
    })
  ),
  total: z.number(),
});

export const AdminUserActionInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum(['verify', 'flag']),
  remarks: z.string().optional(),
});

export const AdminUserActionOutputSchema = z.object({
  user: z.object({
    id: z.string(),
    status: z.enum(SEEKER_STATUSES).nullable(),
    verified_at: z.string().nullable(),
    verified_by: z.string().nullable(),
  }),
  action: z.enum(['verify', 'flag']),
  remarks: z.string().optional(),
});

// Super admin schemas for user role management
export const SuperAdminUpgradeUserInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newRole: z.enum(['admin', 'help_seeker']),
  remarks: z.string().optional(),
});

export const SuperAdminUpgradeUserOutputSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(USER_ROLES),
    updated_at: z.string().nullable(),
  }),
  action: z.enum(['upgrade_to_admin', 'downgrade_to_help_seeker']),
  remarks: z.string().optional(),
});

// Profile router schemas
export const UserProfileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone_number: z.string().min(1, 'Phone number is required').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
});

export const UserProfileOutputSchema = z.object({
  id: z.string(),
  url_id: z.number(),
  email: z.string(),
  full_name: z.string(),
  phone_number: z.string(),
  role: z.enum(USER_ROLES),
  description: z.string(),
  status: z.enum(SEEKER_STATUSES).nullable(),
  verified_at: z.string().nullable(),
  verified_by: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  campaign_url: z.string().nullable(),
});

export const UserProfileUpdateOutputSchema = z.object({
  user: z.object({
    id: z.string(),
    full_name: z.string(),
    phone_number: z.string(),
    description: z.string(),
    updated_at: z.string().nullable(),
  }),
});

// Public router schemas
export const PublicHelloInputSchema = z.object({
  name: z.string().optional(),
});

export const PublicHelloOutputSchema = z.object({
  greeting: z.string(),
});

export const PublicUsersForCardsInputSchema = z.object({
  limit: z.number().int().positive().max(50).default(10),
  offset: z.number().int().nonnegative().default(0),
});

export const PublicUserSchema = z.object({
  id: z.string().uuid(),
  url_id: z.number(),
  full_name: z.string(),
  description: z.string(),
  phone_number: z.string(),
  status: z.enum(SEEKER_STATUSES).nullable(),
  role: z.enum(USER_ROLES),
  verified_at: z.string().nullable(),
  verified_by: z.string().nullable(),
  created_at: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  campaign_url: z.string().nullable(),
});

export const AdminProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  email: z.string(),
  role: z.enum(['help_seeker', 'admin', 'super_admin']),
  verification_count: z.number(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  phone_number: z.string().nullable(),
  description: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  campaign_url: z.string().nullable(),
});

export const CardStackNavigationInputSchema = z.object({
  direction: z.enum(['next', 'previous']),
  currentUserId: z.string().uuid().optional(),
});

export const GetUserByUrlIdInputSchema = z.object({
  urlId: z.number().int().positive('URL ID must be a positive integer'),
});

// Type exports for tRPC
export type AuthRegistrationInput = z.infer<typeof AuthRegistrationInputSchema>;
export type AuthLoginInput = z.infer<typeof AuthLoginInputSchema>;
export type AuthRegistrationOutput = z.infer<typeof AuthRegistrationOutputSchema>;
export type AuthLoginOutput = z.infer<typeof AuthLoginOutputSchema>;
export type AuthLogoutOutput = z.infer<typeof AuthLogoutOutputSchema>;

export type AdminUserListInput = z.infer<typeof AdminUserListInputSchema>;
export type AdminUserListOutput = z.infer<typeof AdminUserListOutputSchema>;
export type AdminUserActionInput = z.infer<typeof AdminUserActionInputSchema>;
export type AdminUserActionOutput = z.infer<typeof AdminUserActionOutputSchema>;

export type SuperAdminUpgradeUserInput = z.infer<typeof SuperAdminUpgradeUserInputSchema>;
export type SuperAdminUpgradeUserOutput = z.infer<typeof SuperAdminUpgradeUserOutputSchema>;

export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;
export type UserProfileOutput = z.infer<typeof UserProfileOutputSchema>;
export type UserProfileUpdateOutput = z.infer<typeof UserProfileUpdateOutputSchema>;

export type PublicHelloInput = z.infer<typeof PublicHelloInputSchema>;
export type PublicHelloOutput = z.infer<typeof PublicHelloOutputSchema>;
export type PublicUsersForCardsInput = z.infer<typeof PublicUsersForCardsInputSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type CardStackNavigationInput = z.infer<typeof CardStackNavigationInputSchema>;
export type GetUserByUrlIdInput = z.infer<typeof GetUserByUrlIdInputSchema>;
