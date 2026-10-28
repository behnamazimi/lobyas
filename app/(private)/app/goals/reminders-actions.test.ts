import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  stored: [] as unknown[],
  saved: [] as unknown[],
  signedIn: true,
}));

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("@/lib/auth/require-session", () => ({
  requireAuthenticatedClient: async () =>
    state.signedIn ? { supabase: {}, user: { id: "u1" } } : { error: "Log in to continue." },
}));
vi.mock("@/lib/goals/settings", () => ({
  loadReminders: async () => state.stored,
  saveReminders: async (_client: unknown, _userId: string, reminders: unknown) => {
    state.saved.push(reminders);
  },
}));

const { saveRemindersAction } = await import("./actions");

const reminder = { id: "a", time: "19:00", days: [1, 2, 3, 4, 5, 6, 7], enabled: true };
const other = { ...reminder, id: "b" };

beforeEach(() => {
  state.stored = [];
  state.saved = [];
  state.signedIn = true;
});

describe("saveRemindersAction", () => {
  it("adds to the stored list, not to what the device last saw", async () => {
    state.stored = [other];
    const result = await saveRemindersAction({ type: "upsert", reminder });
    expect(result).toEqual({ reminders: [other, reminder] });
    expect(state.saved).toEqual([[other, reminder]]);
  });

  it("refuses a bad change before saving", async () => {
    const result = await saveRemindersAction({
      type: "upsert",
      reminder: { ...reminder, time: "25:00" },
    });
    expect(result.error).toBeTruthy();
    expect(state.saved).toEqual([]);
  });

  it("refuses a fourth reminder", async () => {
    state.stored = ["a", "b", "c"].map((id) => ({ ...reminder, id }));
    const result = await saveRemindersAction({
      type: "upsert",
      reminder: { ...reminder, id: "d" },
    });
    expect(result.error).toBeTruthy();
    expect(state.saved).toEqual([]);
  });

  it("refuses when signed out", async () => {
    state.signedIn = false;
    expect(await saveRemindersAction({ type: "remove", id: "a" })).toEqual({
      error: "Log in to continue.",
    });
  });
});
