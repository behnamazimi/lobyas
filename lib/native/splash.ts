const DONE_KEY = "lobyas-splash-done";
const RETRIED_KEY = "lobyas-splash-retried";

/** The page's own splash frame stays up for at least this long, so a blink is seen. */
export const SPLASH_MIN_MS = 700;
export const SPLASH_FADE_MS = 300;

/**
 * Runs in the page before it paints, after the shell script: in the app, a new web view
 * (a cold start) has no `DONE_KEY` yet, so the page draws its splash frame until it is ready.
 * Later loads in the same web view, and the plain web, skip it.
 */
export const SPLASH_RESTORE_SCRIPT = `try{if(document.documentElement.hasAttribute("data-shell")&&!sessionStorage.getItem("${DONE_KEY}"))document.documentElement.setAttribute("data-splash","")}catch(e){}`;

// Storage can throw (blocked, full). A splash must never get stuck because of it.
export function markSplashDone(storage: Storage) {
  try {
    storage.setItem(DONE_KEY, "1");
    storage.removeItem(RETRIED_KEY);
  } catch {}
}

export function hasRetriedSplashLoad(storage: Storage) {
  try {
    return storage.getItem(RETRIED_KEY) !== null;
  } catch {
    return true;
  }
}

export function markSplashRetried(storage: Storage) {
  try {
    storage.setItem(RETRIED_KEY, "1");
  } catch {}
}

/**
 * Whether the page the web view loaded is worth showing. A web view that doesn't report the
 * status counts as fine. A server error gets one reload behind the splash, then is shown as it
 * is so the member sees the error page rather than a stuck splash. A 4xx is a real answer.
 */
export function nextSplashStep({
  status,
  retried,
}: {
  status: number | undefined;
  retried: boolean;
}): "ready" | "retry" {
  return status && status >= 500 && !retried ? "retry" : "ready";
}
