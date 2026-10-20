import Link from "next/link";
import type { ReactNode } from "react";
import { Card, MasteryStack, ProgressBar, Tile } from "@/components/kit";
import { collectionLetter } from "@/components/app/shell/collection-look";
import type { CollectionStatBreakdown } from "@/lib/mastery/collection-stats";
import { formatPaceLine, formatUnseenFootnote } from "./mastery-format";
import { cn, pluralize } from "@/lib/utils";

type CollectionCardData = {
  id: string;
  name: string;
  termsLearnedCount: number;
  markedKnownCount: number;
  totalCount: number;
  percentage: number;
};

function CardHead({ collection, paused }: { collection: CollectionCardData; paused?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Tile tone="read" serif>
        {collectionLetter(collection.name)}
      </Tile>
      <div className="min-w-0 flex-1">
        <h3 className="m-0 truncate font-sans text-base font-extrabold">{collection.name}</h3>
        {paused ? <p className="m-0 text-[13px] font-bold text-muted">Paused</p> : null}
      </div>
      <span className="shrink-0 text-[13px] font-bold text-muted tabular-nums">
        {pluralize(collection.totalCount, "term")}
      </span>
    </div>
  );
}

function CardNotes({
  collection,
  children,
}: {
  collection: CollectionCardData;
  children: ReactNode;
}) {
  return (
    <div className="mt-2.5 space-y-1 text-sm leading-snug font-semibold">
      {children}
      {collection.markedKnownCount > 0 ? (
        <p className="m-0 text-xs font-bold text-muted">
          <span className="tabular-nums">{collection.markedKnownCount}</span> marked known by you
        </p>
      ) : null}
    </div>
  );
}

/** An active collection's progress. Pressing the card jumps to the Terms tab filtered to
 *  this collection; the Review link sits outside that button. */
export function CollectionCard({
  collection,
  onSelect,
}: {
  collection: CollectionStatBreakdown;
  onSelect: (collectionId: string) => void;
}) {
  const { buckets } = collection.paceInsight;
  const footnote =
    collection.unseenCount === buckets.neverLearning ? null : formatUnseenFootnote(collection);
  const paceLine = formatPaceLine(collection.paceInsight);

  return (
    <Card radius="md">
      <button
        type="button"
        onClick={() => onSelect(collection.id)}
        className="w-full rounded-3xl p-4 pb-2 text-start"
      >
        <CardHead collection={collection} />
        <MasteryStack
          className="mt-3"
          name={collection.name}
          mastered={buckets.mastered + collection.markedKnownCount}
          learning={buckets.learningNotMastered}
          notStarted={buckets.neverLearning}
        />
        <CardNotes collection={collection}>
          <p className="m-0">
            <strong className="font-extrabold">
              {Math.round(collection.currentStrength * 100)}% recall strength
            </strong>{" "}
            across {pluralize(buckets.mastered + buckets.learningNotMastered, "started term")}
          </p>
          {footnote ? (
            <p className="m-0 text-xs font-bold text-muted tabular-nums">{footnote}</p>
          ) : null}
          {paceLine ? <p className="m-0 text-xs font-bold text-muted">{paceLine}</p> : null}
        </CardNotes>
      </button>
      <Link
        href={`/app/review?collection=${collection.id}`}
        className="mx-4 mb-2 inline-flex min-h-11 items-center text-sm font-extrabold text-read-text"
      >
        Practice {collection.name} in Review
      </Link>
    </Card>
  );
}

/** A paused collection: dimmed, not interactive (nothing to drill into while paused). Paused
 *  collections have no bucket breakdown, so this shows the single mastered-count bar. */
export function PausedCollectionCard({ collection }: { collection: CollectionCardData }) {
  return (
    <Card radius="md" className={cn("p-4 opacity-70")}>
      <CardHead collection={collection} paused />
      <div className="mt-3">
        <ProgressBar
          className="w-full"
          value={collection.percentage / 100}
          label={`${collection.name} mastered ${collection.percentage}%`}
        />
        <p className="m-0 mt-1.5 text-xs font-bold text-muted">
          <span className="tabular-nums">{collection.termsLearnedCount}</span>/
          <span className="tabular-nums">{collection.totalCount}</span> mastered
        </p>
      </div>
      <CardNotes collection={collection}>{null}</CardNotes>
    </Card>
  );
}
