import { isNativeShell } from "@/lib/native/shell";
import { armedSignature, isArmed } from "./arming";
import { parseReminders, type Reminder } from "./reminders";
import { buildScheduledReminders, REMINDER_CHANNEL_ID } from "./schedule";

export type ReminderPermission = "granted" | "denied" | "prompt";

const SIGNATURE_KEY = "lb_reminders_armed";

type CapacitorGlobal = {
  isPluginAvailable?: (name: string) => boolean;
  getPlatform?: () => string;
};

// The shell injects Capacitor before the page runs, so the page needs no import to ask it.
function capacitor(): CapacitorGlobal | undefined {
  return (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** True in an app whose binary includes the notifications plugin; an older
 *  app, or a browser, is false. */
export function remindersSupported(): boolean {
  return isNativeShell() && capacitor()?.isPluginAvailable?.("LocalNotifications") === true;
}

// Awaiting the plugin itself would call its "then", which a plugin doesn't have, so the
// plugin is only ever taken out of the loaded module.
async function loadPlugin() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return { notifications: LocalNotifications };
}

// Everything that changes what the device holds runs one at a time, in the order it was
// asked for, so an older sync can never land after a newer save.
let queue: Promise<unknown> = Promise.resolve();
function inOrder<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
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

async function armNow(reminders: Reminder[]): Promise<void> {
  if (!remindersSupported()) return;
  const { notifications } = await loadPlugin();
  if ((await getReminderPermission()) !== "granted") return;

  const wanted = buildScheduledReminders(reminders);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { notifications: pending } = await notifications.getPending();
  if (
    isArmed(
      wanted,
      pending.map((n) => n.id),
      readSignature(),
      timeZone,
    )
  ) {
    return;
  }

  if (pending.length > 0) await notifications.cancel({ notifications: pending });
  if (wanted.length === 0) {
    writeSignature(null);
    return;
  }
  if (capacitor()?.getPlatform?.() === "android") {
    await notifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: "Reminders",
      description: "Your study reminders",
      importance: 3,
    });
  }
  await notifications.schedule({ notifications: wanted });
  writeSignature(armedSignature(wanted, timeZone));
}

async function clearNow(): Promise<void> {
  if (!remindersSupported()) return;
  const { notifications } = await loadPlugin();
  const { notifications: pending } = await notifications.getPending();
  if (pending.length > 0) await notifications.cancel({ notifications: pending });
  writeSignature(null);
}

/** Makes the OS schedule match the reminders. Never asks for permission. The
 *  armed signature is only a shortcut: if the OS lost a schedule (cleared by the
 *  system, restored backup) or the timezone changed, it rearms. */
export function applyReminders(reminders: Reminder[]): Promise<void> {
  return inOrder(() => armNow(reminders));
}

/** Removes every scheduled reminder from this device (sign-out, deletion). */
export function clearReminders(): Promise<void> {
  return inOrder(clearNow);
}

/** Reads the account's reminders and makes the device match them; signed out
 *  clears them. The read happens in line, so it can't be older than a save
 *  that was applied before it. */
export function syncRemindersFromServer(): Promise<void> {
  return inOrder(async () => {
    try {
      // The proxy sends a signed-out request to login instead of answering 401.
      const response = await fetch("/api/reminders", { cache: "no-store", redirect: "manual" });
      if (response.status === 401 || response.type === "opaqueredirect") return await clearNow();
      if (!response.ok) return;
      const body: { reminders?: unknown } = await response.json();
      await armNow(parseReminders(body.reminders));
    } catch {
      // Offline: the schedule already on the device keeps working.
    }
  });
}

type Listener = { remove: () => Promise<void> };

function subscribe(add: () => Promise<Listener>): () => void {
  let cancelled = false;
  let listener: Listener | undefined;
  void add()
    .then(async (added) => {
      if (cancelled) await added.remove();
      else listener = added;
    })
    .catch(() => {});
  return () => {
    cancelled = true;
    void listener?.remove();
  };
}

/** Runs when the app comes back to the foreground. */
export function onAppResume(callback: () => void): () => void {
  return subscribe(async () => {
    const { App } = await import("@capacitor/app");
    return App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) callback();
    });
  });
}

/** Runs when a reminder is tapped, with the path it points at. */
export function onReminderTapped(callback: (path: unknown) => void): () => void {
  return subscribe(async () => {
    const { notifications } = await loadPlugin();
    return notifications.addListener("localNotificationActionPerformed", ({ notification }) =>
      callback(notification.extra?.path),
    );
  });
}

export async function openNotificationSettings(): Promise<void> {
  const { AndroidSettings, IOSSettings, NativeSettings } =
    await import("capacitor-native-settings");
  await NativeSettings.open({
    optionAndroid: AndroidSettings.AppNotification,
    optionIOS: IOSSettings.AppNotification,
  });
}
