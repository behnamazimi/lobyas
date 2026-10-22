import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ saved: [] as unknown[], signedIn: true }));

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("@/lib/auth/require-session", () => ({
  requireAuthenticatedClient: async () =>
    state.signedIn ? { supabase: {}, user: { id: "u1" } } : { error: "Log in to continue." },
}));
vi.mock("@/lib/goals/settings", () => ({
  saveReminders: async (_client: unknown, _userId: string, reminders: unknown) => {
    state.saved.push(reminders);
  },
}));

const { saveRemindersAction } = await import("./actions");

const reminder = { id: "a", time: "19:00", days: [1, 2, 3, 4, 5, 6, 7], enabled: true };

beforeEach(() => {
  state.saved = [];
  state.signedIn = true;
});

describe("saveRemindersAction", () => {
  it("saves a valid list", async () => {
    expect(await saveRemindersAction([reminder])).toEqual({ reminders: [reminder] });
    expect(state.saved).toEqual([[reminder]]);
  });

  it("refuses a bad list before saving", async () => {
    const result = await saveRemindersAction([{ ...reminder, time: "25:00" }]);
    expect(result.error).toBeTruthy();
    expect(state.saved).toEqual([]);
  });

  it("refuses when signed out", async () => {
    state.signedIn = false;
    expect(await saveRemindersAction([reminder])).toEqual({ error: "Log in to continue." });
  });
});
