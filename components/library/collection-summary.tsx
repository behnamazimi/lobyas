import { Heart } from "lucide-react";
import type { ReactNode } from "react";
import { collectionLetter, collectionTone } from "@/components/app/shell/collection-look";
import { Banner, ProgressBar, Tile } from "@/components/kit";
import { ownerNoticeFor } from "@/lib/collections/moderation";
import { CLAMP_TWO_LINES, collectionTitleClass, formatCount } from "@/lib/kit/text";
import { countLabel, kindLabel } from "@/lib/terms/kinds";
import type { Collection } from "@/lib/terms/types";
import { cn, pluralize } from "@/lib/utils";

/** The top of the Library's collection card: letter tile, kind and count, name,
 *  mastery bar, description, meta line and the owner's share notice. */
export function CollectionSummary({
  collection,
  categoryCount,
}: {
  collection: Collection;
  categoryCount: number;
}) {
  const meta: ReactNode[] = [];
  if (collection.source === "owned") {
    if (collection.visibility === "shared") {
      meta.push("Shared");
      meta.push(
        <span key="loves" className="inline-flex items-center gap-1 tabular-nums">
          <Heart className="size-3.5 fill-wrong text-wrong" aria-hidden strokeWidth={1.5} />
          <span className="sr-only">Loves: </span>
          {collection.loveCount}
        </span>,
      );
    }
  } else {
    meta.push("Added");
  }
  if (categoryCount > 0) meta.push(pluralize(categoryCount, "category", "categories"));

  const hasTerms = collection.termCount > 0;

  return (
    <>
      <div className="flex items-start gap-3">
        <Tile tone={collectionTone(collection.kind)} size={48} serif>
          {collection.icon || collectionLetter(collection.name)}
        </Tile>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-muted">
            {kindLabel(collection.kind)} · {countLabel(collection.kind, collection.termCount)}
          </div>
          <h2
            className={cn(
              "m-0 mt-0.5 font-heading font-extrabold [overflow-wrap:anywhere]",
              collectionTitleClass(collection.name),
              CLAMP_TWO_LINES,
            )}
          >
            {collection.name}
          </h2>
        </div>
      </div>

      {hasTerms ? (
        <div className="mt-3 flex items-center gap-2.5">
          <ProgressBar
            value={collection.termsLearnedCount / collection.termCount}
            label={`${collection.name} mastered`}
            className="flex-1"
          />
          <span className="text-[13px] font-extrabold tabular-nums">
            {formatCount(collection.termsLearnedCount)} of {formatCount(collection.termCount)}{" "}
            mastered
          </span>
        </div>
      ) : null}

      {collection.description ? (
        <p
          className={cn(
            "mt-2.5 mb-0 text-[15px] leading-snug font-semibold text-ink-soft",
            CLAMP_TWO_LINES,
          )}
        >
          {collection.description}
        </p>
      ) : null}

      {meta.length > 0 ? (
        <p className="mt-1.5 mb-0 flex flex-wrap items-center gap-x-1.5 text-[13px] font-bold text-muted">
          {meta.map((part, index) => (
            <span key={index} className="inline-flex items-center gap-x-1.5">
              {index > 0 ? <span aria-hidden>·</span> : null}
              {part}
            </span>
          ))}
        </p>
      ) : null}

      {collection.source === "owned" && collection.shareBlockedReason ? (
        <Banner className="mt-3">{ownerNoticeFor(collection.shareBlockedReason)}</Banner>
      ) : null}
    </>
  );
}
