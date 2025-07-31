import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(2),
  phoneNumber: z.string(),
  role: z.enum(['help_seeker', 'admin', 'super_admin']),
  // Help seeker specific fields
  description: z.string().optional(),
  status: z.enum(['pending', 'verified', 'flagged']).optional(),
  verifiedBy: z.string().uuid().optional(),
  verifiedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UserProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').optional(),
});

export const HelpSeekerSubmissionSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const HelpSeekerUpdateSchema = HelpSeekerSubmissionSchema.partial();

export const HelpSeekerVerificationSchema = z.object({
  action: z.enum(['verify', 'flag'], {
    errorMap: () => ({ message: 'Action must be either verify or flag' }),
  }),
  remarks: z.string().optional(),
});

export const UserImageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  createdAt: z.date(),
});

export const USER_ROLES = ['help_seeker', 'admin', 'super_admin'] as const;
export const SEEKER_STATUSES = ['pending', 'verified', 'flagged'] as const;
