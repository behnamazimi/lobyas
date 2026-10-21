const APPLE_JS_URL =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

/** Apple Services ID for the web popup; without it (previews, local dev) the web button is hidden. */
export const APPLE_SERVICES_ID = process.env.NEXT_PUBLIC_APPLE_SERVICES_ID ?? "";

export class AppleSignInCancelled extends Error {}

type AppleCredential = { idToken: string; nonce: string };

type AppleId = {
  auth: {
    init(config: {
      clientId: string;
      scope: string;
      redirectURI: string;
      usePopup: boolean;
      nonce: string;
    }): void;
    signIn(): Promise<{ authorization: { id_token: string } }>;
  };
};

declare global {
  interface Window {
    AppleID?: AppleId;
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Apple signs the SHA-256 of the nonce into the token; Supabase wants the raw value. */
async function createNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return { raw, hashed: toHex(new Uint8Array(digest)) };
}

export async function isNativeAppleAvailable(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.getPlatform() === "ios" && Capacitor.isPluginAvailable("SocialLogin");
  } catch {
    return false;
  }
}

async function nativeCredential(): Promise<AppleCredential> {
  const nonce = await createNonce();
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  await SocialLogin.initialize({ apple: { clientId: "com.lobyas.app" } });
  try {
    const { result } = await SocialLogin.login({
      provider: "apple",
      options: { scopes: ["email", "name"], nonce: nonce.hashed },
    });
    if (!result.idToken) throw new Error("Apple returned no ID token.");
    return { idToken: result.idToken, nonce: nonce.raw };
  } catch (error) {
    if ((error as { code?: string }).code === "USER_CANCELLED") throw new AppleSignInCancelled();
    throw error;
  }
}

let appleScript: Promise<void> | null = null;

function loadAppleScript(): Promise<void> {
  appleScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = APPLE_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      appleScript = null;
      reject(new Error("Couldn't load Sign in with Apple."));
    };
    document.head.append(script);
  });
  return appleScript;
}

async function webCredential(): Promise<AppleCredential> {
  const nonce = await createNonce();
  await loadAppleScript();
  const appleId = window.AppleID;
  if (!appleId) throw new Error("Sign in with Apple is not available.");

  appleId.auth.init({
    clientId: APPLE_SERVICES_ID,
    scope: "name email",
    redirectURI: window.location.origin,
    usePopup: true,
    nonce: nonce.hashed,
  });
  try {
    const { authorization } = await appleId.auth.signIn();
    return { idToken: authorization.id_token, nonce: nonce.raw };
  } catch (error) {
    const code = (error as { error?: string }).error;
    if (code === "popup_closed_by_user" || code === "user_cancelled_authorize") {
      throw new AppleSignInCancelled();
    }
    throw error;
  }
}

export function requestAppleCredential(native: boolean): Promise<AppleCredential> {
  return native ? nativeCredential() : webCredential();
}

type SignInResponse = { redirectTo?: string; error?: string };

/** Sends the credential to the server, which signs in and says where to go next. */
export async function exchangeAppleCredential(
  credential: AppleCredential,
  destination: { next: string; ref?: string },
): Promise<SignInResponse> {
  const response = await fetch("/auth/apple", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...credential, ...destination }),
  });
  return (await response.json().catch(() => ({ error: "oauth-failed" }))) as SignInResponse;
}
