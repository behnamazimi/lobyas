"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import type { GoalTier } from "@/lib/goals/levels";
import { goalCaughtUp } from "./goal-store";

/** Rendered beside a tier's "nothing left" state. Every study screen works on
 *  one collection, so running out of terms in it counts toward the goal. */
export function GoalCaughtUp({ tier, collectionId }: { tier: GoalTier; collectionId: string }) {
  useMountEffect(() => {
    if (collectionId) goalCaughtUp(tier);
  });
  return null;
}
