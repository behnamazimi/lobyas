export const THEME_COOKIE_NAME = "theme";
export const LIGHT_THEME = "emerald";
export const DARK_THEME = "dim";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Puts the chosen theme on the page and remembers it. Light and dim only. */
export function applyTheme(theme: typeof LIGHT_THEME | typeof DARK_THEME): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Runs in the page before it paints, for pages cached without a cookie: the
 *  server renders the light theme and this puts the visitor's choice back. */
export const THEME_RESTORE_SCRIPT = `try{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE_NAME}=(${LIGHT_THEME}|${DARK_THEME})(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}`;
