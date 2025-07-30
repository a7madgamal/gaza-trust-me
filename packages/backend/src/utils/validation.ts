import { z } from 'zod';

// Re-export schemas from local schemas for consistency
export { UserRegistrationSchema, UserLoginSchema, UserProfileUpdateSchema } from '../schemas/user';

export { CaseSubmissionSchema, CaseUpdateSchema, CaseVerificationSchema } from '../schemas/case';

export { CaseFilterSchema } from '../schemas/api';

export { AdminActionInputSchema } from '../schemas/admin';

export { PaginationSchema } from '../schemas/api';

// Utility functions for validation
export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  return schema.parse(input);
};

export const safeValidateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T | null => {
  const result = schema.safeParse(input);
  return result.success ? result.data : null;
};
