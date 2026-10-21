import { trackServer } from "@/lib/analytics/server";
import type { createClient } from "@/lib/supabase/server";

type SignInMethod = "email" | "google" | "apple";

type SignInInput = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  method: SignInMethod;
  next: string;
  ref: string;
};

/** Redeems the referral code and records the sign-in; returns where to send the person next. */
export async function finishSignIn({
  supabase,
  userId,
  method,
  next,
  ref,
}: SignInInput): Promise<string> {
  if (ref) {
    const { error } = await supabase.rpc("redeem_referral_code", { p_code: ref });
    if (error) {
      const params = new URLSearchParams({ ref, error: "invalid-code", next });
      return `/complete-signup?${params.toString()}`;
    }
  }

  trackServer(userId, ref ? "user_signed_up" : "user_logged_in", {
    method,
    ...(ref ? { needs_email_confirmation: false } : {}),
  });
  return next;
}
