import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for server-side usage.
 * This uses the service role or anon key depending on your needs.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
