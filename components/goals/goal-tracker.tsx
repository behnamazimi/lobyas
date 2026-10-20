"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import type { DailyGoals } from "@/lib/goals/levels";
import type { GoalDay } from "@/lib/goals/settings";
import { GoalCelebrationDialog } from "./goal-celebration-dialog";
import { resetGoals, seedGoals } from "./goal-store";

export function GoalTracker({
  streak,
  ...seed
}: {
  goals: DailyGoals | null;
  celebrate: boolean;
  timeZone: string;
  day: GoalDay;
  streak: number;
}) {
  useMountEffect(() => {
    seedGoals(seed);
    return resetGoals;
  });
  return <GoalCelebrationDialog streak={streak} />;
}
