import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GoalDay } from "@/lib/goals/settings";

const claim = vi.fn();
vi.mock("@/app/(private)/app/goals/actions", () => ({
  claimGoalCelebrationAction: (...args: unknown[]) => claim(...args),
}));

const {
  closeGoalCelebration,
  getGoalsSnapshot,
  goalCaughtUp,
  goalCountFor,
  goalMetSettled,
  holdGoalCelebration,
  resetGoals,
  seedGoals,
  setLiveCelebrate,
  tickGoal,
} = await import("./goal-store");

const NOW = new Date("2026-10-11T10:00:00Z");
const TODAY = "2026-10-11";
const A = "col-a";
const B = "col-b";

function day(review: number, celebrated: GoalDay["celebrated"] = []): GoalDay {
  return {
    date: TODAY,
    goals: { read: null, review: 3, quiz: 5 },
    counts: { read: 0, review, quiz: 0 },
    celebrated,
  };
}

function seed(review = 0, celebrated: GoalDay["celebrated"] = []) {
  seedGoals({
    celebrate: true,
    timeZone: "UTC",
    collection: { id: A, name: "Alpha", day: day(review, celebrated) },
  });
}

/** Lets the mocked action's promise settle. */
const settle = () => vi.advanceTimersByTimeAsync(0);

const fetchDay = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  claim.mockReset();
  fetchDay.mockReset();
  vi.stubGlobal("fetch", fetchDay);
});

