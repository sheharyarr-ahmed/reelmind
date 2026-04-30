import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  // PKCE code flow (modern Supabase email templates)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Implicit token_hash flow (legacy Supabase email templates)
  const VALID_TYPES = ["email", "magiclink", "recovery", "invite", "signup"] as const;
  if (tokenHash && type && (VALID_TYPES as readonly string[]).includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as (typeof VALID_TYPES)[number],
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
