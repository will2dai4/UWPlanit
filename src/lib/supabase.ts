import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.types";

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// ---------------------------------------------------------------------------
// Server-side client (service-role key) — DO NOT expose to the browser.
// ---------------------------------------------------------------------------
export const supabaseAdmin: SupabaseClient<Database> = isSupabaseConfigured()
  ? createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { "X-Client-Info": "uw-graph-server" } },
      }
    )
  : (null as unknown as SupabaseClient<Database>); // Fallback to null if not configured (with type assertion for compatibility)

// ---------------------------------------------------------------------------
// Browser / RSC client — uses the public anon key, created lazily to reduce
// bundle weight when not needed client-side.
// ---------------------------------------------------------------------------
export const supabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    console.warn(
      "Supabase not configured. Please set SUPABASE_URL and SUPABASE keys in your environment variables."
    );
    return null;
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: true, persistSession: true },
    }
  );
}; 