import { APP_ID } from "./contract";
import { callNative } from "./call";

export type AppleSignInResult =
  | { status: "signed-in"; idToken: string }
  | { status: "cancelled" }
  | { status: "failed" };

/** Shows the system Apple sheet. `hashedNonce` is the SHA-256 of the nonce, which Apple signs
 *  into the token. */
export async function signInWithAppleNative(hashedNonce: string): Promise<AppleSignInResult> {
  const result = await callNative(
    "appleSignIn",
    () => import("@capgo/capacitor-social-login"),
    async ({ SocialLogin }) => {
      await SocialLogin.initialize({ apple: { clientId: APP_ID } });
      const { result } = await SocialLogin.login({
        provider: "apple",
        options: { scopes: ["email", "name"], nonce: hashedNonce },
      });
      return result.idToken;
    },
  );
  if (result.status === "ok") {
    return result.value ? { status: "signed-in", idToken: result.value } : { status: "failed" };
  }
  const cancelled =
    result.status === "failed" &&
    (result.error as { code?: string } | null)?.code === "USER_CANCELLED";
  return cancelled ? { status: "cancelled" } : { status: "failed" };
}
