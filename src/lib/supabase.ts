import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase.types";

// ---------------------------------------------------------------------------
// Server-side client (service-role key) — DO NOT expose to the browser.
// ---------------------------------------------------------------------------
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "uw-graph-server" } },
  }
);

// ---------------------------------------------------------------------------
// Browser / RSC client — uses the public anon key, created lazily to reduce
// bundle weight when not needed client-side.
// ---------------------------------------------------------------------------
export const supabaseClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: true, persistSession: true },
    }
  ); 