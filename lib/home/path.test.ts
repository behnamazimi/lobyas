import { describe, expect, it } from "vitest";
import { buildHomePath } from "./path";

const QUEUES = { read: 24, review: 118, quiz: 96 };
const NONE = { read: null, review: null, quiz: null };

function path(overrides: Partial<Parameters<typeof buildHomePath>[0]> = {}) {
  return buildHomePath({
    goals: { read: 10, review: 20, quiz: 10 },
    counts: { read: 0, review: 0, quiz: 0 },
    celebrated: [],
    queues: QUEUES,
    ...overrides,
  });
}

const pillTier = (data: ReturnType<typeof path>) =>
  data.stops.find((stop) => stop.highlighted)?.tier ?? null;

describe("buildHomePath", () => {
  it("puts the pill on the first unmet goal with a queue", () => {
    const data = path({ counts: { read: 10, review: 3, quiz: 0 } });
    expect(pillTier(data)).toBe("review");
    expect(data.pillText).toBe("Continue");
    expect(data.cta).toEqual({ href: "/app/review", label: "Continue Review" });
    expect(data.note).toBe("1 of 3 goals met");
  });

  it("skips an unmet goal whose queue is empty", () => {
    const data = path({ queues: { ...QUEUES, read: 0 } });
    expect(pillTier(data)).toBe("review");
    expect(data.stops[0].queueLine).toBe("Nothing new right now");
  });

  it("counts a tier celebrated for running out of terms as met", () => {
    const data = path({
      counts: { read: 4, review: 0, quiz: 0 },
      celebrated: ["read"],
    });
    expect(data.stops[0]).toMatchObject({
      met: true,
      sub: "Goal met · 4 of 10",
    });
    expect(pillTier(data)).toBe("review");
  });

  it("shows the total when a goal is passed", () => {
    expect(path({ counts: { read: 128, review: 0, quiz: 0 } }).stops[0].sub).toBe(
      "Goal met · 128 today",
    );
  });

  it("lights the trophy and drops the pill when every goal is met", () => {
    const data = path({ counts: { read: 10, review: 20, quiz: 10 } });
    expect(data.trophy.kind).toBe("done");
    expect(pillTier(data)).toBeNull();
    expect(data.cta).toEqual({ href: "/app/read", label: "Keep reading" });
  });

  it("only counts the tiers that have a goal", () => {
    const data = path({
      goals: { read: 10, review: null, quiz: 5 },
      counts: { read: 10, review: 0, quiz: 0 },
    });
    expect(data.note).toBe("1 of 2 goals met");
    expect(data.stops[1]).toMatchObject({ ringValue: null, sub: null });
    expect(pillTier(data)).toBe("quiz");
  });

  it("offers the first stop with a queue when no goals are set", () => {
    const data = path({ goals: NONE, queues: { ...QUEUES, read: 0 } });
    expect(data.hasGoals).toBe(false);
    expect(data.trophy.kind).toBe("prompt");
    expect(pillTier(data)).toBe("review");
    expect(data.pillText).toBe("Start here");
  });

  it("treats goals that were never saved like no goals", () => {
    expect(path({ goals: null }).hasGoals).toBe(false);
  });

  it("has no pill when nothing is queued", () => {
    expect(pillTier(path({ queues: { read: 0, review: 0, quiz: 0 } }))).toBeNull();
  });
});
