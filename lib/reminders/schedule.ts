import { MAX_REMINDERS, type Reminder } from "./reminders";

export const REMINDER_CHANNEL_ID = "reminders";
const REMINDER_TAP_PATH = "/app";

/** One line per lobya, handed out by weekday so the days still rotate. */
const NOTES = [
  { title: "Lobyaq", body: "Your terms are ready whenever you are." },
  { title: "Lobyar", body: "Take a moment for the terms you’re learning." },
  { title: "Lobyare", body: "You’ve been doing well. Keep it going." },
];

export type ScheduledReminder = {
  id: number;
  title: string;
  body: string;
  channelId: string;
  extra: { path: string };
  isExactNotification: false;
  schedule: {
    on: { weekday: number; hour: number; minute: number };
    repeats: true;
    allowWhileIdle: true;
  };
};

/** One repeating OS schedule per enabled reminder and weekday. The id is the
 *  reminder's position and the weekday, so the same list always gives the
 *  same ids and a changed list can be compared against what the OS holds. */
export function buildScheduledReminders(reminders: Reminder[]): ScheduledReminder[] {
  return reminders.slice(0, MAX_REMINDERS).flatMap((reminder, slot) => {
    if (!reminder.enabled) return [];
    const [hour, minute] = reminder.time.split(":").map(Number);
    return reminder.days.map((day) => ({
      id: (slot + 1) * 10 + day,
      ...NOTES[(day - 1) % NOTES.length],
      channelId: REMINDER_CHANNEL_ID,
      extra: { path: REMINDER_TAP_PATH },
      // An exact alarm makes Android 12+ send people to a settings screen first.
      isExactNotification: false as const,
      // The plugin counts weekdays from Sunday = 1.
      schedule: {
        on: { weekday: (day % 7) + 1, hour, minute },
        repeats: true as const,
        allowWhileIdle: true as const,
      },
    }));
  });
}
