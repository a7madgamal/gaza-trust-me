import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
