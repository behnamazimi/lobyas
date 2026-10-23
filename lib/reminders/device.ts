import { hasCapability } from "@/lib/native/capabilities";
import {
  cancelNotifications,
  notificationPermission,
  pendingNotificationIds,
  scheduleNotifications,
} from "@/lib/native/notifications";
import { armedSignature, isArmed } from "./arming";
import { parseReminders, type Reminder } from "./reminders";
import { buildScheduledReminders, REMINDER_CHANNEL } from "./schedule";

const SIGNATURE_KEY = "lb_reminders_armed";

// Everything that changes what the device holds runs one at a time, in the order it was
// asked for, so an older sync can never land after a newer save.
let queue: Promise<unknown> = Promise.resolve();
function inOrder<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
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

/** True unless the device should have been armed and couldn't be. Where there is nothing to arm
 *  (a browser, an app without the plugin, no permission) that is fine. */
async function armNow(reminders: Reminder[]): Promise<boolean> {
  if ((await notificationPermission()) !== "granted") return true;

  const wanted = buildScheduledReminders(reminders);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const pending = await pendingNotificationIds();
  if (pending === null) return false;
  if (isArmed(wanted, pending, readSignature(), timeZone)) return true;

  if (!(await cancelNotifications(pending))) return false;
  if (wanted.length === 0) {
    writeSignature(null);
    return true;
  }
  if (!(await scheduleNotifications(wanted, REMINDER_CHANNEL))) return false;
  writeSignature(armedSignature(wanted, timeZone));
  return true;
}

async function clearNow() {
  const pending = await pendingNotificationIds();
  // Without the list nothing was cancelled, so the device still holds what was armed.
  if (pending === null) return;
  await cancelNotifications(pending);
  writeSignature(null);
}

/** Makes the OS schedule match the reminders. Never asks for permission. The armed signature is
 *  only a shortcut: if the OS lost a schedule (cleared by the system, restored backup) or the
 *  timezone changed, it rearms. */
export function applyReminders(reminders: Reminder[]): Promise<boolean> {
  return inOrder(() => armNow(reminders));
}

/** Removes every scheduled reminder from this device (sign-out, deletion). */
export function clearReminders(): Promise<void> {
  return inOrder(clearNow);
}

/** Reads the account's reminders and makes the device match them; signed out clears them. The
 *  read happens in line, so it can't be older than a save that was applied before it. */
export function syncRemindersFromServer(): Promise<void> {
  return inOrder(async () => {
    if (!hasCapability("notifications")) return;
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
