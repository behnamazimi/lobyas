"use client";

import { useCallback, useRef, useState } from "react";
import { ReadCaughtUp } from "@/components/read/read-caught-up";
import { ReadErrorAlert } from "@/components/read/read-error-alert";
import { Skeleton } from "@/components/kit";
import { ReviewOptionsMenu } from "@/components/review/review-options-menu";
import { ReviewPlayingStep } from "@/components/review/review-playing-step";
import { useReviewGrading } from "@/components/review/use-review-grading";
import { useReviewKeyboard } from "@/components/review/use-review-keyboard";
import { useReviewOptions } from "@/components/review/use-review-options";
import { useReviewQueue } from "@/components/review/use-review-queue";
import { useReviewWriteQueue } from "@/components/review/use-review-write-queue";
import { StudyNoActiveCollectionsState } from "@/components/read/study/study-paused-state";
import type { TermNarrationHandle } from "@/components/terms/term-narration-player";
import { IDLE_WAKE_MS, useKeepAwakeAvailable, useWakeLock } from "@/hooks/use-wake-lock";
import type { ReviewOptions } from "@/lib/review/options";
import type { ReviewQueueSeed } from "@/lib/review/types";
import type { PausedStudyCollection, StudyCollection } from "@/lib/study/types";
import { LEARNING_STEP_MAX_RETRIES } from "@/lib/trace";

type ReviewPageProps = {
  seed: ReviewQueueSeed;
  collections: StudyCollection[];
  paused: PausedStudyCollection[];
  collectionId: string;
  narrationAccess: boolean;
  initialOptions: ReviewOptions;
};

function caughtUpDescription(collectionId: string, collections: StudyCollection[]) {
  const name = collections.find((collection) => collection.id === collectionId)?.name;
  if (!name) return "No terms in this collection. Pick another to keep reviewing.";
  return `No terms in ${name}. Pick another collection to keep reviewing.`;
}

export function ReviewPage({
  seed,
  collections,
  paused,
  collectionId,
  narrationAccess,
  initialOptions,
}: ReviewPageProps) {
  const { options, changeOption } = useReviewOptions(initialOptions);
  const keepAwakeAvailable = useKeepAwakeAvailable();
  useWakeLock(options.keepAwake && keepAwakeAvailable, {
    idleMs: IDLE_WAKE_MS,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queue = useReviewQueue({ collectionId, seed });
  const { enqueueRating } = useReviewWriteQueue({ setErrorMessage });
  const narrationRef = useRef<TermNarrationHandle>(null);

  const currentCard = queue.currentTerm;
  const { currentRevealed, currentRating, handleReveal, handleNext, handleRate } = useReviewGrading(
    {
      queue,
      enqueueRating,
      setErrorMessage,
      narrateOnReveal: options.narrateOnReveal,
      narrationAccess,
      narrationRef,
    },
  );

  const handlePrevious = useCallback(() => {
    queue.goPrevious();
  }, [queue.goPrevious]);

  const handleMarkedKnown = useCallback(() => {
    void queue.goNext();
  }, [queue.goNext]);

  useReviewKeyboard({
    onReveal: handleReveal,
    onGrade: handleRate,
    onPrevious: handlePrevious,
    onNext: handleNext,
    revealed: currentRevealed,
    rated: currentRating !== undefined,
    enabled: currentCard !== null,
  });

  if (collections.length === 0) {
    return <StudyNoActiveCollectionsState paused={paused} activity="reviewing" />;
  }

  const optionsControl = (
    <ReviewOptionsMenu
      options={options}
      narrationAccess={narrationAccess}
      onChange={(key, value) => void changeOption(key, value)}
    />
  );

  if (queue.status === "error" && !currentCard) {
    return (
      <ReadErrorAlert
        message={queue.errorMessage ?? "Couldn't load the next term. Try again."}
        isPending={queue.isFetchingMore}
        onRetry={queue.retry}
      />
    );
  }

  if (queue.status === "loading") {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col gap-3"
        role="status"
        aria-label="Finding terms to review"
      >
        <Skeleton shape="block" className="min-h-0 flex-1 rounded-[28px]" />
        <Skeleton className="h-[60px]" />
      </div>
    );
  }

  if (queue.status === "caughtUp" || !currentCard) {
    return (
      <ReadCaughtUp
        goal={{ tier: "review", collectionId }}
        title="No terms to review"
        description={caughtUpDescription(collectionId, collections)}
      />
    );
  }

  return (
    <ReviewPlayingStep
      currentCard={currentCard}
      canGoBack={queue.canGoBack}
      currentRevealed={currentRevealed}
      currentRating={currentRating}
      errorMessage={errorMessage ?? queue.errorMessage}
      narrationAccess={narrationAccess}
      swipeEnabled={options.swipe}
      showNextReview={options.showNextReview}
      willRetry={currentCard ? (currentCard.visit ?? 0) < LEARNING_STEP_MAX_RETRIES : false}
      optionsControl={optionsControl}
      narrationHandleRef={narrationRef}
      onReveal={handleReveal}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onMarkedKnown={handleMarkedKnown}
      onRate={handleRate}
    />
  );
}
