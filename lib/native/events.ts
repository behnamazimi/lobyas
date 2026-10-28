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
  // A listener that can't be removed has nothing left to do, so a failure here is dropped.
  const remove = (target: Listener) => target.remove().catch(() => {});
  void add().then((result) => {
    if (result.status !== "ok") return;
    if (cancelled) return remove(result.value);
    listener = result.value;
  });
  return () => {
    cancelled = true;
    if (listener) void remove(listener);
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

/** Runs with the link that opened the app, such as the sign-in callback from the system browser. */
export function onAppUrlOpen(callback: (url: string) => void): () => void {
  return subscribe(() =>
    callNative(
      "app",
      () => import("@capacitor/app"),
      ({ App }) => App.addListener("appUrlOpen", ({ url }) => callback(url)),
    ),
  );
}
