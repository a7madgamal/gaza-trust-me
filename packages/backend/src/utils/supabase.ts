import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/GENERATED_database.types';
import { env } from './env';

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
