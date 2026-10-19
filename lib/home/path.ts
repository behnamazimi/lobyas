import {
  GOAL_TIER_HREFS,
  GOAL_TIER_LABELS,
  GOAL_TIERS,
  type DailyGoals,
  type GoalTier,
} from "@/lib/goals/levels";
import { goalProgress, type GoalDayCounts } from "@/lib/goals/progress";
import { formatCount } from "@/lib/kit/text";

export type TierQueues = Record<GoalTier, number>;

export type PathStopData = {
  tier: GoalTier;
  label: string;
  href: string;
  /** Null when the tier has no goal. */
  goal: number | null;
  done: number;
  met: boolean;
  /** The stop that carries the pill. */
  highlighted: boolean;
  /** 0 to 1, or null when the tier has no goal. */
  ringValue: number | null;
  sub: string | null;
  /** The short "x of y" for the goals card, or null without a goal. */
  short: string | null;
  queueLine: string;
  empty: boolean;
  aria: string;
};

type PathTrophy =
  | { kind: "locked"; title: string; note: string }
  | { kind: "done"; title: string; note: string }
  | { kind: "prompt" };

export type HomePathData = {
  hasGoals: boolean;
  stops: PathStopData[];
  trophy: PathTrophy;
  /** The line beside "Today". */
  note: string;
  pillText: string;
  /** The desktop primary action. */
  cta: { href: string; label: string };
};

const GOAL_COUNT_WORDS: Record<number, { title: string; note: string }> = {
  1: { title: "Your daily goal", note: "Meet it and the lobyas celebrate" },
  2: {
    title: "Both goals",
    note: "Meet both and the lobyas celebrate together",
  },
  3: {
    title: "All three goals",
    note: "Meet all three and the lobyas celebrate together",
  },
};

function subLine(goal: number, done: number, met: boolean): string {
  if (!met) return `${formatCount(done)} of ${formatCount(goal)} today`;
  if (done > goal) return `Goal met · ${formatCount(done)} today`;
  return `Goal met · ${formatCount(done)} of ${formatCount(goal)}`;
}

export function buildHomePath(input: {
  goals: DailyGoals | null;
  counts: GoalDayCounts;
  celebrated: readonly GoalTier[];
  queues: TierQueues;
}): HomePathData {
  const { counts, celebrated, queues } = input;
  const goals = input.goals ?? { read: null, review: null, quiz: null };
  const progress = goalProgress(goals, counts, celebrated);
  const setTiers = GOAL_TIERS.filter((tier) => progress[tier].goal !== null);
  const hasGoals = setTiers.length > 0;

  const highlightedTier =
    GOAL_TIERS.find((tier) => {
      if (queues[tier] <= 0) return false;
      return hasGoals ? progress[tier].goal !== null && !progress[tier].met : true;
    }) ?? null;

  const stops = GOAL_TIERS.map((tier): PathStopData => {
    const { goal, done, met } = progress[tier];
    const empty = queues[tier] <= 0;
    const queueLine = empty ? "Nothing new right now" : `${formatCount(queues[tier])} in queue`;
    const label = GOAL_TIER_LABELS[tier];
    return {
      tier,
      label,
      href: GOAL_TIER_HREFS[tier],
      goal,
      done,
      met,
      highlighted: tier === highlightedTier,
      ringValue: goal === null ? null : Math.min(done / goal, 1),
      sub: goal === null ? null : subLine(goal, done, met),
      short: goal === null ? null : `${formatCount(done)} of ${formatCount(goal)}`,
      queueLine,
      empty,
      aria:
        goal === null
          ? `${label}, ${queueLine}`
          : `${label}, ${formatCount(done)} of ${formatCount(goal)} today, ${queueLine}`,
    };
  });

  const metTiers = setTiers.filter((tier) => progress[tier].met).length;
  const allMet = hasGoals && metTiers === setTiers.length;
  const words = GOAL_COUNT_WORDS[setTiers.length];

  let trophy: PathTrophy = { kind: "prompt" };
  if (hasGoals) {
    trophy = allMet
      ? { kind: "done", title: "All goals met", note: "Keep going if you like" }
      : { kind: "locked", ...words };
  }

  const highlighted = stops.find((stop) => stop.highlighted);
  const noun = setTiers.length === 1 ? "goal" : "goals";
  return {
    hasGoals,
    stops,
    trophy,
    note: hasGoals
      ? `${metTiers} of ${setTiers.length} ${noun} met`
      : "Any stop is a fine place to begin",
    pillText: hasGoals ? "Continue" : "Start here",
    cta: highlighted
      ? {
          href: highlighted.href,
          label: hasGoals ? `Continue ${highlighted.label}` : `Start with ${highlighted.label}`,
        }
      : { href: GOAL_TIER_HREFS.read, label: "Keep reading" },
  };
}
