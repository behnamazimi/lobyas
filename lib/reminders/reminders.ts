export const MAX_REMINDERS = 3;

/** 1 = Monday … 7 = Sunday. */
export const WEEKDAYS = [
  { day: 1, short: "Mon", letter: "M" },
  { day: 2, short: "Tue", letter: "T" },
  { day: 3, short: "Wed", letter: "W" },
  { day: 4, short: "Thu", letter: "T" },
  { day: 5, short: "Fri", letter: "F" },
  { day: 6, short: "Sat", letter: "S" },
  { day: 7, short: "Sun", letter: "S" },
] as const;

export const EVERY_DAY = [1, 2, 3, 4, 5, 6, 7];
export const WEEKDAYS_ONLY = [1, 2, 3, 4, 5];
export const WEEKENDS_ONLY = [6, 7];

export type Reminder = {
  id: string;
  /** "HH:MM", 24-hour, the device's local time. */
  time: string;
  days: number[];
  enabled: boolean;
};

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseReminder(value: unknown): Reminder | null {
  if (typeof value !== "object" || value === null) return null;
  const { id, time, days, enabled } = value as Record<string, unknown>;
  if (typeof id !== "string" || id.length === 0 || id.length > 36) return null;
  if (typeof time !== "string" || !TIME.test(time)) return null;
  if (typeof enabled !== "boolean" || !Array.isArray(days)) return null;
  const valid = days.filter((d): d is number => Number.isInteger(d) && d >= 1 && d <= 7);
  const unique = [...new Set(valid)].sort((a, b) => a - b);
  if (unique.length === 0 || unique.length !== days.length) return null;
  return { id, time, days: unique, enabled };
}

/** Reads the stored column, dropping anything malformed. */
export function parseReminders(value: unknown): Reminder[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const reminders: Reminder[] = [];
  for (const item of value) {
    const reminder = parseReminder(item);
    if (!reminder || seen.has(reminder.id)) continue;
    seen.add(reminder.id);
    reminders.push(reminder);
    if (reminders.length === MAX_REMINDERS) break;
  }
  return reminders;
}

/** Checks a list from the browser; null if any reminder is wrong. */
export function validateReminders(value: unknown): Reminder[] | null {
  if (!Array.isArray(value) || value.length > MAX_REMINDERS) return null;
  const parsed = parseReminders(value);
  return parsed.length === value.length ? parsed : null;
}

export function formatReminderTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function formatReminderDays(days: number[]): string {
  if (days.length === 7) return "Every day";
  if (days.length === 5 && WEEKDAYS_ONLY.every((d) => days.includes(d))) return "Mon–Fri";
  return WEEKDAYS.filter(({ day }) => days.includes(day))
    .map(({ short }) => short)
    .join(", ");
}

/** "Today at 7:00 PM", "Tomorrow at 7:00 PM" or "Wed at 7:00 PM": when the
 *  reminder next goes off, counting from `now` in the device's local time. */
export function formatNextReminder(time: string, days: number[], now: Date): string | null {
  const [hour, minute] = time.split(":").map(Number);
  for (let ahead = 0; ahead <= 7; ahead++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead, hour, minute);
    const isoDay = date.getDay() === 0 ? 7 : date.getDay();
    if (date <= now || !days.includes(isoDay)) continue;
    const label = ahead === 0 ? "Today" : ahead === 1 ? "Tomorrow" : WEEKDAYS[isoDay - 1].short;
    return `${label} at ${formatReminderTime(time)}`;
  }
  return null;
}

export type RemindersChange =
  | { type: "upsert"; reminder: Reminder }
  | { type: "remove"; id: string };

/** Reads a change from the browser; null if it isn't one. */
export function parseRemindersChange(value: unknown): RemindersChange | null {
  if (typeof value !== "object" || value === null) return null;
  const change = value as { type?: unknown; reminder?: unknown; id?: unknown };
  if (change.type === "remove" && typeof change.id === "string") {
    return { type: "remove", id: change.id };
  }
  if (change.type === "upsert") {
    const [reminder] = validateReminders([change.reminder]) ?? [];
    return reminder ? { type: "upsert", reminder } : null;
  }
  return null;
}

/** The list after the change, or null when it would go over the limit. A change
 *  is applied to the stored list, not to what one device last saw, so two
 *  devices editing different reminders don't undo each other. */
export function applyRemindersChange(
  current: Reminder[],
  change: RemindersChange,
): Reminder[] | null {
  if (change.type === "remove") return current.filter((r) => r.id !== change.id);
  const exists = current.some((r) => r.id === change.reminder.id);
  const next = exists
    ? current.map((r) => (r.id === change.reminder.id ? change.reminder : r))
    : [...current, change.reminder];
  return next.length > MAX_REMINDERS ? null : next;
}
