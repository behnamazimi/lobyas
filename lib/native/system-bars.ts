import { callNative } from "./call";

/** Sets the status bar icons to match the page's theme, which can differ from the phone's.
 *  The style names describe the bar's background: Light means dark icons. */
export function setSystemBarsDark(dark: boolean) {
  void callNative(
    "systemBars",
    () => import("@capacitor/core"),
    ({ SystemBars, SystemBarsStyle }) =>
      SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light }),
  );
}
