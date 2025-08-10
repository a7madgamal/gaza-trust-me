import { z } from 'zod';

// Vite automatically loads env files in this order (highest to lowest priority):
// 1. .env.local (always loaded, ignored by git)
// 2. .env.[mode].local (mode-specific, ignored by git)
// 3. .env.[mode] (mode-specific: .env.development, .env.production)
// 4. .env (base file)
//
// Only variables prefixed with VITE_ are exposed to the client-side code
// Mode is determined by --mode flag or NODE_ENV (defaults to 'development' in dev, 'production' in build)

// Environment variable schema for frontend
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1, 'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is required'),
});

// Parse and validate environment variables
const envParseResult = envSchema.safeParse(import.meta.env);

if (!envParseResult.success) {
  const errorMessages = envParseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');

  throw new Error(`❌ Invalid environment variables:\n${errorMessages}`);
}

// Export validated environment variables
export const env = envParseResult.data;
