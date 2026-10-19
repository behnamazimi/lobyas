"use client";

import { FeedbackNote } from "@/components/kit";
import { useGoalCount } from "@/components/goals/use-goal-count";

/** A quiet note once today's Read goal is met. The celebration itself is the
 *  server's claim flow; this only says the goal is done. */
export function ReadGoalMet() {
  const today = useGoalCount("read");
  if (!today || today.goal === null || today.count < today.goal) return null;
  return (
    <FeedbackNote kind="correct" title="Read goal met." className="items-center py-2">
      Keep going as long as you like.
    </FeedbackNote>
  );
}
