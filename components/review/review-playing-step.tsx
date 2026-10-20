import type { ReactNode, Ref } from "react";
import { FeedbackNote, GradeTiles, Pill } from "@/components/kit";
import { GoalMetNote } from "@/components/goals/goal-met-note";
import { ReviewControls } from "@/components/review/review-controls";
import { ReviewTermCard } from "@/components/review/review-term-card";
import type { TermNarrationHandle } from "@/components/terms/term-narration-player";
import { canMoveForward } from "@/lib/review/keyboard";
import {
  gradeTileLabels,
  KIT_GRADE_OF,
  nextReviewDays,
  REVIEW_GRADE_OF,
} from "@/lib/review/next-review";
import { cardKey } from "@/lib/review/retry";
import type { ReviewRating, ReviewTerm } from "@/lib/review/types";
import type { ReviewGrade } from "@/lib/trace";
import { cn } from "@/lib/utils";

type ReviewPlayingStepProps = {
  currentCard: ReviewTerm;
  canGoBack: boolean;
  currentRevealed: boolean;
  currentRating: ReviewRating | undefined;
  errorMessage: string | null;
  narrationAccess: boolean;
  swipeEnabled: boolean;
  showNextReview: boolean;
  /** A miss on this card is asked again this session. */
  willRetry: boolean;
  optionsControl: ReactNode;
  narrationHandleRef: Ref<TermNarrationHandle>;
  onReveal: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onMarkedKnown: () => void;
  onRate: (grade: ReviewGrade) => void;
};

export function ReviewPlayingStep({
  currentCard,
  canGoBack,
  currentRevealed,
  currentRating,
  errorMessage,
  narrationAccess,
  swipeEnabled,
  showNextReview,
  willRetry,
  optionsControl,
  narrationHandleRef,
  onReveal,
  onPrevious,
  onNext,
  onMarkedKnown,
  onRate,
}: ReviewPlayingStepProps) {
  const rated = currentRating !== undefined;
  const showForward = canMoveForward({ revealed: currentRevealed, rated });
  // Worked out on every render, so it is current when the card is revealed.
  const nextReview =
    showNextReview && currentCard.recall ? nextReviewDays(currentCard.recall, new Date()) : null;
  const labels = nextReview ? gradeTileLabels(nextReview, willRetry) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ReviewControls
        canGoBack={canGoBack}
        showForward={showForward}
        revealed={currentRevealed}
        optionsControl={optionsControl}
        onPrevious={onPrevious}
        onNext={onNext}
      />
      <GoalMetNote tier="review" />

      <ReviewTermCard
        key={cardKey(currentCard)}
        term={currentCard}
        revealed={currentRevealed}
        swipeEnabled={swipeEnabled}
        canGoBack={canGoBack}
        canGoForward={showForward}
        narrationAccess={narrationAccess}
        narrationHandleRef={narrationHandleRef}
        onReveal={onReveal}
        onPrevious={onPrevious}
        onNext={onNext}
        onMarkedKnown={onMarkedKnown}
      />

      {errorMessage ? (
        <FeedbackNote kind="wrong" title="Couldn't save">
          {errorMessage}
        </FeedbackNote>
      ) : null}

      <div className={cn("flex flex-col justify-end", labels && "min-h-[76px]")}>
        {currentRevealed ? (
          <div data-tour="review-grades">
            <GradeTiles
              className="study-stagger"
              intervals={labels?.intervals}
              ariaLabels={labels?.ariaLabels}
              selected={currentRating ? KIT_GRADE_OF[currentRating.grade] : undefined}
              onGrade={(grade) => onRate(REVIEW_GRADE_OF[grade])}
            />
          </div>
        ) : (
          <Pill
            size="lg"
            onClick={onReveal}
            className="transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            Show answer
          </Pill>
        )}
      </div>

      <ReviewKeyboardHints revealed={currentRevealed} rated={rated} />
    </div>
  );
}

function ReviewKeyboardHints({ revealed, rated }: { revealed: boolean; rated: boolean }) {
  return (
    <p className="m-0 hidden text-center text-xs font-semibold text-muted md:block coarse:hidden">
      {revealed ? (
        <>
          <kbd className="kbd kbd-xs">1</kbd>–<kbd className="kbd kbd-xs">4</kbd> grade ·{" "}
          <kbd className="kbd kbd-xs">←</kbd> back
          {rated ? (
            <>
              {" · "}
              <kbd className="kbd kbd-xs">→</kbd> next
            </>
          ) : null}
        </>
      ) : (
        <>
          <kbd className="kbd kbd-xs">Space</kbd> reveal · <kbd className="kbd kbd-xs">→</kbd> skip
          · <kbd className="kbd kbd-xs">←</kbd> back
        </>
      )}
    </p>
  );
}
