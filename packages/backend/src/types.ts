// TypeScript types derived from Zod schemas for airtight type safety
import { z } from 'zod';
import { UserSchema, UserRegistrationSchema, UserLoginSchema, UserProfileUpdateSchema } from './schemas/user';

import {
  CaseSchema,
  CaseImageSchema,
  CaseSubmissionSchema,
  CaseUpdateSchema,
  CaseVerificationSchema,
} from './schemas/case';

import { AdminActionSchema, AdminActionInputSchema, AuditLogSchema } from './schemas/admin';

import { PaginationSchema, CaseFilterSchema } from './schemas/api';

// Core entity types
export type User = z.infer<typeof UserSchema>;
export type Case = z.infer<typeof CaseSchema>;
export type CaseImage = z.infer<typeof CaseImageSchema>;
export type AdminAction = z.infer<typeof AdminActionSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;

// Input/Output types
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type CaseSubmission = z.infer<typeof CaseSubmissionSchema>;
export type CaseUpdate = z.infer<typeof CaseUpdateSchema>;
export type CaseVerification = z.infer<typeof CaseVerificationSchema>;
export type AdminActionInput = z.infer<typeof AdminActionInputSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type CaseFilter = z.infer<typeof CaseFilterSchema>;

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
export type CaseStatus = Case['status'];
export type UrgencyLevel = Case['urgencyLevel'];
export type ContactPreference = Case['contactPreference'];
export type AdminActionType = AdminAction['action'];

// Re-export schemas for runtime validation
export * from './schemas/user';
export * from './schemas/case';
export * from './schemas/admin';
export * from './schemas/api';
