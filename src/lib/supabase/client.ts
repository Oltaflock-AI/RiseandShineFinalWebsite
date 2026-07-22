"use client";

/**
 * Supabase browser client (singleton).
 *
 * Powers the client-side auth provider in `@/lib/auth`. Reads the public
 * anon key — never the service-role key — so it is safe to ship to the browser.
 * Row Level Security (see supabase/migrations) is what actually protects data.
 *
 * The site is designed to build and run BEFORE Supabase is set up: when the
 * env vars are absent, `supabaseConfigured` is false and callers fall back
 * gracefully instead of throwing.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(URL && ANON);

let browserClient: SupabaseClient | null = null;

/** Get (or lazily create) the shared browser client. Throws only if unconfigured. */
export function createClient(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  browserClient ??= createBrowserClient(URL!, ANON!);
  return browserClient;
}
