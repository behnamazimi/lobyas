"use client";

import { useSyncExternalStore } from "react";
import type { GoalTier } from "@/lib/goals/levels";
import type { GoalDayCounts } from "@/lib/goals/progress";
import { goalCountFor, subscribeGoals } from "./goal-store";

function subscribeHydration() {
  return () => {};
}

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

/** Server counts until this tab's store is ready, then the store. The first
 *  client render matches the server so a soft navigation can correct it
 *  without a hydration mismatch. */
export function useLiveGoalCounts(server: GoalDayCounts): GoalDayCounts {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const read = useGoalCount("read");
  const review = useGoalCount("review");
  const quiz = useGoalCount("quiz");
  if (!hydrated || !read || !review || !quiz) return server;
  return { read: read.count, review: review.count, quiz: quiz.count };
}
