"use client";

import { BookOpen, Check, RefreshCw, SquareCheckBig } from "lucide-react";
import { GoalPill } from "@/components/kit";
import { TONES, type Tone } from "@/components/kit/tones";
import { useGoalCount } from "@/components/goals/use-goal-count";
import type { GoalTier } from "@/lib/goals/levels";
import { formatCount } from "@/lib/kit/text";

const TIER_LOOK: Record<GoalTier, { tone: Tone; verb: string; Icon: typeof BookOpen }> = {
  read: { tone: "read", verb: "read", Icon: BookOpen },
  review: { tone: "review", verb: "reviewed", Icon: RefreshCw },
  quiz: { tone: "quiz", verb: "answered", Icon: SquareCheckBig },
};

/** Today's progress for the tier being studied. Shows nothing until the shell
 *  has loaded today's counts. */
export function StudyGoalPill({ tier }: { tier: GoalTier }) {
  const today = useGoalCount(tier);
  if (!today) return null;
  const { tone, verb, Icon } = TIER_LOOK[tier];
  const { count, goal } = today;

  if (goal === null) {
    return (
      <GoalPill
        tone={tone}
        icon={<Icon className={`size-5 ${TONES[tone].text}`} strokeWidth={2.4} aria-hidden />}
        label={count === 0 ? "Just started" : `${formatCount(count)} ${verb} today`}
      />
    );
  }
  const met = count >= goal;
  return (
    <GoalPill
      tone={met ? "success" : tone}
      value={count / goal}
      label={
        met ? (
          <span className="inline-flex items-center gap-1">
            {count > goal ? `${formatCount(count)} today` : `${goal} of ${goal} today`}
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </span>
        ) : (
          `${formatCount(count)} of ${formatCount(goal)} today`
        )
      }
    />
  );
}
