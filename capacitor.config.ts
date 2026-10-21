import type { CapacitorConfig } from "@capacitor/cli";
import { AUTHENTICATED_HOME_PATH } from "./lib/auth/safe-next-path";

const PRODUCTION_URL = "https://lobyas.com";

// Releases pass the tag's version in CAP_APP_VERSION. A local build reports a version no
// update prompt ever asks to replace.
const appVersion = process.env.CAP_APP_VERSION || "999.0.0";

// Preview builds point at a Vercel preview with CAP_SERVER_URL.
const serverUrl = process.env.CAP_SERVER_URL || PRODUCTION_URL;
const isProduction = new URL(serverUrl).hostname === new URL(PRODUCTION_URL).hostname;

// Opening the study area directly saves the redirect from "/" on every launch;
// the proxy still sends signed-out members on to login.
const launchUrl = process.env.CAP_SERVER_URL
  ? serverUrl
  : `${PRODUCTION_URL}${AUTHENTICATED_HOME_PATH}`;

const config: CapacitorConfig = {
  appId: "com.lobyas.app",
  appName: "Lobyas",
  webDir: "native/www",
  backgroundColor: "#fdfcf9",
  server: {
    url: launchUrl,
    allowNavigation: ["lobyas.com", "*.lobyas.com", new URL(serverUrl).hostname],
    errorPath: "offline.html",
  },
  ios: {
    appendUserAgent: `LobyasApp/ios/${appVersion}`,
    // Lets the service worker run in WKWebView. Info.plist lists the allowed
    // domain, so it can't apply to a preview host.
    limitsNavigationsToAppBoundDomains: isProduction,
  },
  android: {
    appendUserAgent: `LobyasApp/android/${appVersion}`,
  },
  plugins: {
    // The page hides the splash once it has painted (NativeSplash); the duration is the
    // fallback for a slow or failed load.
    // Only the Apple sheet is used; Google sign-in runs in the system browser, so the
    // Facebook and Google SDKs stay out of the app.
    SocialLogin: { providers: { apple: true, google: false, facebook: false, twitter: false } },
    SplashScreen: { launchAutoHide: true, launchShowDuration: 4000, backgroundColor: "#fdfcf9" },
  },
};

export default config;
