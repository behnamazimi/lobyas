/**
 * The names the web code and the native apps agree on. Files that can't import this
 * (Info.plist, AndroidManifest.xml, globals.css) are listed in docs/native-bridge.md, so
 * change them together. It imports nothing, because capacitor.config.ts reads it too.
 */
export const APP_ID = "com.lobyas.app";

export type ShellOs = "ios" | "android";

/** Added to the WebView's user agent as `LobyasApp/<os>/<version>`. */
export const SHELL_NAME = "LobyasApp";

export function shellUserAgent(os: ShellOs, version: string): string {
  return `${SHELL_NAME}/${os}/${version}`;
}

/** Copied from the user agent onto <html> before paint, for the CSS variants. */
export const SHELL_ATTRIBUTE = "data-shell";

/** Sent by the app's WebView on calls only it should make; a cross-site form can't set a custom header.
 *  The user agent is a hint for the UI and is never proof of the app. */
export const NATIVE_REQUEST_HEADER = "x-lobyas-native";

/** Where Supabase sends the system browser once Google sign-in is done; the app opens from it. */
export const NATIVE_AUTH_REDIRECT = `${APP_ID}://auth/callback`;
