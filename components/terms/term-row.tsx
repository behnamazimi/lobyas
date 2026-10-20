"use client";

import { Check, MoreHorizontal } from "lucide-react";
import { memo, useCallback, useContext } from "react";
import { TermDetailsScope } from "@/lib/library/details-store";
import { observeRowForDetails } from "@/lib/library/row-prefetch";
import type { LibraryTerm } from "@/lib/terms/types";
import { NarrationButton } from "@/components/library/narration-access";
import { cn } from "@/lib/utils";
import {
  QuickMarkKnownButton,
  RowSwipeLayer,
  useQuickToggleMarkedKnown,
} from "./mark-known-controls";
import { useRowSwipe } from "./use-row-swipe";

type TermRowProps = {
  term: LibraryTerm;
  known: boolean;
  /** User-set "I already know this" override — separate from `known`
   *  (TRACE's earned label). Never conflated in the UI. */
  markedKnown: boolean;
  selected: boolean;
  onSelect: (termId: string) => void;
  onToggleMarkedKnown: (termId: string) => Promise<boolean>;
  onActions: (term: LibraryTerm) => void;
};

function StatusBadge({ kind }: { kind: "mastered" | "marked" }) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex h-[22px] items-center gap-1 rounded-full px-2 align-middle text-xs font-extrabold",
        kind === "mastered" ? "bg-success-tint text-success-text" : "bg-read-tint text-read-text",
      )}
    >
      <Check className="size-3" strokeWidth={3} aria-hidden />
      {kind === "mastered" ? "Mastered" : "Marked known"}
    </span>
  );
}

export const TermRow = memo(function TermRow({
  term,
  known,
  markedKnown,
  selected,
  onSelect,
  onToggleMarkedKnown,
  onActions,
}: TermRowProps) {
  const scope = useContext(TermDetailsScope);

  const watchRow = useCallback(
    (element: HTMLDivElement | null) =>
      element ? observeRowForDetails(element, term.id, scope) : undefined,
    [term.id, scope],
  );

  const quickToggleMarkedKnown = useQuickToggleMarkedKnown(term, markedKnown, onToggleMarkedKnown);
  const swipe = useRowSwipe({ enabled: true, onCommit: quickToggleMarkedKnown });

  return (
    <div ref={watchRow} className="relative touch-pan-y" {...swipe.handlers}>
      <RowSwipeLayer ref={swipe.layerRef} markedKnown={markedKnown} />
      <article
        ref={swipe.rowRef}
        data-tour="library-term"
        data-term={term.term}
        className={cn(
          "group relative flex items-center gap-1 bg-base-100 py-1.5 pr-1 pl-4",
          selected && "bg-base-200",
        )}
      >
        <button
          type="button"
          aria-current={selected ? "true" : undefined}
          onClick={() => {
            // The lift at the end of a row swipe also reads as a press.
            if (!swipe.justSwipedRef.current) onSelect(term.id);
          }}
          className="min-h-14 min-w-0 flex-1 cursor-pointer py-1.5 text-start outline-none focus-visible:ring-2 focus-visible:ring-base-content"
        >
          <span className="block">
            <span
              className={cn(
                "font-heading text-[19px] leading-tight font-extrabold [overflow-wrap:anywhere]",
                known || markedKnown ? "text-ink-soft" : "text-base-content",
              )}
            >
              {term.term}
            </span>
            {known ? <StatusBadge kind="mastered" /> : null}
            {markedKnown && !known ? <StatusBadge kind="marked" /> : null}
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-muted">
            {term.definition}
          </span>
        </button>
        <QuickMarkKnownButton markedKnown={markedKnown} onPress={quickToggleMarkedKnown} />
        <NarrationButton termId={term.id} />
        <button
          type="button"
          aria-label={`Actions for ${term.term}`}
          onClick={() => onActions(term)}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted"
        >
          <MoreHorizontal className="size-5" strokeWidth={2.4} aria-hidden />
        </button>
      </article>
    </div>
  );
});
