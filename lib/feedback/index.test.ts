import { beforeEach, describe, expect, it, vi } from "vitest";
import { feedback } from "@/lib/feedback";
import { buzz } from "@/lib/feedback/haptics";
import { playSound } from "@/lib/feedback/sounds";

vi.mock("@/lib/feedback/haptics", () => ({ buzz: vi.fn() }));
vi.mock("@/lib/feedback/sounds", () => ({ playSound: vi.fn() }));

describe("feedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pairs a quiz answer with a sound and a haptic", () => {
    feedback("answer-wrong");
    expect(playSound).toHaveBeenCalledWith("wrong");
    expect(buzz).toHaveBeenCalledWith("warning");
  });

  it.each(["goal-met", "rate", "choose"] as const)("keeps %s silent", (cue) => {
    feedback(cue);
    expect(playSound).not.toHaveBeenCalled();
    expect(buzz).toHaveBeenCalledOnce();
  });
});
