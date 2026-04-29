import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | undefined;

/**
 * Server-only Supabase client backed by the service role key.
 * NEVER import this from a Client Component or RSC that streams to the client.
 * Used for: Storage uploads in trigger-local.ts, signed URL minting,
 * cross-user admin operations.
 */
export function getAdminClient(): SupabaseClient {
  if (!admin) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local.",
      );
    }
    admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return admin;
}
