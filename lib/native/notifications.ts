import { nativePlatform } from "./capabilities";
import { callNative } from "./call";
import { subscribe } from "./events";

export type NotificationPermission = "granted" | "denied" | "prompt";

export type NotificationChannel = { id: string; name: string; description: string };

/** A notification the OS repeats on its own, every week at the same local time. */
export type LocalNotificationRequest = {
  id: number;
  title: string;
  body: string;
  channelId: string;
  extra: { path: string };
  // An exact alarm sends Android 12+ to a settings screen first.
  isExactNotification: false;
  schedule: {
    on: { weekday: number; hour: number; minute: number };
    repeats: true;
    allowWhileIdle: true;
  };
};

const loadPlugin = () => import("@capacitor/local-notifications");

function toPermission(display: string): NotificationPermission {
  return display === "granted" ? "granted" : display === "denied" ? "denied" : "prompt";
}

/** "unavailable" in a browser, or an app built without the plugin. */
export async function notificationPermission(): Promise<NotificationPermission | "unavailable"> {
  const result = await callNative("notifications", loadPlugin, ({ LocalNotifications }) =>
    LocalNotifications.checkPermissions(),
  );
  return result.status === "ok" ? toPermission(result.value.display) : "unavailable";
}

/** Shows the system prompt when the person hasn't answered yet. */
export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unavailable"
> {
  const result = await callNative("notifications", loadPlugin, ({ LocalNotifications }) =>
    LocalNotifications.requestPermissions(),
  );
  if (result.status !== "ok") return "unavailable";
  return result.value.display === "granted" ? "granted" : "denied";
}

/** The ids the OS holds, or null when they can't be read. */
export async function pendingNotificationIds(): Promise<number[] | null> {
  const result = await callNative("notifications", loadPlugin, ({ LocalNotifications }) =>
    LocalNotifications.getPending(),
  );
  return result.status === "ok" ? result.value.notifications.map((n) => n.id) : null;
}

export async function cancelNotifications(ids: number[]): Promise<boolean> {
  if (ids.length === 0) return true;
  const result = await callNative("notifications", loadPlugin, ({ LocalNotifications }) =>
    LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) }),
  );
  return result.status === "ok";
}

export async function scheduleNotifications(
  notifications: LocalNotificationRequest[],
  channel: NotificationChannel,
): Promise<boolean> {
  const result = await callNative("notifications", loadPlugin, async ({ LocalNotifications }) => {
    // Android groups notifications by channel; iOS has none.
    if (nativePlatform() === "android") {
      await LocalNotifications.createChannel({ ...channel, importance: 3 });
    }
    await LocalNotifications.schedule({ notifications });
  });
  return result.status === "ok";
}

/** Runs with the `path` a tapped notification carries, which the caller must not trust. */
export function onNotificationTapped(callback: (path: unknown) => void): () => void {
  return subscribe(() =>
    callNative("notifications", loadPlugin, ({ LocalNotifications }) =>
      LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) =>
        callback(notification.extra?.path),
      ),
    ),
  );
}
