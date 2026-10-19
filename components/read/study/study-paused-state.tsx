"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EmptyPanel, ListRow, Pill } from "@/components/kit";
import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { useReviewToggle } from "@/hooks/use-review-toggle";
import type { PausedStudyCollection } from "@/lib/study/types";

const MAX_LISTED = 5;

/** Shown by Read, Review, Quiz and Stories when nothing is active. Users
 *  with no collections at all are redirected to the Library instead, so
 *  this is almost always "everything is paused" — resumable in place. */
export function StudyNoActiveCollectionsState({
  paused,
  activity,
}: {
  paused: PausedStudyCollection[];
  /** Completes "Resume one to start …", e.g. "reviewing". */
  activity: string;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const { setActiveForReview } = useReviewToggle();
  const [resumingId, setResumingId] = useState<string | null>(null);

  if (paused.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center py-6">
        <EmptyPanel
          illustration={<EmptyBoxScene className="w-full" />}
          title="No active collections"
          description={`Add a collection to your library to start ${activity}.`}
          actions={
            <Pill variant="secondary" href="/app/library">
              Go to library
            </Pill>
          }
        />
      </div>
    );
  }

  async function handleResume(collectionId: string) {
    setResumingId(collectionId);
    const ok = await setActiveForReview(collectionId, true);
    if (ok) {
      startRefresh(() => router.refresh());
    } else {
      setResumingId(null);
    }
  }

  const busy = resumingId !== null || isRefreshing;
  const hidden = paused.length - MAX_LISTED;

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
      <EmptyPanel
        illustration={<EmptyBoxScene className="w-full" />}
        title={
          paused.length === 1 ? "Your collection is paused" : "All your collections are paused"
        }
        description={`Resume one to start ${activity} again.`}
        actions={
          <div className="flex w-full flex-col gap-2">
            <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
              {paused.slice(0, MAX_LISTED).map((collection) => (
                <li key={collection.id}>
                  <ListRow
                    label={collection.name}
                    trailing={
                      <Pill
                        variant="soft"
                        disabled={busy}
                        onClick={() => void handleResume(collection.id)}
                      >
                        {resumingId === collection.id ? "Resuming…" : "Resume"}
                      </Pill>
                    }
                  />
                </li>
              ))}
            </ul>
            {hidden > 0 ? (
              <p className="m-0 text-xs font-semibold text-muted">
                {hidden} more paused in your library.
              </p>
            ) : null}
            <Pill variant="secondary" href="/app/library">
              Go to library
            </Pill>
          </div>
        }
      />
    </div>
  );
}
