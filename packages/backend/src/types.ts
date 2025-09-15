// TypeScript types derived from generated Supabase types for airtight type safety
import { z } from 'zod';
import type { Database } from './types/GENERATED_database.types';
import {
  AuthRegistrationInputSchema,
  AuthLoginInputSchema,
  UserProfileUpdateSchema,
  CardStackNavigationInputSchema,
  PublicUserSchema,
  UserProfileOutputSchema,
  UserProfileUpdateOutputSchema,
} from './types/supabase-types';

import { AdminActionInputSchema } from './schemas/admin';

import { PaginationSchema, UserFilterSchema } from './schemas/api';

// Legacy schemas (to be removed when fully migrated)
import { HelpSeekerSubmissionSchema, HelpSeekerUpdateSchema, HelpSeekerVerificationSchema } from './schemas/user';

// Core entity types from generated database types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type UserImage = Database['public']['Tables']['user_images']['Row'];
export type AdminAction = Database['public']['Tables']['admin_actions']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Input/Output types from generated schemas
export type AuthRegistrationInput = z.infer<typeof AuthRegistrationInputSchema>;
export type AuthLoginInput = z.infer<typeof AuthLoginInputSchema>;
export type UserProfileUpdateInput = z.infer<typeof UserProfileUpdateSchema>;
export type CardStackNavigationInput = z.infer<typeof CardStackNavigationInputSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type UserProfileOutput = z.infer<typeof UserProfileOutputSchema>;
export type UserProfileUpdateOutput = z.infer<typeof UserProfileUpdateOutputSchema>;

// Legacy types from old schemas (to be removed when fully migrated)
export type HelpSeekerSubmission = z.infer<typeof HelpSeekerSubmissionSchema>;
export type HelpSeekerUpdate = z.infer<typeof HelpSeekerUpdateSchema>;
export type HelpSeekerVerification = z.infer<typeof HelpSeekerVerificationSchema>;
export type AdminActionInput = z.infer<typeof AdminActionInputSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type UserFilter = z.infer<typeof UserFilterSchema>;

// Generic API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utility types from generated enums
export type UserRole = Database['public']['Enums']['user_role'];
export type SeekerStatus = Database['public']['Enums']['seeker_status'];
export type AdminActionType = AdminAction['action_type'];

// Re-export generated schemas for runtime validation
export * from './types/supabase-types';

// Legacy schema exports (to be removed when fully migrated)
export * from './schemas/admin';
export * from './schemas/api';
