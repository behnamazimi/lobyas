import { Check } from "lucide-react";
import Link from "next/link";
import { ProgressRing } from "@/components/kit";
import { TONES, type Tone } from "@/components/kit/tones";
import { GOAL_TIER_HREFS, GOAL_TIER_LABELS, GOAL_TIERS, type GoalTier } from "@/lib/goals/levels";
import type { GoalProgress } from "@/lib/goals/progress";
import { formatCount } from "@/lib/kit/text";
import { cn } from "@/lib/utils";

const TIER_TONE: Record<GoalTier, Tone> = { read: "read", review: "review", quiz: "quiz" };

/** Today's goals with a check on the met ones. The open tier to go to next gets a link. */
export function GoalTodayRows({
  progress,
  next,
  onNavigate,
}: {
  progress: GoalProgress;
  next: GoalTier | null;
  onNavigate: () => void;
}) {
  const tiers = GOAL_TIERS.filter((tier) => progress[tier].goal !== null);
  return (
    <section
      aria-label="Today's goals"
      className="flex flex-col gap-2.5 rounded-[22px] bg-base-100 px-4 py-3.5 shadow-card"
    >
      <h3 className="m-0 font-sans text-[15px] font-extrabold">Today&rsquo;s goals</h3>
      {tiers.map((tier) => {
        const { goal, done, met } = progress[tier];
        return (
          <div key={tier} className="flex items-center gap-3">
            {met ? (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-success-content">
                <Check className="size-3.5" strokeWidth={4} aria-hidden />
              </span>
            ) : (
              <ProgressRing
                value={(done ?? 0) / (goal ?? 1)}
                tone={TIER_TONE[tier]}
                size={28}
                strokeWidth={14}
              />
            )}
            <span className="flex-1 text-[15px] font-bold">{GOAL_TIER_LABELS[tier]}</span>
            <span
              className={cn(
                "text-sm font-extrabold tabular-nums",
                met ? "text-success-text" : "text-muted",
              )}
            >
              {formatCount(done)} of {formatCount(goal ?? 0)}
            </span>
            {tier === next ? (
              <Link
                href={GOAL_TIER_HREFS[tier]}
                onClick={onNavigate}
                className={cn(
                  "-my-2 flex h-11 items-center rounded-full px-3.5 text-sm font-extrabold",
                  TONES[TIER_TONE[tier]].soft,
                )}
              >
                Go to {GOAL_TIER_LABELS[tier]}
              </Link>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
