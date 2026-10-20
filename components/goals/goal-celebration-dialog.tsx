"use client";

import { Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { GoalCheerScene } from "@/components/illustrations/scenes/goal-cheer";
import { BottomSheet, Pill, StatTile } from "@/components/kit";
import { GOAL_TIER_LABELS, GOAL_TIERS, type GoalTier } from "@/lib/goals/levels";
import { allGoalsMet, nextOpenTier } from "@/lib/goals/progress";
import { formatCount } from "@/lib/kit/text";
import { closeGoalCelebration, getGoalsSnapshot, subscribeGoals } from "./goal-store";
import { GoalTodayRows } from "./goal-today-rows";

const COUNT_LABELS: Record<GoalTier, string> = {
  read: "read today",
  review: "reviewed today",
  quiz: "answered today",
};

export function GoalCelebrationDialog({ streak }: { streak: number }) {
  const router = useRouter();
  const celebration = useSyncExternalStore(
    subscribeGoals,
    () => getGoalsSnapshot()?.celebration ?? null,
    () => null,
  );
  if (!celebration) return null;

  const { tier, progress } = celebration;
  const all = allGoalsMet(progress);
  const next = nextOpenTier(progress, tier);
  // The tier that just finished, then the busiest other tier if it has any activity today.
  const other = GOAL_TIERS.filter((t) => t !== tier).sort(
    (a, b) => progress[b].done - progress[a].done,
  )[0];
  const countTiers = progress[other].done > 0 ? [tier, other] : [tier];

  return (
    <BottomSheet
      full
      isOpen
      onOpenChange={(open) => {
        if (!open) closeGoalCelebration();
      }}
      title={all ? "Today’s goals met!" : `${GOAL_TIER_LABELS[tier]} goal met!`}
      subline="That’s your pace for today. Stopping here is fine, and today already counts for your streak."
      hero={
        <div
          className="bg-warning px-6 pt-10 pb-4 md:pt-6"
          style={{ borderRadius: "0 0 50% 50% / 0 0 28px 28px" }}
        >
          <GoalCheerScene lead={tier} all={all} className="mx-auto w-full max-w-72 md:max-w-56" />
        </div>
      }
      footer={
        <div className="flex flex-col gap-2.5">
          <Pill
            size="lg"
            autoFocus
            onClick={() => {
              closeGoalCelebration();
              router.push("/app");
            }}
          >
            Done for today
          </Pill>
          <Pill
            variant="secondary"
            className="h-[52px] w-full text-base"
            onClick={closeGoalCelebration}
          >
            Keep going
          </Pill>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div
          className={
            countTiers.length === 1 ? "grid grid-cols-2 gap-2.5" : "grid grid-cols-3 gap-2.5"
          }
        >
          <StatTile
            icon={<Flame className="size-5 fill-accent text-accent" strokeWidth={2} aria-hidden />}
            value={formatCount(streak)}
            label="day streak"
          />
          {countTiers.map((t) => (
            <StatTile key={t} value={formatCount(progress[t].done)} label={COUNT_LABELS[t]} />
          ))}
        </div>
        <GoalTodayRows progress={progress} next={next} onNavigate={closeGoalCelebration} />
      </div>
    </BottomSheet>
  );
}
