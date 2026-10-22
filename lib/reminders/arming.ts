import type { ScheduledReminder } from "./schedule";

/** What was scheduled, including the timezone: the OS fixes each alarm's moment
 *  when it is set, so a new timezone means the alarms have to be set again. */
export function armedSignature(wanted: ScheduledReminder[], timeZone: string): string {
  return JSON.stringify([timeZone, wanted.map((n) => [n.id, n.schedule.on, n.title, n.body])]);
}

/** True when the OS already holds exactly what was last armed, so nothing needs
 *  rescheduling. Missing or extra pending ids mean the OS lost or kept schedules. */
export function isArmed(
  wanted: ScheduledReminder[],
  pendingIds: number[],
  storedSignature: string | null,
  timeZone: string,
): boolean {
  const pending = [...pendingIds].sort((a, b) => a - b);
  const expected = wanted.map((n) => n.id).sort((a, b) => a - b);
  return (
    storedSignature === armedSignature(wanted, timeZone) &&
    pending.length === expected.length &&
    pending.every((id, i) => id === expected[i])
  );
}
