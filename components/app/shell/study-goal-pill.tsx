"use client";

import { Check } from "lucide-react";
import { PageBadge } from "@/components/illustrations/scenes/page-badge";
import { GoalPill } from "@/components/kit";
import type { Tone } from "@/components/kit/tones";
import { useGoalCount } from "@/components/goals/use-goal-count";
import type { GoalTier } from "@/lib/goals/levels";
import { formatCount } from "@/lib/kit/text";

const TIER_LOOK: Record<GoalTier, { tone: Tone; verb: string }> = {
  read: { tone: "read", verb: "read" },
  review: { tone: "review", verb: "reviewed" },
  quiz: { tone: "quiz", verb: "answered" },
};

/** Today's progress for the tier being studied. Shows nothing until the shell
 *  has loaded today's counts. */
export function StudyGoalPill({ tier }: { tier: GoalTier }) {
  const today = useGoalCount(tier);
  if (!today) return null;
  const { tone, verb } = TIER_LOOK[tier];
  const { count, goal } = today;

  if (goal === null) {
    return (
      <GoalPill
        tone={tone}
        icon={<PageBadge page={tier} className="size-6" />}
        label={count === 0 ? "Just started" : `${formatCount(count)} ${verb} today`}
      />
    );
  }
  const met = count >= goal;
  return (
    <GoalPill
      tone={met ? "success" : tone}
      value={count / goal}
      icon={
        met ? <Check className="size-3 text-success-text" strokeWidth={3} aria-hidden /> : undefined
      }
      label={
        met && count > goal
          ? `${formatCount(count)} today`
          : `${formatCount(met ? goal : count)} of ${formatCount(goal)} today`
      }
    />
  );
}
