import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;

/**
 * Creates a Supabase client for server-side usage.
 * Uses service role key for full admin access (bypasses RLS).
 * Only use this in server-side code, never in client components.
 */
export async function createClient(): Promise<SupabaseClient> {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  }

  return supabase;
}
