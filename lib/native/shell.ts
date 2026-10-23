import { SHELL_ATTRIBUTE, SHELL_NAME, type ShellOs } from "./contract";

export type Shell =
  | { native: false }
  | { native: true; os: ShellOs | null; version: string | null };

/**
 * The native shell adds `LobyasApp/<os>/<version>` to the WebView's user agent
 * (`appendUserAgent` in capacitor.config.ts). An installed app older than that
 * change sends `LobyasApp/<os>` or plain `LobyasApp`, so the os or the version
 * can be unknown.
 */
const SHELL_USER_AGENT = new RegExp(
  `${SHELL_NAME}(?:\\/(ios|android)(?:\\/(\\d+\\.\\d+\\.\\d+))?)?`,
);

const NOT_NATIVE: Shell = { native: false };

export function parseShell(userAgent: string): Shell {
  const match = SHELL_USER_AGENT.exec(userAgent);
  if (!match) return NOT_NATIVE;
  return {
    native: true,
    os: (match[1] as ShellOs | undefined) ?? null,
    version: match[2] ?? null,
  };
}

/** Cached pages can't read the user agent on the server, so it is copied to
 *  <html> before paint, for CSS (`native-app:`, `ios-app:`, `android-app:`). */
export const SHELL_RESTORE_SCRIPT = `try{var m=/${SHELL_USER_AGENT.source}/.exec(navigator.userAgent);if(m)document.documentElement.setAttribute("${SHELL_ATTRIBUTE}",m[1]||"app")}catch(e){}`;

export function isNativeShell(): boolean {
  return typeof navigator !== "undefined" && parseShell(navigator.userAgent).native;
}
