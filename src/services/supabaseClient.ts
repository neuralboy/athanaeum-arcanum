import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
}
