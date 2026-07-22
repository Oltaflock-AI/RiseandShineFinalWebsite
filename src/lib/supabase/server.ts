import "server-only";

/**
 * Supabase server client — for Server Components, Route Handlers and Server
 * Actions. Reads/writes the auth session cookies via Next's async `cookies()`.
 *
 * Always verify the user with `supabase.auth.getUser()` (which re-validates the
 * JWT with Supabase) for anything security-sensitive — never trust
 * `getSession()` alone on the server.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In a Server Component `cookies()` is read-only — the middleware
          // refreshes the session there, so we can safely ignore the throw.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* called from a Server Component — middleware handles refresh */
          }
        },
      },
    },
  );
}

/** Convenience: the verified current user (or null), for server-side gating. */
export async function getUser() {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
