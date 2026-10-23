import { callNative } from "./call";
import { onAppResume } from "./events";

/** The phone's 12 or 24-hour clock setting. Only the app can read it: the page's own locale
 *  follows the language, not the toggle in the phone's settings. Reported by the app's own
 *  plugin, so an app built without it falls back to the language's default. */
type LobyasNative = { getClock(): Promise<{ is24Hour: boolean }> };

let plugin: { LobyasNative: LobyasNative } | undefined;

async function loadPlugin() {
  const { registerPlugin } = await import("@capacitor/core");
  // Registering twice warns, and the plugin object must not be awaited, so keep one in a wrapper.
  plugin ??= { LobyasNative: registerPlugin<LobyasNative>("LobyasNative") };
  return plugin;
}

/** The language's default, for a browser or an app without the plugin. */
export function languageUses24HourClock(): boolean {
  const cycle = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle;
  return cycle === "h23" || cycle === "h24";
}

let known: boolean | undefined;
const listeners = new Set<() => void>();
let stopResume: (() => void) | undefined;

async function refresh() {
  const result = await callNative("clock", loadPlugin, ({ LobyasNative }) =>
    LobyasNative.getClock(),
  );
  if (result.status !== "ok" || result.value.is24Hour === known) return;
  known = result.value.is24Hour;
  listeners.forEach((listener) => listener());
}

/** What the phone's clock uses right now, or the language's default until the app answers. */
export function clockUses24Hours(): boolean {
  return known ?? languageUses24HourClock();
}

/** Calls back when the answer changes. The app is asked on subscribing and every time it comes
 *  back to the foreground, since the setting can change while the app is in the background. */
export function subscribeToClock(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) stopResume = onAppResume(() => void refresh());
  void refresh();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopResume?.();
      stopResume = undefined;
    }
  };
}

/** For tests: forgets what the app said. */
export function resetClock() {
  known = undefined;
  plugin = undefined;
}
