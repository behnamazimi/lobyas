export const THEME_COOKIE_NAME = "theme";
export const LIGHT_THEME = "emerald";
export const DARK_THEME = "dim";
/** Page canvas. The manifest and the default browser chrome use the light one. */
export const LIGHT_PAGE_COLOR = "#f7f4ee";
const DARK_PAGE_COLOR = "#1c1916";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function pageColor(theme: typeof LIGHT_THEME | typeof DARK_THEME): string {
  return theme === DARK_THEME ? DARK_PAGE_COLOR : LIGHT_PAGE_COLOR;
}

/** Puts the chosen theme on the page and remembers it. Light and dim only. */
export function applyTheme(theme: typeof LIGHT_THEME | typeof DARK_THEME): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", pageColor(theme));
}

/** Runs in the page before it paints, for pages cached without a cookie: the
 *  server renders the light theme and this puts the visitor's choice back. */
export const THEME_RESTORE_SCRIPT = `try{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE_NAME}=(${LIGHT_THEME}|${DARK_THEME})(?:;|$)/);if(m){document.documentElement.setAttribute("data-theme",m[1]);if(m[1]==="${DARK_THEME}"){var t=document.querySelector('meta[name="theme-color"]');if(t)t.setAttribute("content","${DARK_PAGE_COLOR}")}}}catch(e){}`;
