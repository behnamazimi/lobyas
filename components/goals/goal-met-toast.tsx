"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useToast } from "@/components/ui/toast";
import type { GoalTier } from "@/lib/goals/levels";
import { getGoalsSnapshot, goalMetSettled, subscribeGoals } from "./goal-store";

const TIER_NAME: Record<GoalTier, string> = {
  read: "Read",
  review: "Review",
  quiz: "Quiz",
};

/** A quiet toast, once per visit, when today's goal for a tier is met. A visit
 *  that showed the celebration skips it: the dialog already said so, and its
 *  buttons navigate away right after closing. */
export function GoalMetToast({ collectionId, tier }: { collectionId: string; tier: GoalTier }) {
  const settled = useSyncExternalStore(
    subscribeGoals,
    () => goalMetSettled(collectionId, tier),
    () => false,
  );
  const celebrating = useSyncExternalStore(
    subscribeGoals,
    () =>
      getGoalsSnapshot()?.celebrations.some(
        (c) => c.collectionId === collectionId && c.tier === tier,
      ) ?? false,
    () => false,
  );
  const { toast } = useToast();
  const shownRef = useRef(false);

  useEffect(() => {
    if (celebrating) shownRef.current = true;
    if (!settled || shownRef.current) return;
    shownRef.current = true;
    toast(`${TIER_NAME[tier]} goal met. Keep going as long as you like.`);
  }, [celebrating, settled, tier, toast]);

  return null;
}
