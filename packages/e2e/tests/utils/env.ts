import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), `.env-test`) });

// Environment variable schema for E2E tests
const envSchema = z.object({
  // NODE_ENV: z.enum(['development', 'production', 'test']),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  CI: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

// Parse and validate environment variables
const envParseResult = envSchema.safeParse(process.env);

if (!envParseResult.success) {
  throw new Error(`Invalid E2E environment variables: ${envParseResult.error.message}`);
}

export const env = envParseResult.data;
