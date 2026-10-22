"use client";

import { useShell } from "@/components/app/shell/shell-context";
import { TopUpButton } from "@/components/ai-credits/top-up-button";
import { Pill, SectionCard } from "@/components/kit";
import { PieceLengthField } from "@/components/read/stories/story-setup-fields";
import {
  StoryCreditGate,
  StoryFooterHint,
  StoryNoAiNotice,
} from "@/components/read/stories/story-setup-notices";
import type { StorySession } from "@/components/read/stories/use-story-session";
import { creditGate, isExhausted } from "@/lib/ai-credits/gate";
import { aiAvailable, type AiAccessView } from "@/lib/llm/types";
import { storyCreditUse } from "@/lib/stories/credit-fit";
import type { StoryCollection } from "@/lib/stories/setup";
import {
  CEFR_LEVELS,
  STORY_MIN_TERMS,
  STORY_OUTLINE_MAX,
  type CefrLevel,
} from "@/lib/stories/types";

const CEFR_HINTS: Record<CefrLevel, string> = {
  A1: "A1 · very short, basic sentences",
  A2: "A2 · simple sentences",
  B1: "B1 · clear, common words",
  B2: "B2 · varied, everyday fluent",
  C1: "C1 · complex and idiomatic",
  C2: "C2 · native-level nuance",
};

const FIELD = "w-full rounded-[14px] border-0 bg-base-200 text-[15px] font-bold";

export function StorySetupPanel({
  session,
  collections,
  ai,
}: {
  session: StorySession;
  collections: StoryCollection[];
  ai: AiAccessView;
}) {
  const { current } = useShell();
  const selected = collections.find((collection) => collection.id === session.collectionId);
  const eligibleCount = selected?.eligibleCount ?? 0;
  const use = storyCreditUse(ai, session.pieceLength, eligibleCount);
  const hasEnoughTerms = eligibleCount >= STORY_MIN_TERMS;
  const canGenerate = aiAvailable(ai) && hasEnoughTerms && !use.overBalance;
  const creditsBlock = isExhausted(ai) || (hasEnoughTerms && use.overBalance);
  const gate = creditsBlock ? creditGate(ai.topUp) : null;
  const fallsBack = current !== null && selected !== undefined && current.id !== selected.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-4 md:pb-6">
      <div>
        <h1 className="m-0 font-heading text-[30px] leading-[1.1] font-extrabold">
          Set up your story
        </h1>
        <p className="mt-1.5 mb-0 text-[15px] leading-snug font-semibold text-muted">
          A short piece built around the next terms in your Read queue. Mark it read to count a read
          for every term in it.
        </p>
      </div>

      <StoryNoAiNotice ai={ai} />

      <SectionCard className="flex flex-col gap-3.5">
        <div>
          <div className="text-sm font-extrabold">Collection</div>
          <div className="mt-1.5 flex min-h-12 items-center rounded-[14px] bg-base-200 px-3.5 text-[15px] font-bold [overflow-wrap:anywhere]">
            {selected ? `${selected.name} · ${eligibleCount} to read` : "No collection"}
          </div>
          {fallsBack ? (
            <p className="mt-1.5 mb-0 text-[13px] font-semibold text-muted">
              {current.name} doesn&apos;t have enough terms to read yet, so this story uses{" "}
              {selected.name}.
            </p>
          ) : null}
        </div>

        <div data-tour="stories-level">
          <label htmlFor="story-cefr" className="text-sm font-extrabold">
            Sentence difficulty
          </label>
          <select
            id="story-cefr"
            value={session.cefrLevel}
            onChange={(event) => session.setCefrLevel(event.target.value as CefrLevel)}
            className={`select mt-1.5 h-12 ${FIELD}`}
          >
            {CEFR_LEVELS.map((level) => (
              <option key={level} value={level}>
                {CEFR_HINTS[level]}
              </option>
            ))}
          </select>
        </div>

        <PieceLengthField value={session.pieceLength} onChange={session.setPieceLength} />

        <div>
          <label htmlFor="story-outline" className="text-sm font-extrabold">
            Outline (optional)
          </label>
          <textarea
            id="story-outline"
            rows={2}
            value={session.outline}
            maxLength={STORY_OUTLINE_MAX}
            onChange={(event) => session.setOutline(event.target.value)}
            placeholder="e.g. A late-night outage at a small startup"
            className={`textarea mt-1.5 min-h-16 resize-none px-3.5 py-3 ${FIELD}`}
          />
          <div className="mt-1.5 flex justify-between gap-2 text-[13px] font-semibold text-muted">
            <span>Sets the topic. Terms still come from your queue.</span>
            <span className="tabular-nums">
              {session.outline.length}/{STORY_OUTLINE_MAX}
            </span>
          </div>
        </div>
      </SectionCard>

      {creditsBlock ? (
        <StoryCreditGate
          ai={ai}
          use={use}
          pieceLength={session.pieceLength}
          eligibleCount={eligibleCount}
          onFit={session.setPieceLength}
        />
      ) : null}
      <p className="m-0 text-center text-sm font-bold text-muted empty:hidden">
        <StoryFooterHint use={use} hasEnoughTerms={hasEnoughTerms} />
      </p>
      {gate?.kind === "top-up" ? (
        <TopUpButton size="lg" amount={gate.amount} />
      ) : (
        <Pill
          size="lg"
          data-tour="stories-write"
          onClick={() => void session.generate()}
          disabled={!canGenerate}
        >
          Write a story
        </Pill>
      )}
    </div>
  );
}
