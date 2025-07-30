// TypeScript types derived from Zod schemas for airtight type safety
import { z } from 'zod';
import {
  UserSchema,
  UserRegistrationSchema,
  UserLoginSchema,
  UserProfileUpdateSchema,
  UserImageSchema,
  HelpSeekerSubmissionSchema,
  HelpSeekerUpdateSchema,
  HelpSeekerVerificationSchema,
} from './schemas/user';

import { AdminActionSchema, AdminActionInputSchema, AuditLogSchema } from './schemas/admin';

import { PaginationSchema, UserFilterSchema } from './schemas/api';

// Core entity types
export type User = z.infer<typeof UserSchema>;
export type UserImage = z.infer<typeof UserImageSchema>;
export type AdminAction = z.infer<typeof AdminActionSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

// Input/Output types
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
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

// Utility types
export type UserRole = User['role'];
export type SeekerStatus = User['status'];
export type UrgencyLevel = User['urgencyLevel'];
export type ContactPreference = User['contactPreference'];
export type AdminActionType = AdminAction['action'];

// Re-export schemas for runtime validation
export * from './schemas/user';
export * from './schemas/admin';
export * from './schemas/api';
