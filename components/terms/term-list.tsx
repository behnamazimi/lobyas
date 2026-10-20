"use client";

import { useCallback, useState } from "react";
import type { LibraryTerm } from "@/lib/terms/types";
import { EmptyTermsState } from "./empty-terms-state";
import { Card, EmptyPanel } from "@/components/kit";
import { TermRow } from "./term-row";

/** Rows rendered up front (also on the server); more follow as the list
 *  scrolls, so a long collection doesn't render and hydrate every row. */
const ROWS_PER_STEP = 50;
const GROW_MARGIN = "800px 0px";

type TermListProps = {
  terms: LibraryTerm[];
  /** Changes whenever the filters do, which starts the rows over from the first step. */
  windowKey: string;
  knownTerms: Set<string>;
  markedKnownTerms: Set<string>;
  selectedTermId: string | null;
  isOwner: boolean;
  /** Studyable terms in the collection, before filters. */
  totalCount: number;
  /** The owner has terms that are saved but not finished yet. */
  hasUnfinished: boolean;
  collectionId: string;
  onSelect: (termId: string) => void;
  onToggleMarkedKnown: (termId: string) => Promise<boolean>;
  onActions: (term: LibraryTerm) => void;
};

function EmptyMessage({ title, detail }: { title: string; detail?: string }) {
  return (
    <Card radius="md" className="py-10">
      <EmptyPanel titleAs="h2" title={title} description={detail} />
    </Card>
  );
}

export function TermList({ windowKey, totalCount, hasUnfinished, ...props }: TermListProps) {
  if (totalCount === 0 && hasUnfinished) {
    return <EmptyMessage title="Nothing to study yet" detail="Add a definition to start." />;
  }

  if (totalCount === 0) {
    return props.isOwner ? (
      <EmptyTermsState collectionId={props.collectionId} />
    ) : (
      <EmptyMessage title="No terms yet" detail="Nothing has been added to this collection." />
    );
  }

  if (props.terms.length === 0) {
    return (
      <EmptyMessage
        title="No terms match"
        detail="Clear your search or category filters, or turn off “Hide terms I know”."
      />
    );
  }

  return <TermRows windowKey={windowKey} {...props} />;
}

function TermRows({
  terms,
  knownTerms,
  markedKnownTerms,
  selectedTermId,
  onSelect,
  onToggleMarkedKnown,
  onActions,
  windowKey,
}: Omit<TermListProps, "totalCount" | "hasUnfinished" | "collectionId" | "isOwner">) {
  // Back to the first rows whenever the filters change. Adjusted during
  // render rather than by remounting, so rows still on screen keep their state.
  const [rowWindow, setRowWindow] = useState({ key: windowKey, limit: ROWS_PER_STEP });
  if (rowWindow.key !== windowKey) setRowWindow({ key: windowKey, limit: ROWS_PER_STEP });
  const limit = rowWindow.key === windowKey ? rowWindow.limit : ROWS_PER_STEP;

  const watchEnd = useCallback((sentinel: HTMLDivElement | null) => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRowWindow((current) => ({ ...current, limit: current.limit + ROWS_PER_STEP }));
        }
      },
      { rootMargin: GROW_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <Card radius="md" className="divide-y divide-base-300 overflow-hidden">
      {terms.slice(0, limit).map((term) => (
        <div key={term.id} className="content-visibility-auto [contain-intrinsic-size:auto_4.5rem]">
          <TermRow
            term={term}
            known={knownTerms.has(term.id)}
            markedKnown={markedKnownTerms.has(term.id)}
            selected={selectedTermId === term.id}
            onSelect={onSelect}
            onToggleMarkedKnown={onToggleMarkedKnown}
            onActions={onActions}
          />
        </div>
      ))}
      {/* Keyed by the limit so it is observed afresh after each step, even
          when it is still inside the margin. */}
      {limit < terms.length ? (
        <div key={limit} ref={watchEnd} aria-hidden className="h-px" />
      ) : null}
    </Card>
  );
}
