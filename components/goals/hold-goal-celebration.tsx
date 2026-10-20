"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import type { GoalTier } from "@/lib/goals/levels";
import { holdGoalCelebration } from "./goal-store";

/** Keeps a tier's celebration waiting while this is mounted. */
export function HoldGoalCelebration({ tier }: { tier: GoalTier }) {
  useMountEffect(() => holdGoalCelebration(tier));
  return null;
}
