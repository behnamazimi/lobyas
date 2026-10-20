"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, type Ref } from "react";
import type { StoryPlayerHandle } from "@/components/read/stories/story-audio-controls";
import { StoryFooter } from "@/components/read/stories/story-footer";
import { StoryMarkKnown } from "@/components/read/stories/story-mark-known";
import { StoryTermSheet } from "@/components/read/stories/story-term-popover";
import { StoryShadowingToggle } from "@/components/read/stories/story-shadowing-toggle";
import type { AiAccessView } from "@/lib/llm/types";
import type { TopUpState } from "@/lib/ai-credits/types";
import { narrationPrice, type NarrationPrice } from "@/lib/stories/narration-price";
import { StoryNarrationPlayer } from "@/components/read/stories/story-narration-player";
import { StoryBody } from "@/components/read/stories/story-body";
import { useNarrationAutoScroll } from "@/components/read/stories/use-narration-auto-scroll";
import {
  PLAIN_PLAYBACK,
  type ShadowingSetup,
} from "@/components/read/stories/use-shadowing-playback";
import type { StorySession } from "@/components/read/stories/use-story-session";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { buildTimeline, sentenceAtFraction } from "@/lib/stories/highlight";
import { storyMetaLabels } from "@/lib/stories/meta";
import type { ShadowingSettings } from "@/lib/stories/shadowing";
import { snapTimeline } from "@/lib/stories/pause-alignment";
import type { ClipPauses } from "@/lib/stories/silence";
import type { Story, StoryTerm } from "@/lib/stories/types";

/** Each term's first wording in the piece, in reading order. */
function firstOccurrences(story: Story): Map<string, string> {
  const occurrences = new Map<string, string>();
  for (const segment of story.segments) {
    if (segment.termId && !occurrences.has(segment.termId)) {
      occurrences.set(segment.termId, segment.text);
    }
  }
  return occurrences;
}

/** Opens the term already revealed without recording a read: marking the
 *  story read is what credits its terms. */
function termHref(termId: string, story: Story): string {
  const params = new URLSearchParams({ termId, alreadyRead: "true" });
  if (story.collectionId) params.set("collection", story.collectionId);
  return `/app/read?${params.toString()}`;
}

function StoryHeader({
  story,
  narrationAccess,
  onNarrationProgress,
  shadowing,
  sentencePlayback,
  playerRef,
  onClipPauses,
  price,
  topUp,
}: {
  story: Story;
  narrationAccess: boolean;
  price: NarrationPrice | null;
  topUp: TopUpState | undefined;
  onNarrationProgress?: (fraction: number | null) => void;
  shadowing: ShadowingSetup | null;
  sentencePlayback: ShadowingSetup | null;
  playerRef: Ref<StoryPlayerHandle>;
  onClipPauses?: (clip: ClipPauses) => void;
}) {
  const meta = storyMetaLabels(story);

  return (
    <header className="relative shrink-0 border-b border-base-300 px-[18px] pt-[18px] pb-3.5">
      <h1 className="m-0 min-w-0 pe-12 font-heading text-[25px] leading-[1.1] font-extrabold text-balance [overflow-wrap:anywhere]">
        {story.title}
      </h1>
      {narrationAccess ? <StoryShadowingToggle on={shadowing !== null} /> : null}
      <p className="mt-1 mb-0 text-[13px] font-bold text-muted">{meta.join(" · ")}</p>
      {story.outline ? (
        <p className="mt-1 mb-0 line-clamp-2 text-[13px] font-semibold text-muted">
          Outline: {story.outline}
        </p>
      ) : null}
      {narrationAccess ? (
        <div className="pt-3">
          <StoryNarrationPlayer
            key={story.id}
            storyId={story.id}
            onProgress={onNarrationProgress}
            shadowing={shadowing}
            sentencePlayback={sentencePlayback}
            handleRef={playerRef}
            onClipPauses={onClipPauses}
            price={price}
            topUp={topUp}
          />
        </div>
      ) : null}
    </header>
  );
}

