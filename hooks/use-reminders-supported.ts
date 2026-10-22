"use client";

import { useSyncExternalStore } from "react";
import { remindersSupported } from "@/lib/reminders/native";

const subscribe = () => () => {};
const server = () => false;

/** Whether this app can schedule reminders. Hydration sees false, and the real
 *  value applies in the same commit, so the card doesn't pop in after the page. */
export function useRemindersSupported(): boolean {
  return useSyncExternalStore(subscribe, remindersSupported, server);
}
