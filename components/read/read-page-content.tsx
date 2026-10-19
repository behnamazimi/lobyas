"use client";

import { ReadCaughtUp } from "@/components/read/read-caught-up";
import { ReadErrorAlert } from "@/components/read/read-error-alert";
import { ReadTermCard } from "@/components/read/read-term-card";
import { caughtUpDescription } from "@/components/read/read-page-helpers";
import type { ReadQueue } from "@/components/read/use-read-queue";
import type { StudyCollection } from "@/lib/study/types";

export function ReadQueueContent({
  queue,
  term,
  revealed,
  collections,
  selectedCollectionId,
  narrationAccess,
  hideQuestion,
}: {
  queue: ReadQueue;
  term: ReadQueue["currentTerm"];
  revealed: boolean;
  collections: StudyCollection[];
  selectedCollectionId: string;
  narrationAccess: boolean;
  hideQuestion: boolean;
}) {
  if (queue.status === "caughtUp") {
    return (
      <ReadCaughtUp
        goal={{ tier: "read", collectionId: selectedCollectionId }}
        description={caughtUpDescription(selectedCollectionId, collections)}
      />
    );
  }

  if (queue.status === "ready" && term !== null) {
    return (
      <ReadTermCard
        term={term}
        revealed={revealed}
        canGoBack={queue.canGoBack}
        isPending={queue.isFetchingMore}
        narrationAccess={narrationAccess}
        hideQuestion={hideQuestion}
        onReveal={queue.reveal}
        onPrevious={queue.goPrevious}
        onNext={queue.goNext}
      />
    );
  }

  if (queue.status === "error") {
    return (
      <ReadErrorAlert
        message={queue.errorMessage ?? "Couldn't load the next term. Try again."}
        isPending={queue.isFetchingMore}
        onRetry={queue.retry}
      />
    );
  }

  return null;
}
