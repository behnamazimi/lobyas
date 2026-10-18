import { NextResponse, type NextRequest } from "next/server";
import { finishSignIn } from "@/lib/auth/after-sign-in";
import { callbackFailureError, callbackSignInMethod } from "@/lib/auth/callback-flow";
import { normalizeReferralCode } from "@/lib/auth/referral-code";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const ref = normalizeReferralCode(searchParams.get("ref"));
  const flow = searchParams.get("flow");

  if (searchParams.get("error_code") === "user_banned") {
    return NextResponse.redirect(`${origin}/login?error=suspended`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = await finishSignIn({
        supabase,
        userId: data.user.id,
        method: callbackSignInMethod(flow),
        next,
        ref,
      });
      return NextResponse.redirect(`${origin}${destination}`);
    }

    if (error.code === "user_banned") {
      return NextResponse.redirect(`${origin}/login?error=suspended`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${callbackFailureError(flow)}`);
}
