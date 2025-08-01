// Type utilities for tRPC integration
// These extend the generated Supabase types for easier use in tRPC

import type { Database } from './database.types';

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
