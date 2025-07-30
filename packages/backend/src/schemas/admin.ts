import { z } from 'zod';

export const AdminActionSchema = z.object({
  id: z.string().uuid(),
  adminId: z.string().uuid(),
  caseId: z.string().uuid(),
  action: z.enum(['verify', 'flag']),
  remarks: z.string().optional(),
  createdAt: z.date(),
});

export const AdminActionInputSchema = z.object({
  caseId: z.string().uuid('Invalid case ID'),
  action: z.enum(['verify', 'flag'], {
    errorMap: () => ({ message: 'Action must be either verify or flag' }),
  }),
  remarks: z.string().optional(),
});

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.unknown()),
  ipAddress: z.string(),
  userAgent: z.string(),
  createdAt: z.date(),
});

export const ADMIN_ACTIONS = ['verify', 'flag'] as const;
