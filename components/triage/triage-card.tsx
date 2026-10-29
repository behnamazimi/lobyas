"use client";

import { Eye } from "lucide-react";
import { StudyCard } from "@/components/kit";
import { StudyTermBody } from "@/components/terms/study-term-body";
import { TermNarrationPlayer } from "@/components/terms/term-narration-player";
import { CLAMP_TWO_LINES, termTitleClass } from "@/lib/kit/text";
import type { ReviewTerm } from "@/lib/review/types";
import { cn } from "@/lib/utils";

type TriageCardProps = {
  term: ReviewTerm;
  revealed: boolean;
  narrationAccess: boolean;
  onReveal: () => void;
};

/** Both faces stay mounted and only one shows, so the narration clip is
 *  preloaded by the time the meaning is revealed. */
export function TriageCard({ term, revealed, narrationAccess, onReveal }: TriageCardProps) {
  return (
    <>
      <div
        className={cn("study-enter flex min-h-0 flex-1 flex-col", revealed && "hidden")}
        inert={revealed}
      >
        <StudyCard
          centered
          onPress={onReveal}
          pressLabel={`${term.term}. Tap to see the meaning.`}
          className="lg:max-h-[760px]"
        >
          <span
            lang={term.collectionLanguage}
            className={cn(
              "block max-w-full font-heading font-extrabold [overflow-wrap:break-word]",
              termTitleClass(term.term),
            )}
          >
            {term.term}
          </span>
          <span
            className={cn("mt-2 block max-w-full text-sm font-bold text-muted", CLAMP_TWO_LINES)}
          >
            {term.category ? `${term.collectionName} · ${term.category}` : term.collectionName}
          </span>
          <span className="mt-6 flex min-h-9 items-center gap-1.5 rounded-full bg-base-200 px-3.5 text-sm font-extrabold text-ink-soft">
            <Eye className="size-4 shrink-0" strokeWidth={2.6} aria-hidden />
            Tap to see the meaning
          </span>
        </StudyCard>
      </div>

      <div
        className={cn("study-reveal flex min-h-0 flex-1 flex-col", !revealed && "hidden")}
        inert={!revealed}
      >
        <StudyCard className="lg:max-h-[760px]">
          <div lang={term.collectionLanguage}>
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <h1
                  className={cn(
                    "m-0 font-heading font-extrabold [overflow-wrap:break-word]",
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
                  clipUrl={term.narrationUrl}
                  preload
                  look="pill"
                />
              ) : null}
            </div>
            <div className="mt-3.5">
              <StudyTermBody key={term.id} term={term} />
            </div>
          </div>
        </StudyCard>
      </div>
    </>
  );
}
