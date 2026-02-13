import { createClient } from '@supabase/supabase-js';

// Regular Supabase client for auth validation
// This client uses the anon key and can validate user JWT tokens
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
