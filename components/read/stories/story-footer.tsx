"use client";

import { Check, RefreshCw, SlidersHorizontal, ThumbsDown, ThumbsUp } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton, Pill } from "@/components/kit";
import type { StorySession } from "@/components/read/stories/use-story-session";
import type { Story } from "@/lib/stories/types";
import { cn } from "@/lib/utils";

const PRESS_CLASS = "transition-transform duration-150 ease-out active:scale-[0.96]";
const ROUND = `bg-base-100 shadow-[0_1px_2px_rgb(var(--shadow-rgb)/0.08)] ${PRESS_CLASS}`;

function VoteButton({
  selected,
  label,
  onPress,
  children,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <IconButton
      label={label}
      aria-pressed={selected}
      onClick={onPress}
      className={cn(ROUND, selected && "bg-quiz-tint text-quiz-text")}
    >
      {children}
    </IconButton>
  );
}

export function StoryFooter({
  session,
  story,
  termCount,
}: {
  session: StorySession;
  story: Story;
  /** Terms that made it into the text, which Mark as read counts. */
  termCount: number;
}) {
  const isRead = Boolean(story.readAt);

  return (
    <footer className="flex shrink-0 items-center gap-1.5">
      <VoteButton
        selected={story.vote === 1}
        label="I liked this style"
        onPress={() => void session.vote(1)}
      >
        <ThumbsUp
          className={cn("size-[18px]", story.vote === 1 && "fill-current")}
          strokeWidth={2.2}
          aria-hidden
        />
      </VoteButton>
      <VoteButton
        selected={story.vote === -1}
        label="I didn't like this style"
        onPress={() => void session.vote(-1)}
      >
        <ThumbsDown
          className={cn("size-[18px]", story.vote === -1 && "fill-current")}
          strokeWidth={2.2}
          aria-hidden
        />
      </VoteButton>
      <IconButton label="Change setup" onClick={session.backToSetup} className={ROUND}>
        <SlidersHorizontal className="size-[18px]" strokeWidth={2.2} aria-hidden />
      </IconButton>
      {isRead ? (
        <>
          <span
            role="status"
            className="flex h-[52px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-success-tint px-3 text-[15px] font-extrabold text-success-text"
          >
            <Check className="size-4 shrink-0" aria-hidden strokeWidth={3} />
            <span className="truncate">
              Read · {termCount} {termCount === 1 ? "term" : "terms"} counted
            </span>
          </span>
          <Pill onClick={() => void session.generate()} className={cn("h-[52px]", PRESS_CLASS)}>
            New story
          </Pill>
        </>
      ) : (
        <>
          <IconButton label="New story" onClick={() => void session.generate()} className={ROUND}>
            <RefreshCw className="size-[18px]" strokeWidth={2.2} aria-hidden />
          </IconButton>
          <Pill
            onClick={() => void session.markRead()}
            disabled={session.isMarkingRead}
            className={cn("h-[52px] min-w-0 flex-1 text-base", PRESS_CLASS)}
          >
            Mark as read
          </Pill>
        </>
      )}
    </footer>
  );
}
