"use client";

import { Check } from "lucide-react";
import { useGoalCount } from "@/components/goals/use-goal-count";
import type { GoalTier } from "@/lib/goals/levels";
import { formatCount } from "@/lib/kit/text";

const VERB: Record<GoalTier, string> = {
  read: "read",
  review: "reviewed",
  quiz: "answered",
};

/** Today's progress for the tier being studied in a collection, as plain
 *  text. Shows nothing until its counts are loaded. Key it by collection. */
export function StudyGoalText({ collectionId, tier }: { collectionId: string; tier: GoalTier }) {
  const today = useGoalCount(collectionId, tier);
  if (!today) return null;
  const { count, goal } = today;

  if (goal === null) {
    return (
      <span>{count === 0 ? "Just started" : `${formatCount(count)} ${VERB[tier]} today`}</span>
    );
  }
  if (count < goal) {
    return (
      <span>
        <span className="font-extrabold text-base-content">{formatCount(count)}</span> of{" "}
        {formatCount(goal)} today
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-success-text">
      <Check className="size-3.5" strokeWidth={3} aria-hidden />
      {count > goal ? `${formatCount(count)} today` : "Goal met"}
    </span>
  );
}
