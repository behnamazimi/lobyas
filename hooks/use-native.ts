"use client";

import { useMemo, useSyncExternalStore } from "react";
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
