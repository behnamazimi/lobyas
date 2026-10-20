"use client";

import { useRef } from "react";
import { Layers } from "lucide-react";
import { ReadCaughtUp } from "@/components/read/read-caught-up";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { Collection, Term } from "@/lib/terms/types";
import { toTriageTerm } from "@/lib/triage/deck";
import { TriageActions } from "./triage-actions";
import { TriageNextSteps, TriageSummary } from "./triage-summary";
import { type TriageCardHandle, TriageSwipeCard } from "./triage-swipe-card";
import { useTriageDeck } from "./use-triage-deck";
import { useTriageKeyboard } from "./use-triage-keyboard";

type TriagePageProps = {
  collection: Collection;
  terms: Term[];
  knownTermIds: string[];
  markedKnownTermIds: string[];
  notYetTermIds: string[];
  narrationAccess: boolean;
};

export function TriagePage({
  collection,
  terms,
  knownTermIds,
  markedKnownTermIds,
  notYetTermIds,
  narrationAccess,
}: TriagePageProps) {
  const reduceMotion = usePrefersReducedMotion();
  const {
    deck,
    current,
    revealed,
    reveal,
    history,
    knownIds,
    markedKnown,
    notYetIds,
    knew: handleKnew,
    notYet: handleNotYet,
    undo: handleUndo,
    revisitNotYet: handleRevisitNotYet,
  } = useTriageDeck({
    collectionId: collection.id,
    terms,
    knownTermIds,
    markedKnownTermIds,
    notYetTermIds,
  });

  const cardRef = useRef<TriageCardHandle>(null);

  // Buttons and keys play the same fly-out as a swipe; the card calls back
  // into handleKnew/handleNotYet when it's gone.
  function flyOut(direction: 1 | -1) {
    if (cardRef.current) cardRef.current.flyOut(direction);
    else if (current) (direction === 1 ? handleKnew : handleNotYet)(current.id);
  }

  useTriageKeyboard({
    onReveal: reveal,
    onKnew: () => flyOut(1),
    onNotYet: () => flyOut(-1),
    onUndo: handleUndo,
    revealed,
    enabled: current !== null,
  });

  const knownCount = terms.filter((t) => knownIds.has(t.id) || markedKnown.has(t.id)).length;

  const topRow = (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-full bg-success-tint pr-3 pl-2.5 text-[13px] font-extrabold text-success-text">
        <Layers className="size-4" strokeWidth={2.4} aria-hidden />
        Triage
      </div>
      <p className="m-0 min-w-0 truncate text-[13px] font-bold text-muted">
        Sort what you already know
      </p>
      {current ? (
        <p className="m-0 ml-auto shrink-0 text-end text-[13px] leading-tight font-bold text-muted tabular-nums">
          <span className="font-extrabold text-base-content">{deck.length}</span> left to sort
          <br />
          {knownCount} known
        </p>
      ) : null}
    </div>
  );

  if (!current) {
    const markedCount = history.filter(
      (choice) => choice.kind === "knew" && markedKnown.has(choice.termId),
    ).length;
    const leftToLearnCount = terms.filter(
      (t) => !knownIds.has(t.id) && !markedKnown.has(t.id),
    ).length;

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {topRow}
        {history.length > 0 ? (
          <TriageSummary
            collectionId={collection.id}
            collectionName={collection.name}
            markedCount={markedCount}
            leftToLearnCount={leftToLearnCount}
            hasNotYet={notYetIds.size > 0}
            onRevisitNotYet={handleRevisitNotYet}
          />
        ) : (
          <ReadCaughtUp
            title="All terms sorted"
            description={
              notYetIds.size > 0
                ? `You've sorted every term in ${collection.name}. The ones you set aside as "Not yet" stay in your learning pile.`
                : `Every term in ${collection.name} is already mastered or marked known.`
            }
            actions={
              <TriageNextSteps
                collectionId={collection.id}
                hasNotYet={notYetIds.size > 0}
                onRevisitNotYet={handleRevisitNotYet}
              />
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {topRow}

      <TriageSwipeCard
        key={current.id}
        ref={cardRef}
        term={toTriageTerm(current, collection)}
        revealed={revealed}
        reduceMotion={reduceMotion}
        narrationAccess={narrationAccess}
        onReveal={reveal}
        onKnew={() => handleKnew(current.id)}
        onNotYet={() => handleNotYet(current.id)}
      />

      <TriageActions
        canUndo={history.length > 0}
        onUndo={handleUndo}
        onNotYet={() => flyOut(-1)}
        onKnew={() => flyOut(1)}
      />
    </div>
  );
}
