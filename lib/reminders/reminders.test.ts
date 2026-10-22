import { describe, expect, it } from "vitest";
import {
  formatNextReminder,
  formatReminderDays,
  parseReminders,
  validateReminders,
} from "./reminders";

const good = { id: "a", time: "07:30", days: [1, 3], enabled: true };

describe("parseReminders", () => {
  it("drops malformed entries and keeps the rest", () => {
    const result = parseReminders([
      good,
      { ...good, id: "b", time: "7:30" },
      { ...good, id: "c", days: [] },
      { ...good, id: "d", days: [0, 8] },
      "nope",
    ]);
    expect(result).toEqual([good]);
  });

  it("sorts days and keeps only the first reminder with an id", () => {
    const result = parseReminders([
      { ...good, days: [3, 1] },
      { ...good, time: "08:00" },
    ]);
    expect(result).toEqual([good]);
  });
});

describe("validateReminders", () => {
  it("rejects more than three reminders", () => {
    const four = ["a", "b", "c", "d"].map((id) => ({ ...good, id }));
    expect(validateReminders(four)).toBeNull();
  });

  it("rejects a list with a bad reminder instead of dropping it", () => {
    expect(validateReminders([good, { ...good, id: "b", time: "24:00" }])).toBeNull();
  });

  it("rejects duplicate days", () => {
    expect(validateReminders([{ ...good, days: [1, 1] }])).toBeNull();
  });

  it("accepts an empty list", () => {
    expect(validateReminders([])).toEqual([]);
  });
});

describe("formatReminderDays", () => {
  it.each([
    [[1, 2, 3, 4, 5, 6, 7], "Every day"],
    [[1, 2, 3, 4, 5], "Mon–Fri"],
    [[1, 3], "Mon, Wed"],
  ])("%j reads %s", (days, text) => {
    expect(formatReminderDays(days)).toBe(text);
  });
});

describe("formatNextReminder", () => {
  // Wednesday 2026-10-21 at 20:00 local time.
  const now = new Date(2026, 9, 21, 20, 0);

  it("is today while the time is still ahead", () => {
    expect(formatNextReminder("21:30", [3], now)).toBe("Today at 9:30 PM");
  });

  it("skips to the next listed day once today's time has passed", () => {
    expect(formatNextReminder("19:00", [3, 5], now)).toBe("Fri at 7:00 PM");
  });

  it("says tomorrow for the next day", () => {
    expect(formatNextReminder("08:00", [4], now)).toBe("Tomorrow at 8:00 AM");
  });

  it("wraps to the same weekday next week", () => {
    expect(formatNextReminder("19:00", [3], now)).toBe("Wed at 7:00 PM");
  });

  it("is null with no days", () => {
    expect(formatNextReminder("19:00", [], now)).toBeNull();
  });
});
