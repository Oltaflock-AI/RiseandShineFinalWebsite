import { NextResponse } from "next/server";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

// Exchanges an auth code for a session cookie — never cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /auth/callback — lands the user here after clicking an email-confirmation
 * link (or, later, an OAuth sign-in). Exchanges the `code` for a session and
 * forwards to `next` (default the account page). Safe internal-path check on
 * `next` prevents open-redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";

  if (code && supabaseConfigured) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
