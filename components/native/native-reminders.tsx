"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { applyReminders, clearReminders, remindersSupported } from "@/lib/reminders/native";
import { parseReminders } from "@/lib/reminders/reminders";

async function syncReminders() {
  try {
    // The proxy sends a signed-out request to login instead of answering 401.
    const response = await fetch("/api/reminders", { cache: "no-store", redirect: "manual" });
    if (response.status === 401 || response.type === "opaqueredirect") {
      return await clearReminders();
    }
    if (!response.ok) return;
    const body: { reminders?: unknown } = await response.json();
    await applyReminders(parseReminders(body.reminders));
  } catch {
    // Offline: the schedule already on the device keeps working.
  }
}

/** In the native app, keeps the device's scheduled reminders in step with the
 *  account, and opens the app when one is tapped. */
export function NativeReminders() {
  useMountEffect(() => {
    if (!remindersSupported()) return;

    let cancelled = false;
    const removers: Array<() => Promise<void>> = [];

    void (async () => {
      const [{ App }, { LocalNotifications }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/local-notifications"),
      ]);
      const handles = await Promise.all([
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) void syncReminders();
        }),
        LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
          const path: unknown = notification.extra?.path;
          window.location.assign(safeNextPath(typeof path === "string" ? path : null));
        }),
      ]);
      if (cancelled) {
        await Promise.all(handles.map((handle) => handle.remove()));
        return;
      }
      removers.push(...handles.map((handle) => handle.remove));
      void syncReminders();
    })();

    return () => {
      cancelled = true;
      for (const remove of removers) void remove();
    };
  });

  return null;
}
