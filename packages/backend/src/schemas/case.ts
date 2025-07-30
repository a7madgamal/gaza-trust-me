import { z } from 'zod';

export const CaseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().min(2),
  description: z.string().min(10),
  contactPreference: z.enum(['gofundme', 'whatsapp']),
  contactInfo: z.string().min(1),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().min(1),
  status: z.enum(['pending', 'verified', 'flagged']),
  adminRemarks: z.string().optional(),
  verifiedBy: z.string().uuid().optional(),
  verifiedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CaseSubmissionSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contactPreference: z.enum(['gofundme', 'whatsapp'], {
    errorMap: () => ({
      message: 'Contact preference must be either gofundme or whatsapp',
    }),
  }),
  contactInfo: z.string().min(1, 'Contact information is required'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({
      message: 'Urgency level must be low, medium, high, or critical',
    }),
  }),
  location: z.string().min(1, 'Location is required'),
});

export const CaseUpdateSchema = CaseSubmissionSchema.partial();

export const CaseVerificationSchema = z.object({
  action: z.enum(['verify', 'flag'], {
    errorMap: () => ({ message: 'Action must be either verify or flag' }),
  }),
  remarks: z.string().optional(),
});

export const CaseImageSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  createdAt: z.date(),
});

export const CASE_STATUSES = ['pending', 'verified', 'flagged'] as const;
export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export const CONTACT_PREFERENCES = ['gofundme', 'whatsapp'] as const;
