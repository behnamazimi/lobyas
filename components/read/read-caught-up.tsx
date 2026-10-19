import type { ReactNode } from "react";
import { GoalCaughtUp } from "@/components/goals/goal-caught-up";
import { CaughtUpScene } from "@/components/illustrations/scenes/caught-up";
import { EmptyPanel } from "@/components/kit";
import type { GoalTier } from "@/lib/goals/levels";

/** Shared "nothing left to read" empty state for both the paged Read view
 *  and the fullscreen feed, so the two never visually drift apart. */
export function ReadCaughtUp({
  title = "No terms to read",
  description,
  actions,
  goal,
}: {
  /** Counts toward a daily goal: running out of terms meets it. */
  goal?: { tier: GoalTier; collectionId: string };
  title?: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
      {goal ? <GoalCaughtUp tier={goal.tier} collectionId={goal.collectionId} /> : null}
      <EmptyPanel
        illustration={<CaughtUpScene className="w-full" />}
        title={title}
        description={description}
        actions={actions}
      />
    </div>
  );
}
