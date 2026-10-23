import { isNativeShell } from "./shell";

/** What the web code can ask of the app, and the Capacitor plugin each one needs. A feature is
 *  only there when the installed app was built with its plugin: an older app has none of the
 *  ones added since. */
const PLUGINS = {
  haptics: "Haptics",
} as const;

export type Capability = keyof typeof PLUGINS;

type CapacitorGlobal = { isPluginAvailable?: (name: string) => boolean };

// The app injects Capacitor before the page runs, so the page asks it instead of importing it.
function capacitor(): CapacitorGlobal | undefined {
  return (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor;
}

export function hasCapability(capability: Capability): boolean {
  return isNativeShell() && capacitor()?.isPluginAvailable?.(PLUGINS[capability]) === true;
}
