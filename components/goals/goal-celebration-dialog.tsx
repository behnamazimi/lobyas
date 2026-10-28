"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { GoalCheerScene } from "@/components/illustrations/scenes/goal-cheer";
import { BottomSheet, Pill } from "@/components/kit";
import { GOAL_TIER_HREFS, GOAL_TIER_LABELS, type GoalTier } from "@/lib/goals/levels";
import { allGoalsMet, nextOpenTier } from "@/lib/goals/progress";
import { formatCount } from "@/lib/kit/text";
import { closeGoalCelebration, getGoalsSnapshot, subscribeGoals } from "./goal-store";
import { GoalTodayRows } from "./goal-today-rows";

const DONE_NOUNS: Record<GoalTier, [string, string]> = {
  read: ["term read", "terms read"],
  review: ["term reviewed", "terms reviewed"],
  quiz: ["term quizzed", "terms quizzed"],
};

const NEXT_STEPS: Record<GoalTier, { label: string; unit: [string, string] }> = {
  read: { label: "Start reading", unit: ["term", "terms"] },
  review: { label: "Start reviewing", unit: ["term", "terms"] },
  quiz: { label: "Start your Quiz", unit: ["term", "terms"] },
};

const MORE_LABELS: Record<GoalTier, string> = {
  read: "Read more terms",
  review: "Review more terms",
  quiz: "Answer a few more",
};

const plural = (count: number, [one, many]: [string, string]) =>
  `${formatCount(count)} ${count === 1 ? one : many}`;

export function GoalCelebrationDialog({ streak }: { streak: number }) {
  const router = useRouter();
  const celebration = useSyncExternalStore(
    subscribeGoals,
    () => getGoalsSnapshot()?.celebrations[0] ?? null,
    () => null,
  );
  if (!celebration) return null;

  const { tier, progress, collectionName, collectionId, caughtUp } = celebration;
  const all = allGoalsMet(progress);
  const next = nextOpenTier(progress);
  const left = next ? (progress[next].goal ?? 0) - progress[next].done : 0;
  const leave = (href: string) => {
    closeGoalCelebration();
    router.push(href);
  };

  return (
    <BottomSheet
      full
      isOpen
      onOpenChange={(open) => {
        if (!open) closeGoalCelebration();
      }}
      title={all ? "Today’s goals met!" : `${GOAL_TIER_LABELS[tier]} goal met!`}
      subline={`${collectionName}: ${plural(progress[tier].done, DONE_NOUNS[tier])}. Today counts for your ${formatCount(streak)}-day streak, so you can stop here.`}
      hero={
        <div
          className="bg-warning px-6 pt-10 pb-4 md:pt-6"
          style={{ borderRadius: "0 0 50% 50% / 0 0 28px 28px" }}
        >
          <GoalCheerScene
            lead={tier}
            all={all}
            className="ill-on-light mx-auto w-full max-w-72 md:max-w-56"
          />
        </div>
      }
      footer={
        <div className="flex flex-col gap-2.5">
          {next ? (
            <Pill
              size="lg"
              autoFocus
              className="flex-col gap-0"
              onClick={() => leave(`${GOAL_TIER_HREFS[next]}?collection=${collectionId}`)}
            >
              {NEXT_STEPS[next].label}
              <span className="text-[13px] font-semibold opacity-75">
                {plural(left, NEXT_STEPS[next].unit)} to reach today&rsquo;s goal
              </span>
            </Pill>
          ) : (
            <Pill size="lg" autoFocus onClick={() => leave("/app")}>
              Finish for today
            </Pill>
          )}
          <Pill
            variant="secondary"
            className="h-[52px] w-full text-base"
            onClick={closeGoalCelebration}
          >
            {caughtUp ? "Close" : MORE_LABELS[tier]}
          </Pill>
          {next ? (
            <Pill variant="ghost" className="self-center" onClick={() => leave("/app")}>
              I&rsquo;m done for today
            </Pill>
          ) : null}
        </div>
      }
    >
      <GoalTodayRows progress={progress} next={next} />
    </BottomSheet>
  );
}
