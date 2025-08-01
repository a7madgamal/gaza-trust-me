import { z } from 'zod';

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
  });

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const UserFilterSchema = z.object({
  status: z.enum(['pending', 'verified', 'flagged']).optional(),
  search: z.string().optional(),
});

export const PublicUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  description: z.string(),
  phone_number: z.string(),
  status: z.enum(['pending', 'verified', 'flagged']),
  role: z.enum(['help_seeker', 'admin', 'super_admin']),
  created_at: z.string(), // More flexible for different date formats
});

export const CardStackNavigationSchema = z.object({
  direction: z.enum(['next', 'previous']),
  currentUserId: z.string().uuid().optional(),
});