function StoryGlossary({ story, termById }: { story: Story; termById: Map<string, StoryTerm> }) {
  const occurrences = [...firstOccurrences(story)];

  return (
    <Collapsible className="group border-t border-base-300 pt-1">
      <CollapsibleTrigger className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] cursor-pointer items-center justify-between gap-3 rounded-field border-none bg-transparent px-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span className="text-sm font-extrabold">Terms in this piece ({occurrences.length})</span>
        <ChevronDown
          className="size-4 shrink-0 text-base-content/70 transition-transform duration-200 group-data-[expanded]:rotate-180"
          aria-hidden
          strokeWidth={1.5}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="m-0 list-none divide-y divide-base-300 p-0">
          {occurrences.map(([termId, surface]) => {
            const term = termById.get(termId);
            if (!term) {
              return (
                <li key={termId} className="py-3 text-sm text-base-content/70">
                  <span className="font-medium">{surface}</span> · No longer available
                </li>
              );
            }
            return (
              <li key={termId} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="m-0 min-w-0 font-heading text-lg font-extrabold">{term.term}</p>
                  <div className="-me-1.5 flex shrink-0 items-center gap-1">
                    <StoryMarkKnown termId={termId} term={term.term} />
                    <Link
                      href={termHref(termId, story)}
                      aria-label={`Open ${term.term}`}
                      className="btn btn-ghost btn-square btn-xs size-11 text-base-content/70 md:size-8"
                    >
                      <ArrowUpRight className="size-4" aria-hidden strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
                <p className="m-0 text-sm font-semibold text-muted">{term.definition}</p>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function StoryReader({
  session,
  story,
  terms,
  narrationAccess,
  narrationHighlight,
  tapToPlay,
  shadowingSettings,
  ai,
  narrationReady,
}: {
  session: StorySession;
  story: Story;
  terms: StoryTerm[];
  narrationAccess: boolean;
  narrationHighlight: boolean;
  tapToPlay: boolean;
  /** Set while Shadowing is on. It needs the highlight, so it turns that on. */
  shadowingSettings: ShadowingSettings | null;
  /** Who pays for AI, to price the first listen. */
  ai: AiAccessView;
  /** The clip already exists, so listening is free and no price is shown. */
  narrationReady: boolean;
}) {
  const termById = new Map(terms.map((term) => [term.id, term]));
  const estimatedTimeline = useMemo(
    () =>
      narrationAccess && (narrationHighlight || shadowingSettings || tapToPlay)
        ? buildTimeline(story.title, story.segments, story.language)
        : null,
    [narrationAccess, narrationHighlight, shadowingSettings, tapToPlay, story],
  );
  // Once the clip has been measured, sentences move onto its real pauses.
  const [clipPauses, setClipPauses] = useState<ClipPauses | null>(null);
  const timeline = useMemo(
    () =>
      estimatedTimeline && clipPauses
        ? snapTimeline(estimatedTimeline, clipPauses.pauses, clipPauses.duration)
        : estimatedTimeline,
    [estimatedTimeline, clipPauses],
  );
  const shadowing = useMemo<ShadowingSetup | null>(
    () => (timeline && shadowingSettings ? { timeline, settings: shadowingSettings } : null),
    [timeline, shadowingSettings],
  );
  const showHighlight = narrationHighlight || shadowingSettings !== null;
  const sentencePlayback = useMemo<ShadowingSetup | null>(
    () =>
      timeline && (shadowingSettings || tapToPlay)
        ? { timeline, settings: shadowingSettings ?? PLAIN_PLAYBACK }
        : null,
    [timeline, shadowingSettings, tapToPlay],
  );
  const playerRef = useRef<StoryPlayerHandle | null>(null);
  const [activeSentence, setActiveSentence] = useState<number | null>(null);
  const [openTerm, setOpenTerm] = useState<StoryTerm | null>(null);
  const { pause: pauseAutoScroll, followAgain, keepInView } = useNarrationAutoScroll();

  // Without a timeline there are no sentences, so one picked before the
  // timeline went away doesn't come back when it returns.
  if (!timeline && activeSentence !== null) setActiveSentence(null);

  function showNarrationProgress(fraction: number | null) {
    if (!timeline) return;
    setActiveSentence(fraction === null ? null : sentenceAtFraction(timeline, fraction));
  }

  function pressSentence(index: number) {
    followAgain();
    playerRef.current?.pressSentence(index);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-base-100 shadow-card lg:max-h-[760px]">
        <StoryHeader
          story={story}
          narrationAccess={narrationAccess}
          onNarrationProgress={timeline ? showNarrationProgress : undefined}
          shadowing={shadowing}
          sentencePlayback={sentencePlayback}
          playerRef={playerRef}
          onClipPauses={timeline ? setClipPauses : undefined}
          price={narrationReady ? null : narrationPrice(ai, story)}
          topUp={ai.topUp}
        />
        <div
          onWheel={pauseAutoScroll}
          onTouchMove={pauseAutoScroll}
          onKeyDown={pauseAutoScroll}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-[18px] pt-3.5 pb-2"
        >
          <StoryBody
            story={story}
            termById={termById}
            timeline={timeline}
            activeSentence={showHighlight ? activeSentence : null}
            keepInView={keepInView}
            onSentencePress={tapToPlay && sentencePlayback ? pressSentence : undefined}
            onTermPress={setOpenTerm}
          />
          <StoryGlossary story={story} termById={termById} />
        </div>
      </article>
      <StoryFooter session={session} story={story} termCount={firstOccurrences(story).size} />
      <StoryTermSheet
        term={openTerm}
        href={openTerm ? termHref(openTerm.id, story) : ""}
        onClose={() => setOpenTerm(null)}
      />
    </div>
  );
}
