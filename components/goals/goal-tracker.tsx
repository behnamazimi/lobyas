"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import type { GoalDay } from "@/lib/goals/settings";
import { GoalCelebrationDialog } from "./goal-celebration-dialog";
import { resetGoals, seedGoals } from "./goal-store";

export function GoalTracker({
  streak,
  ...seed
}: {
  collection: { id: string; name: string; day: GoalDay } | null;
  celebrate: boolean;
  timeZone: string;
  streak: number;
}) {
  useMountEffect(() => {
    seedGoals(seed);
    return resetGoals;
  });
  return <GoalCelebrationDialog streak={streak} />;
}
