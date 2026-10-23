"use client";

import { useSyncExternalStore } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import type { GoalTier } from "@/lib/goals/levels";
import type { GoalDayCounts } from "@/lib/goals/progress";
import { ensureGoalCollection, goalCountFor, subscribeGoals } from "./goal-store";

function subscribeHydration() {
  return () => {};
}

/** Primitives only: `useSyncExternalStore` needs a stable snapshot. */
function snapshot(collectionId: string, tier: GoalTier): string {
  const value = goalCountFor(collectionId, tier);
  return value ? `${value.count}:${value.goal ?? ""}` : "";
}

/** Today's count for a collection's tier and its goal, live as this tab
 *  credits terms. Key the caller by collection: the goals load on mount. */
export function useGoalCount(
  collectionId: string,
  tier: GoalTier,
): { count: number; goal: number | null } | null {
  useMountEffect(() => ensureGoalCollection(collectionId));
  const raw = useSyncExternalStore(
    subscribeGoals,
    () => snapshot(collectionId, tier),
    () => "",
  );
  if (!raw) return null;
  const [count, goal] = raw.split(":");
  return { count: Number(count), goal: goal ? Number(goal) : null };
}

/** Server counts until this tab's store is ready, then the store. The first
 *  client render matches the server so a soft navigation can correct it
 *  without a hydration mismatch. */
export function useLiveGoalCounts(collectionId: string, server: GoalDayCounts): GoalDayCounts {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const read = useGoalCount(collectionId, "read");
  const review = useGoalCount(collectionId, "review");
  const quiz = useGoalCount(collectionId, "quiz");
  if (!hydrated || !read || !review || !quiz) return server;
  return { read: read.count, review: review.count, quiz: quiz.count };
}
