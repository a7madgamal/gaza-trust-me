// Re-export the actual tRPC router type from backend
export type {AppRouter} from "@gazaconfirm/backend";
export {appRouter} from "@gazaconfirm/backend";

// Also export the schemas for use in other packages
import {z} from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema.optional(),
    error: z.string().optional(),
  });

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().optional(),
  role: z.string(),
  description: z.string(),
  status: z.string(),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().optional(),
});
