import { describe, expect, it } from "vitest";
import type { Reminder } from "./reminders";
import { buildScheduledReminders } from "./schedule";

const reminder = (over: Partial<Reminder>): Reminder => ({
  id: "a",
  time: "07:05",
  days: [1],
  enabled: true,
  ...over,
});

describe("buildScheduledReminders", () => {
  it("maps Monday to the plugin's 2 and Sunday to its 1", () => {
    const [monday, sunday] = buildScheduledReminders([reminder({ days: [1, 7] })]);
    expect(monday.schedule.on).toEqual({ weekday: 2, hour: 7, minute: 5 });
    expect(sunday.schedule.on.weekday).toBe(1);
  });

  it("gives every reminder and weekday its own stable id", () => {
    const list = [reminder({ days: [1, 2] }), reminder({ id: "b", days: [1] })];
    const ids = buildScheduledReminders(list).map((n) => n.id);
    expect(ids).toEqual([11, 12, 21]);
    expect(buildScheduledReminders(list).map((n) => n.id)).toEqual(ids);
  });

  it("skips disabled reminders without shifting the others' ids", () => {
    const list = [reminder({ enabled: false }), reminder({ id: "b", days: [2] })];
    expect(buildScheduledReminders(list).map((n) => n.id)).toEqual([22]);
  });

  it("schedules at most 21 at once", () => {
    const every = [1, 2, 3, 4, 5, 6, 7];
    const list = ["a", "b", "c"].map((id) => reminder({ id, days: every }));
    expect(buildScheduledReminders(list)).toHaveLength(21);
  });

  it("rotates the three characters by weekday", () => {
    const [mon, tue, wed, thu] = buildScheduledReminders([reminder({ days: [1, 2, 3, 4] })]);
    expect(new Set([mon.title, tue.title, wed.title]).size).toBe(3);
    expect(thu).toMatchObject({ title: mon.title, body: mon.body });
  });

  it("never asks Android for exact alarms", () => {
    const list = buildScheduledReminders([reminder({ days: [1, 2] })]);
    expect(list.every((n) => n.isExactNotification === false)).toBe(true);
  });
});
