"use client";

import { PageBadge } from "@/components/illustrations/scenes/page-badge";
import { Card, SECTION_TITLE, Stepper } from "@/components/kit";
import {
  GOAL_LEVEL_LABELS,
  GOAL_LEVELS,
  GOAL_TIER_LABELS,
  goalForLevel,
  nearestLevel,
  stepGoal,
  type GoalTier,
} from "@/lib/goals/levels";
import { formatCount } from "@/lib/kit/text";
import { cn } from "@/lib/utils";

const UNITS: Record<GoalTier, { short: string; perDay: string }> = {
  read: { short: "to read", perDay: "terms to read a day" },
  review: { short: "to recall", perDay: "terms to recall a day" },
  quiz: { short: "to test", perDay: "terms to test a day" },
};

const WHAT_COUNTS: Record<GoalTier, string> = {
  read: "Look terms over to get familiar with them, new ones or ones you’ve seen.",
  review:
    "Recall terms from memory, the ones about to slip first. Each term counts once a day, new or not.",
  quiz: "Answer questions to show you recognise terms.",
};

const SELECTED: Record<GoalTier, string> = {
  read: "bg-read-tint ring-2 ring-read-ring",
  review: "bg-review-tint ring-2 ring-review-ring",
  quiz: "bg-quiz-tint ring-2 ring-quiz-ring",
};

/** One mode's pace: presets, a stepper for fine-tuning and what is done today. */
export function TierCard({
  tier,
  goal,
  done,
  onChange,
}: {
  tier: GoalTier;
  goal: number | null;
  done: number;
  onChange: (goal: number | null) => void;
}) {
  const level = nearestLevel(tier, goal);
  const label = GOAL_TIER_LABELS[tier];
  const selected = SELECTED[tier];
  const { short, perDay } = UNITS[tier];

  return (
    <Card radius="md" className="p-4">
      <div className="flex items-center gap-3">
        <PageBadge page={tier} />
        <div className="min-w-0 flex-1">
          <h3 className={SECTION_TITLE}>{label}</h3>
          <p className="m-0 text-[13px] font-bold text-muted tabular-nums">
            {goal ? `${formatCount(done)} of ${formatCount(goal)} today` : "No goal"}
          </p>
        </div>
        <Stepper
          value={goal ?? 0}
          valueText={goal ? undefined : "Off"}
          unit={short}
          decreaseLabel={`Fewer ${perDay}`}
          increaseLabel={`More ${perDay}`}
          disableDecrease={goal === null}
          onDecrease={() => onChange(stepGoal(goal, -1))}
          onIncrease={() => onChange(stepGoal(goal, 1))}
        />
      </div>
      <p className="m-0 mt-2.5 text-sm text-muted">{WHAT_COUNTS[tier]}</p>
      <div role="group" aria-label={`${label} pace`} className="mt-3 grid grid-cols-4 gap-1.5">
        {GOAL_LEVELS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={level === option}
            onClick={() => onChange(goalForLevel(tier, option))}
            className={cn(
              "h-11 rounded-full text-sm font-extrabold",
              level === option ? selected : "bg-base-200",
            )}
          >
            {GOAL_LEVEL_LABELS[option]}
          </button>
        ))}
      </div>
    </Card>
  );
}
