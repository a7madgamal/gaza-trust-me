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
  }),
});

export const AuthLogoutOutputSchema = z.object({
  success: z.boolean(),
});

// Type exports for tRPC
export type AuthRegistrationInput = z.infer<typeof AuthRegistrationInputSchema>;
export type AuthLoginInput = z.infer<typeof AuthLoginInputSchema>;
export type AuthRegistrationOutput = z.infer<typeof AuthRegistrationOutputSchema>;
export type AuthLoginOutput = z.infer<typeof AuthLoginOutputSchema>;
export type AuthLogoutOutput = z.infer<typeof AuthLogoutOutputSchema>;
