import { callNative, type NativeResult } from "./call";

export type Listener = { remove: () => Promise<void> };

/**
 * Registers a native listener and returns the function that removes it. A listener is added
 * asynchronously, so one removed before it exists is removed as soon as it does. Does nothing
 * where the app has no such event.
 */
export function subscribe(add: () => Promise<NativeResult<Listener>>): () => void {
  let cancelled = false;
  let listener: Listener | undefined;
  void add().then(async (result) => {
    if (result.status !== "ok") return;
    if (cancelled) await result.value.remove();
    else listener = result.value;
  });
  return () => {
    cancelled = true;
    void listener?.remove();
  };
}

/** Runs when the app comes back to the foreground. */
export function onAppResume(callback: () => void): () => void {
  return subscribe(() =>
    callNative(
      "app",
      () => import("@capacitor/app"),
      ({ App }) =>
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) callback();
        }),
    ),
  );
}
