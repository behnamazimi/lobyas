import { isNativeShell } from "./shell";

/** What the web code can ask of the app, and the Capacitor plugin each one needs. A feature is
 *  only there when the installed app was built with its plugin: an older app has none of the
 *  ones added since. */
type Entry = { plugin: string; platform?: "ios" | "android" };

const CAPABILITIES = {
  app: { plugin: "App" },
  appSettings: { plugin: "NativeSettings" },
  appleSignIn: { plugin: "SocialLogin", platform: "ios" },
  browser: { plugin: "Browser" },
  haptics: { plugin: "Haptics" },
  notifications: { plugin: "LocalNotifications" },
  splash: { plugin: "SplashScreen" },
  systemBars: { plugin: "SystemBars" },
} satisfies Record<string, Entry>;

export type Capability = keyof typeof CAPABILITIES;

type CapacitorGlobal = {
  isPluginAvailable?: (name: string) => boolean;
  getPlatform?: () => string;
};

// The app injects Capacitor before the page runs, so the page asks it instead of importing it.
function capacitor(): CapacitorGlobal | undefined {
  return (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor;
}

export function hasCapability(capability: Capability): boolean {
  const { plugin, platform }: Entry = CAPABILITIES[capability];
  if (!isNativeShell() || capacitor()?.isPluginAvailable?.(plugin) !== true) return false;
  return platform === undefined || platform === nativePlatform();
}

/** The platform Capacitor reports; unlike the user agent it is known for every app version. */
export function nativePlatform(): "ios" | "android" | "web" {
  const platform = capacitor()?.getPlatform?.();
  return platform === "ios" || platform === "android" ? platform : "web";
}
