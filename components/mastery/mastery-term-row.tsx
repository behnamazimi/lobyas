import { Check } from "lucide-react";
import { memo } from "react";
import type {
  MasteryTermJourney,
  MasteryTermRow as MasteryTermRowData,
} from "@/lib/mastery/mastery";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { pluralize } from "@/lib/utils";
import { MasteryBars } from "./mastery-bars";

const TIER_LABEL: Record<MasteryTermRowData["tier"], string> = {
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
};

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** The mastered-terms "journey" line — a quiet reward moment, tap to see
 *  the first-seen → mastered span behind it. */
function JourneyLine({ journey }: { journey: MasteryTermJourney }) {
  const days = pluralize(journey.learnedInDays, "day");
  return (
    <Collapsible>
      <CollapsibleTrigger className="m-0 mt-0.5 cursor-pointer rounded border-none bg-transparent p-0 text-left text-xs text-success-text underline decoration-dotted underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-primary">
        Mastered in {days}.
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="m-0 mt-0.5 text-xs font-semibold text-muted">
          First seen {formatShortDate(journey.firstSeenAt)} → mastered{" "}
          {formatShortDate(journey.masteredAt)} ({days})
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export const MasteryTermRow = memo(function MasteryTermRow({ row }: { row: MasteryTermRowData }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-3xl bg-base-100 px-4 py-3 shadow-card">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-heading text-base font-extrabold text-base-content">
            {row.term}
          </span>
          {row.known ? (
            <Check
              className="size-4 shrink-0 text-success-text"
              aria-label="Mastered"
              strokeWidth={2.5}
            />
          ) : null}
        </div>
        <p className="m-0 mt-0.5 truncate text-[13px] font-semibold text-muted">
          {row.category ? `${row.collectionName} · ${row.category}` : row.collectionName}
        </p>
        {row.known && row.journey ? <JourneyLine journey={row.journey} /> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {row.markedKnown ? (
          <span
            className="rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-extrabold"
            title="You marked this known"
          >
            Marked known
          </span>
        ) : !row.started ? (
          <span className="text-xs font-bold text-muted">Not started</span>
        ) : (
          <>
            <MasteryBars score={row.score} tier={row.tier} />
            <span className="text-xs font-bold text-muted tabular-nums">
              {TIER_LABEL[row.tier]} ({row.score}/100)
            </span>
          </>
        )}
      </div>
    </li>
  );
});
