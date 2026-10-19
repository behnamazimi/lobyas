"use client";

import { Eye } from "lucide-react";
import { useRef, type Ref } from "react";
import { StudyCard } from "@/components/kit";
import { FirstExposureKnownPrompt } from "@/components/shared/first-exposure-known-prompt";
import { StudyTermBody } from "@/components/terms/study-term-body";
import {
  TermNarrationPlayer,
  type TermNarrationHandle,
} from "@/components/terms/term-narration-player";
import { CLAMP_TWO_LINES, termTitleClass } from "@/lib/kit/text";
import type { ReviewTerm } from "@/lib/review/types";
import { cn } from "@/lib/utils";
import { useReviewSwipe } from "./use-review-swipe";

type ReviewTermCardProps = {
  term: ReviewTerm;
  revealed: boolean;
  swipeEnabled: boolean;
  narrationAccess: boolean;
  narrationHandleRef?: Ref<TermNarrationHandle>;
  onReveal: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onMarkedKnown: () => void;
};

function RecallHint() {
  return (
    <span className="mt-6 flex min-h-9 items-center gap-1.5 rounded-full bg-read-tint px-3.5 text-sm font-extrabold text-read-text">
      <Eye className="size-4 shrink-0" strokeWidth={2.6} aria-hidden />
      <span className="inline md:hidden coarse:inline">Recall the meaning, then tap</span>
      <span className="hidden md:inline coarse:hidden">
        Recall the meaning, then click or press Enter
      </span>
    </span>
  );
}

/** Both faces stay mounted and only one shows, so the narration player is
 *  there at the moment of reveal and can start inside the press that reveals. */
export function ReviewTermCard({
  term,
  revealed,
  swipeEnabled,
  narrationAccess,
  narrationHandleRef,
  onReveal,
  onPrevious,
  onNext,
  onMarkedKnown,
}: ReviewTermCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const swipe = useReviewSwipe(cardRef, {
    onReveal,
    onPrevious,
    onNext,
    enabled: swipeEnabled,
  });

  return (
    <div
      ref={cardRef}
      data-tour="review-card"
      className="flex min-h-0 flex-1 flex-col gap-2"
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      <div className={cn("flex min-h-0 flex-1 flex-col", revealed && "hidden")} inert={revealed}>
        <StudyCard
          centered
          onPress={onReveal}
          pressLabel={`Recall the meaning, then reveal the answer for ${term.term}`}
          className="lg:max-h-[760px]"
        >
          <span
            lang={term.collectionLanguage}
            className={cn(
              "block max-w-full font-heading leading-[1.08] font-extrabold [overflow-wrap:anywhere]",
              termTitleClass(term.term),
            )}
          >
            {term.term}
          </span>
          {term.category ? (
            <span className="mt-2.5 block max-w-full truncate text-sm font-bold text-muted">
              {term.category}
            </span>
          ) : null}
          <RecallHint />
        </StudyCard>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col", !revealed && "hidden")} inert={!revealed}>
        <StudyCard className="lg:max-h-[760px]">
          <div lang={term.collectionLanguage}>
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <h1
                  className={cn(
                    "m-0 font-heading leading-[1.1] font-extrabold text-review-text [overflow-wrap:anywhere] hyphens-auto",
                    termTitleClass(term.term, "back"),
                  )}
                >
                  {term.term}
                </h1>
                {term.category ? (
                  <div
                    className={cn(
                      "mt-1 text-[13px] leading-snug font-bold text-muted",
                      CLAMP_TWO_LINES,
                    )}
                  >
                    {term.category}
                  </div>
                ) : null}
              </div>
              {narrationAccess ? (
                <TermNarrationPlayer
                  termId={term.id}
                  clipVersion={term.narrationVersion}
                  preload
                  look="pill"
                  handleRef={narrationHandleRef}
                />
              ) : null}
            </div>
            <div className="mt-3.5">
              <StudyTermBody key={term.id} term={term} />
            </div>
          </div>
        </StudyCard>
        {revealed && term.isNewToUser ? (
          <FirstExposureKnownPrompt
            termId={term.id}
            term={term.term}
            onMarkedKnown={onMarkedKnown}
            placement="foot"
          />
        ) : null}
      </div>
    </div>
  );
}
