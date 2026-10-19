"use client";

import { FeedbackNote } from "@/components/kit";
import { useGoalCount } from "@/components/goals/use-goal-count";
import type { GoalTier } from "@/lib/goals/levels";

const TIER_NAME: Record<GoalTier, string> = {
  read: "Read",
  review: "Review",
  quiz: "Quiz",
};

/** A quiet note once today's goal for a tier is met. The celebration itself is
 *  the server's claim flow; this only says the goal is done. */
export function GoalMetNote({ tier }: { tier: GoalTier }) {
  const today = useGoalCount(tier);
  if (!today || today.goal === null || today.count < today.goal) return null;
  return (
    <FeedbackNote
      kind="correct"
      title={`${TIER_NAME[tier]} goal met.`}
      className="items-center py-2"
    >
      Keep going as long as you like.
    </FeedbackNote>
  );
}
