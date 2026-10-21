import type { UpdatePolicy } from "./version";

/**
 * Raise a version only after a store build that carries it has been released. Installed
 * apps older than `recommended` see a dismissible banner; older than `required` are
 * blocked until they update. Apps from before the user agent carried a version count as 0.0.0.
 */
export const UPDATE_POLICY: UpdatePolicy = {
  recommended: "0.0.0",
  required: "0.0.0",
};

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.lobyas.app";

// Set to `https://apps.apple.com/app/id<App Store ID>` once the listing exists.
const APP_STORE_URL: string | null = null;

export function storeUrl(os: "ios" | "android" | null, userAgent: string): string | null {
  const resolved = os ?? (/android/i.test(userAgent) ? "android" : "ios");
  return resolved === "android" ? PLAY_STORE_URL : APP_STORE_URL;
}
