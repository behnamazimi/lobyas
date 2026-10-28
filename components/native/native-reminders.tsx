"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import { isSignedIn, onAuthChange } from "@/lib/auth/auth-state";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { hasCapability } from "@/lib/native/capabilities";
import { onAppResume } from "@/lib/native/events";
import { onNotificationTapped } from "@/lib/native/notifications";
import { syncRemindersFromServer } from "@/lib/reminders/device";

/** In the native app, keeps the device's scheduled reminders in step with the
 *  account, and opens the app when one is tapped. */
export function NativeReminders() {
  useMountEffect(() => {
    if (!hasCapability("notifications")) return;

    const stops = [
      onAppResume(() => void syncRemindersFromServer()),
      onNotificationTapped((path) => {
        window.location.assign(safeNextPath(typeof path === "string" ? path : null));
      }),
      // Signing in doesn't reload the layout. Signing out clears reminders itself, and a
      // sync during it could still see the session.
      onAuthChange(() => {
        if (isSignedIn()) void syncRemindersFromServer();
      }),
    ];
    void syncRemindersFromServer();

    return () => {
      for (const stop of stops) stop();
    };
  });

  return null;
}
