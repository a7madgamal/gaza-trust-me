import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from multiple sources (in order of priority):
// 1. System environment variables (highest priority)
// 2. .env file
// 3. .env.local file (if exists)
// 4. .env.development/.env.production (based on NODE_ENV)

// Load .env file first
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Load .env.local if it exists (for local overrides)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Load environment-specific file
const nodeEnv = process.env['NODE_ENV'];
if (!nodeEnv) {
  throw new Error('NODE_ENV environment variable is required');
} else {
  console.info(`NODE_ENV: ${nodeEnv}`);
}
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  PORT: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().positive()),
  // Email verification settings
  ENABLE_EMAIL_VERIFICATION: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  FRONTEND_URL: z.string().url().optional(),
});

// Parse and validate environment variables
const envParseResult = envSchema.safeParse(process.env);

if (!envParseResult.success) {
  throw new Error(`Invalid environment variables: ${envParseResult.error.message}`);
}

export const env = envParseResult.data;
