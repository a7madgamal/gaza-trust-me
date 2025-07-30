import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  role: z.enum(['help_seeker', 'admin', 'super_admin']),
  // Help seeker specific fields
  title: z.string().optional(),
  description: z.string().optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  location: z.string().optional(),
  contactPreference: z.enum(['gofundme', 'whatsapp']).optional(),
  contactValue: z.string().optional(),
  status: z.enum(['pending', 'verified', 'flagged']).optional(),
  verifiedBy: z.string().uuid().optional(),
  verifiedAt: z.date().optional(),
  flaggedBy: z.string().uuid().optional(),
  flagReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UserProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phoneNumber: z.string().optional(),
});

export const HelpSeekerSubmissionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contactPreference: z.enum(['gofundme', 'whatsapp'], {
    errorMap: () => ({
      message: 'Contact preference must be either gofundme or whatsapp',
    }),
  }),
  contactValue: z.string().min(1, 'Contact information is required'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({
      message: 'Urgency level must be low, medium, high, or critical',
    }),
  }),
  location: z.string().min(1, 'Location is required'),
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
export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export const CONTACT_PREFERENCES = ['gofundme', 'whatsapp'] as const;
