import { NextResponse } from "next/server";
import { readAppleSignInInput, signInWithAppleToken } from "@/lib/auth/apple-sign-in";

const MAX_BODY_LENGTH = 16 * 1024;

const FAILED = { error: "oauth-failed" };

// Both the app's Apple sheet and the web popup post their ID token here, so the sign-in
// cookie is set the same way the OAuth callback sets it.
export async function POST(request: Request) {
  // A cross-site form can't send JSON, and a cross-site fetch needs a CORS preflight we don't answer.
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json(FAILED, { status: 415 });
  }

  const text = await request.text();
  if (text.length > MAX_BODY_LENGTH) {
    return NextResponse.json(FAILED, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(FAILED, { status: 400 });
  }

  const input = readAppleSignInInput(body);
  if (!input) {
    return NextResponse.json(FAILED, { status: 400 });
  }

  const result = await signInWithAppleToken(input);
  if ("error" in result) {
    return NextResponse.json(result, { status: result.error === "suspended" ? 403 : 401 });
  }
  return NextResponse.json(result);
}
