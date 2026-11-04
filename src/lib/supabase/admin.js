import { createClient } from "@supabase/supabase-js";

// Supabase client with the secret key, for server code only (Server Actions).
// Never import this from a Client Component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
