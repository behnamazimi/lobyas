import { describe, expect, it } from "vitest";
import {
  applyRemindersChange,
  formatNextReminder,
  formatReminderDays,
  formatReminderTime,
  parseReminders,
  parseRemindersChange,
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
    expect(formatNextReminder("21:30", [3], now, false)).toBe("Today at 9:30 PM");
  });

  it("skips to the next listed day once today's time has passed", () => {
    expect(formatNextReminder("19:00", [3, 5], now, false)).toBe("Fri at 7:00 PM");
  });

  it("says tomorrow for the next day", () => {
    expect(formatNextReminder("08:00", [4], now, false)).toBe("Tomorrow at 8:00 AM");
  });

  it("wraps to the same weekday next week", () => {
    expect(formatNextReminder("19:00", [3], now, false)).toBe("Wed at 7:00 PM");
  });

  it("is null with no days", () => {
    expect(formatNextReminder("19:00", [], now, false)).toBeNull();
  });
});

describe("applyRemindersChange", () => {
  const other = { ...good, id: "b" };

  it("changes one reminder and leaves the rest of the stored list alone", () => {
    const edited = { ...good, time: "09:00" };
    expect(applyRemindersChange([good, other], { type: "upsert", reminder: edited })).toEqual([
      edited,
      other,
    ]);
  });

  it("adds a new reminder", () => {
    expect(applyRemindersChange([good], { type: "upsert", reminder: other })).toEqual([
      good,
      other,
    ]);
  });

  it("refuses a fourth reminder", () => {
    const three = ["a", "b", "c"].map((id) => ({ ...good, id }));
    expect(
      applyRemindersChange(three, { type: "upsert", reminder: { ...good, id: "d" } }),
    ).toBeNull();
  });

  it("removes by id, and an unknown id changes nothing", () => {
    expect(applyRemindersChange([good, other], { type: "remove", id: "a" })).toEqual([other]);
    expect(applyRemindersChange([good], { type: "remove", id: "zzz" })).toEqual([good]);
  });
});

describe("parseRemindersChange", () => {
  it("accepts a valid upsert and remove", () => {
    expect(parseRemindersChange({ type: "upsert", reminder: good })).toEqual({
      type: "upsert",
      reminder: good,
    });
    expect(parseRemindersChange({ type: "remove", id: "a" })).toEqual({ type: "remove", id: "a" });
  });

  it("rejects a bad reminder or an unknown type", () => {
    expect(
      parseRemindersChange({ type: "upsert", reminder: { ...good, time: "99:99" } }),
    ).toBeNull();
    expect(parseRemindersChange({ type: "wipe" })).toBeNull();
    expect(parseRemindersChange(null)).toBeNull();
  });
});

describe("formatReminderTime", () => {
  it.each([
    ["00:00", false, "12:00 AM"],
    ["12:00", false, "12:00 PM"],
    ["19:05", false, "7:05 PM"],
    ["19:05", true, "19:05"],
    ["07:05", true, "07:05"],
  ])("%s on a 24-hour clock = %s reads %s", (time, is24Hour, text) => {
    expect(formatReminderTime(time, is24Hour)).toBe(text);
  });

  it("says the next reminder in the same clock", () => {
    const now = new Date(2026, 9, 21, 20, 0);
    expect(formatNextReminder("21:30", [3], now, true)).toBe("Today at 21:30");
  });
});
