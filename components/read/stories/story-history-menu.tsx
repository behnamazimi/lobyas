"use client";

import { Check, ChevronRight, History, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { listStoryHistoryAction } from "@/app/(private)/app/read/stories/actions";
import { BottomSheet, IconButton } from "@/components/kit";
import { storyMetaLabels } from "@/lib/stories/meta";
import type { StorySummary } from "@/lib/stories/types";
import { cn } from "@/lib/utils";

type HistoryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; stories: StorySummary[] };

function storyHref(storyId: string, collection: string | null): string {
  const params = new URLSearchParams({ story: storyId });
  if (collection) params.set("collection", collection);
  return `/app/read/stories?${params.toString()}`;
}

function VoteIcon({ vote }: { vote: StorySummary["vote"] }) {
  if (vote === 1) {
    return <ThumbsUp className="size-4 text-quiz-text" aria-label="Liked" strokeWidth={2.2} />;
  }
  if (vote === -1) {
    return <ThumbsDown className="size-4 text-muted" aria-label="Disliked" strokeWidth={2.2} />;
  }
  return null;
}

function HistoryRow({
  story,
  href,
  isCurrent,
  onOpen,
}: {
  story: StorySummary;
  href: string;
  isCurrent: boolean;
  onOpen: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onOpen}
        aria-current={isCurrent ? "true" : undefined}
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-2xl px-2 py-2.5 text-base-content no-underline",
          isCurrent && "bg-base-200",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-extrabold">{story.title}</span>
          <span className="block text-[13px] font-semibold text-muted">
            {storyMetaLabels(story).join(" · ")}
            {story.readAt ? (
              <span className="ms-1.5 inline-flex items-center gap-0.5 rounded-full bg-success-tint px-1.5 text-xs font-extrabold text-success-text">
                <Check className="size-3" aria-hidden strokeWidth={3} />
                Read
              </span>
            ) : null}
          </span>
        </span>
        <VoteIcon vote={story.vote} />
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden strokeWidth={2.4} />
      </Link>
    </li>
  );
}

function HistoryList({
  state,
  currentStoryId,
  collection,
  onOpen,
}: {
  state: HistoryState;
  currentStoryId: string | null;
  collection: string | null;
  onOpen: () => void;
}) {
  if (state.status === "loading") {
    return (
      <div className="flex justify-center py-6">
        <span className="loading loading-spinner loading-sm text-muted" role="status" />
      </div>
    );
  }
  if (state.status === "error") {
    return <p className="m-0 py-4 text-sm font-bold text-wrong-text">{state.message}</p>;
  }
  if (state.stories.length === 0) {
    return <p className="m-0 py-4 text-sm font-semibold text-muted">No stories yet.</p>;
  }
  return (
    <ul className="m-0 list-none p-0">
      {state.stories.map((story) => (
        <HistoryRow
          key={story.id}
          story={story}
          href={storyHref(story.id, collection)}
          isCurrent={story.id === currentStoryId}
          onOpen={onOpen}
        />
      ))}
    </ul>
  );
}

/** Lists the latest stories next to the Read options button, on the Stories
 *  tab only. A bottom sheet on phone, a dialog on desktop. */
export function StoryHistoryMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<HistoryState>({ status: "loading" });

  if (!pathname.startsWith("/app/read/stories")) return null;

  const collection = searchParams.get("collection");
  const currentStoryId = searchParams.get("story");

  async function load() {
    setState({ status: "loading" });
    const result = await listStoryHistoryAction();
    setState(
      "error" in result
        ? { status: "error", message: result.error }
        : { status: "ready", stories: result.stories },
    );
  }

  function changeOpen(next: boolean) {
    setOpen(next);
    if (next) void load();
  }

  return (
    <>
      <IconButton label="Story history" onClick={() => changeOpen(true)}>
        <History className="size-[22px]" strokeWidth={2.2} aria-hidden />
      </IconButton>
      <BottomSheet isOpen={open} onOpenChange={changeOpen} title="Recent stories">
        <HistoryList
          state={state}
          currentStoryId={currentStoryId}
          collection={collection}
          onOpen={() => setOpen(false)}
        />
      </BottomSheet>
    </>
  );
}
