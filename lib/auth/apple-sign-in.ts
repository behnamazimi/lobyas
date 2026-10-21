import { finishSignIn } from "@/lib/auth/after-sign-in";
import { normalizeReferralCode } from "@/lib/auth/referral-code";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

const MAX_TOKEN_LENGTH = 8192;
const MAX_NONCE_LENGTH = 256;

export type AppleSignInInput = { idToken: string; nonce: string; next: string; ref: string };

export type AppleSignInError = "suspended" | "oauth-failed";

function readString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) return null;
  return value;
}

export function readAppleSignInInput(body: unknown): AppleSignInInput | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  const idToken = readString(record.idToken, MAX_TOKEN_LENGTH);
  const nonce = readString(record.nonce, MAX_NONCE_LENGTH);
  if (!idToken || !nonce) return null;

  return {
    idToken,
    nonce,
    next: safeNextPath(typeof record.next === "string" ? record.next : null, "/complete-signup"),
    ref: normalizeReferralCode(typeof record.ref === "string" ? record.ref : undefined),
  };
}

export function appleSignInError(code: string | undefined): AppleSignInError {
  return code === "user_banned" ? "suspended" : "oauth-failed";
}

/** Signs in with the ID token Apple gave the app or the page; returns where to send the person. */
export async function signInWithAppleToken({
  idToken,
  nonce,
  next,
  ref,
}: AppleSignInInput): Promise<{ redirectTo: string } | { error: AppleSignInError }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: idToken,
    nonce,
  });

  if (error || !data.user) {
    return { error: appleSignInError(error?.code) };
  }

  const redirectTo = await finishSignIn({
    supabase,
    userId: data.user.id,
    method: "apple",
    next,
    ref,
  });
  return { redirectTo };
}
