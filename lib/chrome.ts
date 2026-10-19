/** /c is a shared collection link: members see it inside the app, visitors on the website. */
const APP_PREFIXES = ["/app", "/admin", "/c"] as const;

export type ShellLayout = "tabs" | "study" | "sub" | "site";

/** Logged-in app surfaces get the app shell. Everything else is the website. */
export function isStudyPath(pathname: string): boolean {
  return APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Which frame a route uses. Study routes drop the rail and the tab bar. */
export function shellLayout(pathname: string): ShellLayout {
  if (!isStudyPath(pathname)) return "site";
  if (isTabPath(pathname)) return "tabs";
  if (isStudyRoute(pathname)) return "study";
  return "sub";
}

function isTabPath(pathname: string): boolean {
  return (
    pathname === "/app" ||
    pathname === "/app/library" ||
    pathname.startsWith("/app/goals") ||
    pathname.startsWith("/app/me")
  );
}

function isStudyRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/app/read") ||
    pathname.startsWith("/app/review") ||
    pathname.startsWith("/app/quiz") ||
    pathname.startsWith("/app/triage")
  );
}

/** The tab a path highlights, or null when the path is not a destination. */
export function navKey(pathname: string): "home" | "library" | "goals" | "me" | null {
  if (pathname === "/app") return "home";
  if (pathname === "/app/library") return "library";
  if (pathname.startsWith("/app/goals")) return "goals";
  if (pathname.startsWith("/app/me")) return "me";
  return null;
}

/** Where a sub-page's back control goes when this visit has no earlier app page. */
export function subPageFallback(pathname: string): string {
  if (pathname.startsWith("/app/import/") || pathname === "/app/capture") return "/app/import";
  if (pathname.startsWith("/admin/")) return "/admin";
  if (pathname === "/admin") return "/app/me";
  if (pathname.startsWith("/c/")) return "/app";
  return "/app/me";
}
