import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  // Debug envelope — surface what came in and any exchange error
  const debug: Record<string, string> = {
    hasCode: code ? "1" : "0",
    hasTokenHash: tokenHash ? "1" : "0",
    type: type ?? "none",
  };

  const supabase = await createClient();

  // Path 1: PKCE code flow (modern)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    debug.exchangeError = error.message;
    debug.exchangeStatus = String(error.status ?? "");
    debug.exchangeName = error.name ?? "";
  }

  // Path 2: implicit token_hash flow (older Supabase email templates)
  const VALID_TYPES = ["email", "magiclink", "recovery", "invite", "signup"] as const;
  if (tokenHash && type && (VALID_TYPES as readonly string[]).includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as (typeof VALID_TYPES)[number],
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    debug.verifyError = error.message;
    debug.verifyStatus = String(error.status ?? "");
  }

  const params = new URLSearchParams({ error: "auth", ...debug });
  return NextResponse.redirect(`${origin}/login?${params.toString()}`);
}
