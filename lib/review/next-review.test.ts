import { describe, expect, it } from "vitest";
import { AGAIN, EASY, GOOD, HARD } from "@/lib/trace";
import {
  describeNextReview,
  formatNextReview,
  gradeTileLabels,
  nextReviewDays,
} from "./next-review";

describe("formatNextReview", () => {
  it("picks the unit by size", () => {
    expect(formatNextReview(0)).toBe("1m");
    expect(formatNextReview(10 / (24 * 60))).toBe("10m");
    expect(formatNextReview(5 / 24)).toBe("5h");
    expect(formatNextReview(3.4)).toBe("3d");
    expect(formatNextReview(59)).toBe("59d");
    expect(formatNextReview(104)).toBe("3mo");
    expect(formatNextReview(550)).toBe("1.5y");
  });

  it("moves up a unit when rounding reaches the next one", () => {
    expect(formatNextReview(59.8 / (24 * 60))).toBe("1h");
    expect(formatNextReview(0.99)).toBe("1d");
    expect(formatNextReview(59.7)).toBe("2mo");
    expect(formatNextReview(362)).toBe("1y");
  });
});

describe("describeNextReview", () => {
  it("says it in words", () => {
    expect(describeNextReview(1 / 24)).toBe("back in about 1 hour");
    expect(describeNextReview(3.4)).toBe("back in about 3 days");
    expect(describeNextReview(104)).toBe("back in about 3 months");
  });
});

describe("nextReviewDays", () => {
  it("reads the card's recall state, dates included", () => {
    const now = new Date("2026-03-01T09:00:00Z");
    const days = nextReviewDays(
      {
        stability: 10,
        difficulty: 5,
        lastReviewAt: "2026-02-20T09:00:00.000Z",
        readCount: 2,
        lastReadAt: "2026-02-19T09:00:00.000Z",
      },
      now,
    );
    expect(days[AGAIN]).toBeLessThan(days[HARD]);
    expect(days[HARD]).toBeLessThan(days[GOOD]);
    expect(days[GOOD]).toBeLessThan(days[EASY]);
  });

  it("works for a term never graded", () => {
    const days = nextReviewDays(
      {
        stability: null,
        difficulty: null,
        lastReviewAt: null,
        readCount: 0,
        lastReadAt: null,
      },
      new Date("2026-03-01T09:00:00Z"),
    );
    expect(days[AGAIN]).toBeLessThan(1);
    expect(days[GOOD]).toBeGreaterThan(1);
  });
});

describe("gradeTileLabels", () => {
  const days = { [AGAIN]: 0.5, [HARD]: 2, [GOOD]: 6, [EASY]: 21 };

  it("gives every grade an interval and a spoken name", () => {
    const { intervals, ariaLabels } = gradeTileLabels(days, false);
    expect(intervals).toMatchObject({ again: "12h", good: "6d" });
    expect(ariaLabels.good).toBe("Good, back in about 6 days");
    expect(ariaLabels.again).toBe("Again, back in about 12 hours");
  });

  it("says a missed term is asked again while a retry is left", () => {
    const { intervals, ariaLabels } = gradeTileLabels(days, true);
    expect(intervals.again).toBe("~2m");
    expect(ariaLabels.again).toBe("Again, asked again in about 2 minutes");
    expect(ariaLabels.hard).toBe("Hard, back in about 2 days");
  });
});
