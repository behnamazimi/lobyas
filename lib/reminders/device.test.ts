import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Reminder } from "./reminders";

const native = vi.hoisted(() => ({
  permission: "granted" as string,
  pending: [] as number[] | null,
  cancelled: [] as number[][],
  scheduled: [] as unknown[],
  scheduleOk: true,
  capable: true,
  pendingGate: null as null | Promise<void>,
}));

vi.mock("@/lib/native/capabilities", () => ({ hasCapability: () => native.capable }));
vi.mock("@/lib/native/notifications", () => ({
  notificationPermission: async () => native.permission,
  pendingNotificationIds: async () => {
    await native.pendingGate;
    return native.pending;
  },
  cancelNotifications: async (ids: number[]) => {
    if (ids.length > 0) native.cancelled.push(ids);
    return true;
  },
  scheduleNotifications: async (notifications: unknown[]) => {
    native.scheduled.push(notifications);
    return native.scheduleOk;
  },
}));

const { applyReminders, clearReminders, syncRemindersFromServer } = await import("./device");

const reminder: Reminder = { id: "a", time: "07:05", days: [1, 2], enabled: true };
const stored = new Map<string, string>();

beforeEach(() => {
  Object.assign(native, {
    permission: "granted",
    pending: [],
    cancelled: [],
    scheduled: [],
    scheduleOk: true,
    capable: true,
    pendingGate: null,
  });
  stored.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => void stored.set(key, value),
    removeItem: (key: string) => void stored.delete(key),
  });
});

describe("applyReminders", () => {
  it("schedules the reminders and remembers what it armed", async () => {
    expect(await applyReminders([reminder])).toBe(true);
    expect(native.scheduled).toHaveLength(1);
    expect((native.scheduled[0] as unknown[]).length).toBe(2);
    expect(stored.size).toBe(1);
  });

  it("leaves a device that already holds the same schedule alone", async () => {
    await applyReminders([reminder]);
    native.pending = [11, 12];
    native.scheduled = [];
    expect(await applyReminders([reminder])).toBe(true);
    expect(native.scheduled).toEqual([]);
    expect(native.cancelled).toEqual([]);
  });

  it("replaces what the OS holds when the reminders changed", async () => {
    await applyReminders([reminder]);
    native.pending = [11, 12];
    expect(await applyReminders([{ ...reminder, time: "08:00" }])).toBe(true);
    expect(native.cancelled).toEqual([[11, 12]]);
    expect(native.scheduled).toHaveLength(2);
  });

  it("cancels everything and schedules nothing when no reminder is on", async () => {
    native.pending = [11];
    expect(await applyReminders([{ ...reminder, enabled: false }])).toBe(true);
    expect(native.cancelled).toEqual([[11]]);
    expect(native.scheduled).toEqual([]);
  });

  it("does nothing without notification permission, and doesn't count that as a failure", async () => {
    native.permission = "denied";
    expect(await applyReminders([reminder])).toBe(true);
    expect(native.scheduled).toEqual([]);
  });

  it("reports a failed schedule and doesn't remember it as armed", async () => {
    native.scheduleOk = false;
    expect(await applyReminders([reminder])).toBe(false);
    expect(stored.size).toBe(0);
  });

  it("reports pending schedules it can't read as a failure", async () => {
    native.pending = null;
    expect(await applyReminders([reminder])).toBe(false);
  });

  it("finishes one change before starting the next", async () => {
    let release = () => {};
    native.pendingGate = new Promise<void>((resolve) => (release = resolve));
    const first = applyReminders([reminder]);
    const second = applyReminders([{ ...reminder, time: "09:00" }]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(native.scheduled).toEqual([]);
    native.pendingGate = null;
    release();
    await Promise.all([first, second]);
    expect(native.scheduled).toHaveLength(2);
  });
});

describe("clearReminders", () => {
  it("cancels what the OS holds and forgets the armed schedule", async () => {
    await applyReminders([reminder]);
    native.pending = [11, 12];
    await clearReminders();
    expect(native.cancelled).toEqual([[11, 12]]);
    expect(stored.size).toBe(0);
  });
});

describe("syncRemindersFromServer", () => {
  const respond = (init: { status?: number; type?: string; body?: unknown }) =>
    vi.stubGlobal("fetch", async () => ({
      status: init.status ?? 200,
      type: init.type ?? "basic",
      ok: (init.status ?? 200) < 300,
      json: async () => init.body,
    }));

  it("arms the device from the account's reminders", async () => {
    respond({ body: { reminders: [reminder] } });
    await syncRemindersFromServer();
    expect(native.scheduled).toHaveLength(1);
  });

  it("clears the device when the visitor is signed out, whether the proxy answers 401 or redirects", async () => {
    native.pending = [11];
    respond({ status: 401 });
    await syncRemindersFromServer();
    respond({ type: "opaqueredirect", status: 0 });
    await syncRemindersFromServer();
    expect(native.cancelled).toEqual([[11], [11]]);
  });

  it("leaves the device as it is when the app is offline", async () => {
    vi.stubGlobal("fetch", async () => Promise.reject(new Error("offline")));
    native.pending = [11];
    await syncRemindersFromServer();
    expect(native.cancelled).toEqual([]);
    expect(native.scheduled).toEqual([]);
  });

  it("does not ask the server when the app can't schedule", async () => {
    native.capable = false;
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await syncRemindersFromServer();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
