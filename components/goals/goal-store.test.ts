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

function day(review: number, celebrated: GoalDay["celebrated"] = []): GoalDay {
  return { date: TODAY, counts: { read: 0, review, quiz: 0 }, celebrated };
}

function seed(review = 0, celebrated: GoalDay["celebrated"] = []) {
  seedGoals({
    goals: { read: null, review: 3, quiz: 5 },
    celebrate: true,
    timeZone: "UTC",
    day: day(review, celebrated),
  });
}

/** Lets the mocked action's promise settle. */
const settle = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  claim.mockReset();
});

afterEach(() => {
  resetGoals();
  vi.useRealTimers();
});

describe("goal store", () => {
  it("does nothing until seeded", async () => {
    tickGoal("review", ["a", "b", "c"]);
    await settle();
    expect(claim).not.toHaveBeenCalled();
  });

  it("asks the server once the goal looks met and opens the celebration", async () => {
    seed(1);
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });

    tickGoal("review", "a");
    expect(claim).not.toHaveBeenCalled();
    tickGoal("review", "b");
    await settle();

    expect(claim).toHaveBeenCalledExactlyOnceWith("review", false);
    expect(getGoalsSnapshot()?.celebration?.tier).toBe("review");
  });

  it("keeps a held tier's celebration until it is released", async () => {
    seed(2);
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });
    const release = holdGoalCelebration("review");

    tickGoal("review", "a");
    await settle();
    expect(claim).toHaveBeenCalledOnce();
    expect(getGoalsSnapshot()?.celebration).toBeNull();

    release();
    expect(getGoalsSnapshot()?.celebration?.tier).toBe("review");
  });

  it("settles a met goal only once its celebration has come and gone", async () => {
    seed(2);
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });
    const release = holdGoalCelebration("review");

    tickGoal("review", "a");
    expect(goalMetSettled("review")).toBe(false);
    await settle();
    expect(goalMetSettled("review")).toBe(false);
    release();
    expect(goalMetSettled("review")).toBe(false);
    closeGoalCelebration();
    expect(goalMetSettled("review")).toBe(true);
  });

  it("settles a met goal at once when celebrations are off", () => {
    seed(3);
    setLiveCelebrate(false);
    expect(goalMetSettled("review")).toBe(true);
  });

  it("counts a term once per tab", async () => {
    seed(0);
    tickGoal("review", ["a", "a", "b"]);
    tickGoal("review", "b");
    await settle();
    expect(claim).not.toHaveBeenCalled();
  });

  it("retries a few times when the server is behind, then waits for new credit", async () => {
    seed(2);
    claim.mockResolvedValue({ claimed: false, day: day(2) });

    tickGoal("review", "a");
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

    tickGoal("review", ["old-1", "old-2", "new"]);
    await settle();
    await vi.advanceTimersByTimeAsync(1500);
    expect(claim).toHaveBeenCalledTimes(2);
    claim.mockClear();

    // Back to the server's 2; one more new term brings it to 3 for real.
    claim.mockResolvedValue({ claimed: true, day: day(3, ["review"]) });
    tickGoal("review", "old-1");
    await settle();
    expect(claim).not.toHaveBeenCalled();
    tickGoal("review", "another");
    await settle();
    expect(claim).toHaveBeenCalledTimes(1);
  });

  it("never asks again for a tier already celebrated today", async () => {
    seed(3, ["review"]);
    tickGoal("review", ["a", "b"]);
    goalCaughtUp("review");
    await settle();
    expect(claim).not.toHaveBeenCalled();
  });

  it("treats running out of terms as met only after studying the tier", async () => {
    seed(0);
    claim.mockResolvedValue({ claimed: true, day: day(1, ["review"]) });

    goalCaughtUp("review");
    await settle();
    expect(claim).not.toHaveBeenCalled();

    tickGoal("review", "a");
    goalCaughtUp("review");
    await settle();
    expect(claim).toHaveBeenCalledExactlyOnceWith("review", true);
  });

  it("starts a new day from zero", async () => {
    seed(2, ["quiz"]);
    vi.setSystemTime(new Date("2026-10-12T01:00:00Z"));
    tickGoal("review", "a");
    await settle();
    expect(claim).not.toHaveBeenCalled();
    expect(getGoalsSnapshot()?.day).toMatchObject({ date: "2026-10-12", celebrated: [] });
  });

  it("forgets the previous account on reset", () => {
    seed(2);
    resetGoals();
    expect(getGoalsSnapshot()).toBeNull();
    seedGoals({ goals: null, celebrate: false, timeZone: "UTC", day: day(0) });
    expect(getGoalsSnapshot()?.goals).toBeNull();
  });

  describe("goalCountFor", () => {
    it("knows nothing until today's counts are loaded", () => {
      expect(goalCountFor("review")).toBeNull();
    });

    it("counts a term credited in this tab on top of the server's count", () => {
      seed(1);
      tickGoal("review", "a");
      expect(goalCountFor("review")).toEqual({ goal: 3, count: 2 });
    });

    it("counts a credit on the loaded day when nothing can celebrate", () => {
      seedGoals({
        goals: null,
        celebrate: false,
        timeZone: "UTC",
        day: { date: TODAY, counts: { read: 4, review: 0, quiz: 0 }, celebrated: [] },
      });
      tickGoal("read", "a");
      expect(goalCountFor("read")).toEqual({ goal: null, count: 5 });
    });

    it("keeps today's credits when celebrate is switched off", () => {
      seed(1);
      tickGoal("review", "a");
      setLiveCelebrate(false);
      expect(goalCountFor("review")).toEqual({ goal: 3, count: 2 });
    });
  });
});
