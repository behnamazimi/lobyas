import { callNative } from "./call";

/** Hides the app's native launch screen, once the page has its own splash frame up. */
export function hideNativeSplash() {
  void callNative(
    "splash",
    () => import("@capacitor/splash-screen"),
    ({ SplashScreen }) => SplashScreen.hide({ fadeOutDuration: 0 }),
  );
}
