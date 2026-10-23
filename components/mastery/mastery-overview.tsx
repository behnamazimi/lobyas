"use client";

import type { GoalDayCounts } from "@/lib/goals/progress";
import type { WebStatsSnapshot } from "@/lib/mastery/collection-stats";
import { Card, Divider } from "@/components/kit";
import { CollectionCard, PausedCollectionCard } from "./collection-card";
import { formatLifetimeTotals } from "./mastery-format";
import { MasteryPracticeActivity } from "./mastery-practice-activity";
import { pluralize } from "@/lib/utils";

type MasteryOverviewProps = {
  stats: WebStatsSnapshot;
  today: GoalDayCounts;
  /** Ever touched (any activity), not yet Mastered, not marked known. */
  termsLearning: number;
  /** §8 "terms learned" — high-water mark, never decreases. */
  termsLearned: number;
  onSelectCollection: (collectionId: string) => void;
};

/** Per-collection breakdown follows the totals — that's what users actually track day to
 *  day. There's no single "overall strength" number here: mastery is shown
 *  per collection instead (see CollectionCard), since blending collections
 *  at very different stages into one aggregate obscured more than it told. */
export function MasteryOverview({
  stats,
  today,
  termsLearning,
  termsLearned,
  onSelectCollection,
}: MasteryOverviewProps) {
  const hasLifetimeTotals =
    stats.lifetimeTotals.reviews +
      stats.lifetimeTotals.quizAnswers +
      stats.lifetimeTotals.termsRead >
    0;

  return (
    <div className="flex flex-col gap-3">
      <Card radius="md" className="p-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <div className="text-[13px] font-bold text-muted">Learning</div>
            <div className="text-[26px] leading-tight font-extrabold tabular-nums">
              {pluralize(termsLearning, "term")}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-muted">Mastered</div>
            <div className="text-[26px] leading-tight font-extrabold tabular-nums">
              {pluralize(termsLearned, "term")}
            </div>
          </div>
        </div>
        {hasLifetimeTotals ? (
          <p className="m-0 mt-1.5 text-[13px] font-semibold text-muted">
            {formatLifetimeTotals(stats.lifetimeTotals)}
          </p>
        ) : null}
        <Divider className="mx-0 my-3" />
        <MasteryPracticeActivity stats={stats} today={today} />
      </Card>

      {stats.activeCollections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} onSelect={onSelectCollection} />
      ))}
      {stats.pausedCollections.map((collection) => (
        <PausedCollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
