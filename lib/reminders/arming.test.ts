import { describe, expect, it } from "vitest";
import { armedSignature, isArmed } from "./arming";
import { buildScheduledReminders } from "./schedule";

const wanted = buildScheduledReminders([{ id: "a", time: "07:05", days: [1, 2], enabled: true }]);
const ids = wanted.map((n) => n.id);
const signature = armedSignature(wanted, "Europe/Amsterdam");

describe("isArmed", () => {
  it("is true when the OS holds what was armed", () => {
    expect(isArmed(wanted, [...ids].reverse(), signature, "Europe/Amsterdam")).toBe(true);
  });

  it("is false when the OS lost a schedule", () => {
    expect(isArmed(wanted, ids.slice(1), signature, "Europe/Amsterdam")).toBe(false);
  });

  it("is false when the OS kept one that is no longer wanted", () => {
    expect(isArmed(wanted, [...ids, 99], signature, "Europe/Amsterdam")).toBe(false);
  });

  it("is false after a timezone change", () => {
    expect(isArmed(wanted, ids, signature, "America/New_York")).toBe(false);
  });

  it("is false when the time or copy changed since arming", () => {
    const edited = buildScheduledReminders([
      { id: "a", time: "08:00", days: [1, 2], enabled: true },
    ]);
    expect(isArmed(edited, ids, signature, "Europe/Amsterdam")).toBe(false);
  });

  it("is false when nothing was ever armed", () => {
    expect(isArmed(wanted, ids, null, "Europe/Amsterdam")).toBe(false);
  });
});
