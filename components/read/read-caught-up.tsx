import type { ReactNode } from "react";
import { GoalCaughtUp } from "@/components/goals/goal-caught-up";
import { CaughtUpScene } from "@/components/illustrations/scenes/caught-up";
import Link from "next/link";
import { useShell } from "@/components/app/shell/shell-context";
import { EmptyPanel, Pill } from "@/components/kit";
import type { GoalTier } from "@/lib/goals/levels";

/** Shared "nothing left to read" empty state for both the paged Read view
 *  and the fullscreen feed, so the two never visually drift apart. */
export function ReadCaughtUp({
  title = "Nothing left to read here right now",
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
    <div className="study-enter flex min-h-0 flex-1 items-center justify-center py-6">
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

/** Where to go from a finished queue. `offerReview` adds a link to Review when it has terms. */
export function CaughtUpActions({ offerReview = false }: { offerReview?: boolean }) {
  const { current, setSwitcherOpen } = useShell();

  return (
    <>
      <Pill onClick={() => setSwitcherOpen(true)}>Switch collection</Pill>
      <Pill href="/app/import" variant="secondary">
        Add terms
      </Pill>
      {offerReview && current && current.queues.review > 0 ? (
        <Link
          href="/app/review"
          className="flex min-h-11 items-center justify-center text-[15px] font-extrabold text-read-text"
        >
          Review {current.name} instead
        </Link>
      ) : null}
    </>
  );
}