afterEach(() => {
  resetGoals();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("goal store", () => {
  it("does nothing until seeded", async () => {
    tickGoal(A, "review", ["a", "b", "c"]);
    await settle();
    expect(claim).not.toHaveBeenCalled();
  });

  it("asks the server once the goal looks met and opens the celebration", async () => {
    seed(1);
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });

    tickGoal(A, "review", "a");
    expect(claim).not.toHaveBeenCalled();
    tickGoal(A, "review", "b");
    await settle();

    expect(claim).toHaveBeenCalledExactlyOnceWith(A, "review", false);
    expect(getGoalsSnapshot()?.celebrations[0]).toMatchObject({
      collectionId: A,
      collectionName: "Alpha",
      tier: "review",
    });
  });

  it("keeps a held tier's celebration until it is released", async () => {
    seed(2);
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });
    const release = holdGoalCelebration("review");

    tickGoal(A, "review", "a");
    await settle();
    expect(claim).toHaveBeenCalledOnce();
    expect(getGoalsSnapshot()?.celebrations).toEqual([]);

    release();
    expect(getGoalsSnapshot()?.celebrations[0]?.tier).toBe("review");
  });

  it("settles a met goal only once its celebration has come and gone", async () => {
    seed(2);
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });
    const release = holdGoalCelebration("review");

    tickGoal(A, "review", "a");
    expect(goalMetSettled(A, "review")).toBe(false);
    await settle();
    expect(goalMetSettled(A, "review")).toBe(false);
    release();
    expect(goalMetSettled(A, "review")).toBe(false);
    closeGoalCelebration();
    expect(goalMetSettled(A, "review")).toBe(true);
  });

  it("settles a met goal at once when celebrations are off", () => {
    seed(3);
    setLiveCelebrate(false);
    expect(goalMetSettled(A, "review")).toBe(true);
  });

  it("counts a term once per tab", async () => {
    seed(0);
    tickGoal(A, "review", ["a", "a", "b"]);
    tickGoal(A, "review", "b");
    await settle();
    expect(claim).not.toHaveBeenCalled();
  });

  it("retries a few times when the server is behind, then waits for new credit", async () => {
    seed(2);
    claim.mockResolvedValue({ claimed: false, day: day(2) });

    tickGoal(A, "review", "a");
    await settle();
    expect(claim).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1500);
    expect(claim).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(claim).toHaveBeenCalledTimes(4);
  });

  it("trusts the server count after a failed claim, so re-counted terms don't keep asking", async () => {
    // Two of these were already counted by the server before the page loaded.
    seed(2);
    claim.mockResolvedValue({ claimed: false, day: day(2) });

    tickGoal(A, "review", ["old-1", "old-2", "new"]);
    await settle();
    await vi.advanceTimersByTimeAsync(1500);
    expect(claim).toHaveBeenCalledTimes(2);
    claim.mockClear();

    // Back to the server's 2; one more new term brings it to 3 for real.
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });
    tickGoal(A, "review", "old-1");
    await settle();
    expect(claim).not.toHaveBeenCalled();
    tickGoal(A, "review", "another");
    await settle();
    expect(claim).toHaveBeenCalledTimes(1);
  });

  it("never asks again for a tier already celebrated today", async () => {
    seed(3, ["review"]);
    tickGoal(A, "review", ["a", "b"]);
    goalCaughtUp(A, "review");
    await settle();
    expect(claim).not.toHaveBeenCalled();
  });

  it("treats running out of terms as met only after studying the tier", async () => {
    seed(0);
    claim.mockResolvedValue({ claimed: true, day: day(1, ["review"]) });

    goalCaughtUp(A, "review");
    await settle();
    expect(claim).not.toHaveBeenCalled();

    tickGoal(A, "review", "a");
    goalCaughtUp(A, "review");
    await settle();
    expect(claim).toHaveBeenCalledExactlyOnceWith(A, "review", true);
  });

  it("starts a new day from zero", async () => {
    seed(2, ["quiz"]);
    vi.setSystemTime(new Date("2026-10-12T01:00:00Z"));
    tickGoal(A, "review", "a");
    await settle();
    expect(claim).not.toHaveBeenCalled();
    expect(getGoalsSnapshot()?.collections[A]?.day).toMatchObject({
      date: "2026-10-12",
      celebrated: [],
    });
  });

  it("forgets the previous account on reset", () => {
    seed(2);
    resetGoals();
    expect(getGoalsSnapshot()).toBeNull();
  });

  describe("several collections", () => {
    it("keeps each collection's credits apart", async () => {
      seed(2);
      fetchDay.mockResolvedValue({ ok: true, json: async () => ({ name: "Beta", day: day(0) }) });
      claim.mockResolvedValue({ claimed: false, day: day(2) });

      tickGoal(B, "review", ["x", "y", "z"]);
      await settle();
      expect(goalCountFor(A, "review")).toEqual({ goal: 3, count: 2 });
      expect(claim).toHaveBeenCalledWith(B, "review", false);
      expect(claim).not.toHaveBeenCalledWith(A, "review", false);
    });

    it("loads a collection the page didn't seed, then claims what it was credited", async () => {
      seed(0);
      fetchDay.mockResolvedValue({ ok: true, json: async () => ({ name: "Beta", day: day(0) }) });
      claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });

      tickGoal(B, "review", ["x", "y", "z"]);
      expect(claim).not.toHaveBeenCalled();
      await settle();

      expect(fetchDay).toHaveBeenCalledExactlyOnceWith(`/api/goals/day?collection=${B}`);
      expect(claim).toHaveBeenCalledExactlyOnceWith(B, "review", false);
    });

    it("claims a caught-up report that came before the collection loaded", async () => {
      seed(0);
      fetchDay.mockResolvedValue({ ok: true, json: async () => ({ name: "Beta", day: day(2) }) });
      claim.mockResolvedValue({ claimed: true, day: day(2, ["review"]) });

      goalCaughtUp(B, "review");
      await settle();

      expect(claim).toHaveBeenCalledExactlyOnceWith(B, "review", true);
    });

    it("queues celebrations from different collections", async () => {
      seed(2);
      fetchDay.mockResolvedValue({ ok: true, json: async () => ({ name: "Beta", day: day(2) }) });
      claim.mockImplementation(async (id: string) => ({
        claimed: true,
        day: day(3, ["review"]),
        id,
      }));

      tickGoal(A, "review", "a");
      tickGoal(B, "review", "b");
      await settle();

      const queue = getGoalsSnapshot()?.celebrations.map((c) => c.collectionId);
      expect(queue).toEqual([A, B]);
      closeGoalCelebration();
      expect(getGoalsSnapshot()?.celebrations.map((c) => c.collectionId)).toEqual([B]);
    });
  });

  describe("goalCountFor", () => {
    it("knows nothing until today's counts are loaded", () => {
      expect(goalCountFor(A, "review")).toBeNull();
    });

    it("counts a term credited in this tab on top of the server's count", () => {
      seed(1);
      tickGoal(A, "review", "a");
      expect(goalCountFor(A, "review")).toEqual({ goal: 3, count: 2 });
    });

    it("counts a credit on the loaded day when the collection has no goals", () => {
      seedGoals({
        celebrate: true,
        timeZone: "UTC",
        collection: {
          id: A,
          name: "Alpha",
          day: {
            date: TODAY,
            goals: null,
            counts: { read: 4, review: 0, quiz: 0 },
            celebrated: [],
          },
        },
      });
      tickGoal(A, "read", "a");
      expect(goalCountFor(A, "read")).toEqual({ goal: null, count: 5 });
    });

    it("keeps today's credits when celebrate is switched off", () => {
      seed(1);
      tickGoal(A, "review", "a");
      setLiveCelebrate(false);
      expect(goalCountFor(A, "review")).toEqual({ goal: 3, count: 2 });
    });
  });
});
