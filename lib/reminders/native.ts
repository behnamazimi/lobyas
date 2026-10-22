import { Capacitor } from "@capacitor/core";
import { isNativeShell } from "@/lib/native/shell";
import type { Reminder } from "./reminders";
import { buildScheduledReminders, REMINDER_CHANNEL_ID } from "./schedule";

export type ReminderPermission = "granted" | "denied" | "prompt";

const SIGNATURE_KEY = "lb_reminders_armed";

/** True in an app whose binary includes the notifications plugin; an older
 *  app, or a browser, is false. */
export function remindersSupported(): boolean {
  return isNativeShell() && Capacitor.isPluginAvailable("LocalNotifications");
}

// Awaiting the plugin itself would call its "then", which a plugin doesn't have, so the
// plugin is only ever taken out of the loaded module.
async function loadPlugin() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return { notifications: LocalNotifications };
}

export async function getReminderPermission(): Promise<ReminderPermission> {
  if (!remindersSupported()) return "denied";
  const { notifications } = await loadPlugin();
  const { display } = await notifications.checkPermissions();
  return display === "granted" ? "granted" : display === "denied" ? "denied" : "prompt";
}

export async function requestReminderPermission(): Promise<ReminderPermission> {
  if (!remindersSupported()) return "denied";
  const { notifications } = await loadPlugin();
  const { display } = await notifications.requestPermissions();
  return display === "granted" ? "granted" : "denied";
}

function readSignature(): string | null {
  try {
    return localStorage.getItem(SIGNATURE_KEY);
  } catch {
    return null;
  }
}

function writeSignature(signature: string | null) {
  try {
    if (signature === null) localStorage.removeItem(SIGNATURE_KEY);
    else localStorage.setItem(SIGNATURE_KEY, signature);
  } catch {
    // Without it the next check just rearms everything.
  }
}

/** Makes the OS schedule match the reminders. Never asks for permission. The
 *  armed signature is only a shortcut: if the OS lost any schedule (cleared by
 *  the system, restored backup), the pending ids differ and it rearms. */
export async function applyReminders(reminders: Reminder[]): Promise<void> {
  if (!remindersSupported()) return;
  const { notifications } = await loadPlugin();
  if ((await getReminderPermission()) !== "granted") return;

  const wanted = buildScheduledReminders(reminders);
  const signature = JSON.stringify(wanted.map((n) => [n.id, n.schedule.on, n.title, n.body]));
  const { notifications: pending } = await notifications.getPending();
  const pendingIds = pending.map((n) => n.id).sort((a, b) => a - b);
  const wantedIds = wanted.map((n) => n.id).sort((a, b) => a - b);
  const inSync =
    readSignature() === signature &&
    pendingIds.length === wantedIds.length &&
    pendingIds.every((id, i) => id === wantedIds[i]);
  if (inSync) return;

  if (pending.length > 0) await notifications.cancel({ notifications: pending });
  if (wanted.length === 0) {
    writeSignature(null);
    return;
  }
  if (Capacitor.getPlatform() === "android") {
    await notifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: "Reminders",
      description: "Your study reminders",
      importance: 3,
    });
  }
  await notifications.schedule({ notifications: wanted });
  writeSignature(signature);
}

/** Removes every scheduled reminder from this device (sign-out, deletion). */
export async function clearReminders(): Promise<void> {
  if (!remindersSupported()) return;
  const { notifications } = await loadPlugin();
  const { notifications: pending } = await notifications.getPending();
  if (pending.length > 0) await notifications.cancel({ notifications: pending });
  writeSignature(null);
}

export async function openNotificationSettings(): Promise<void> {
  const { AndroidSettings, IOSSettings, NativeSettings } =
    await import("capacitor-native-settings");
  await NativeSettings.open({
    optionAndroid: AndroidSettings.AppNotification,
    optionIOS: IOSSettings.AppNotification,
  });
}
