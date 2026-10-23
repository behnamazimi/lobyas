"use client";

import { useMemo, useSyncExternalStore } from "react";
import { hasCapability, type Capability } from "@/lib/native/capabilities";
import { parseShell, type Shell } from "@/lib/native/shell";

const subscribe = () => () => {};
const readUserAgent = () => navigator.userAgent;
const serverUserAgent = () => "";

/** Whether the page runs inside the native app, and which one. The server render and
 *  hydration see "not native", then the browser value applies. */
export function useNative(): Shell {
  const userAgent = useSyncExternalStore(subscribe, readUserAgent, serverUserAgent);
  return useMemo(() => parseShell(userAgent), [userAgent]);
}

/** Whether the installed app can do this. False on the server and during hydration, and the real
 *  value applies in the same commit, so a feature doesn't pop in after the page. */
export function useHasCapability(capability: Capability): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasCapability(capability),
    () => false,
  );
}
