"use client";

import { useSyncExternalStore } from "react";
import type { GoalTier } from "@/lib/goals/levels";
import { goalCountFor, subscribeGoals } from "./goal-store";

/** Primitives only: `useSyncExternalStore` needs a stable snapshot. */
function snapshot(tier: GoalTier): string {
  const value = goalCountFor(tier);
  return value ? `${value.count}:${value.goal ?? ""}` : "";
}

/** Today's count for a tier and its goal, live as this tab credits terms. */
export function useGoalCount(tier: GoalTier): { count: number; goal: number | null } | null {
  const raw = useSyncExternalStore(
    subscribeGoals,
    () => snapshot(tier),
    () => "",
  );
  if (!raw) return null;
  const [count, goal] = raw.split(":");
  return { count: Number(count), goal: goal ? Number(goal) : null };
}
