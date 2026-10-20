"use client";

import { TopUpButton } from "@/components/ai-credits/top-up-button";
import { BottomSheet } from "@/components/kit";
import { refillLines } from "@/lib/ai-credits/explainer";
import { freeCreditsLine } from "@/lib/ai-credits/topup-copy";
import type { CreditSchedule, TopUpState } from "@/lib/ai-credits/types";
import { pluralize } from "@/lib/utils";

export type CreditsSummary = {
  remaining: number;
  /** What a story of the default length costs. */
  storyCredits: number;
  schedule: CreditSchedule | null;
  topUp: TopUpState;
};

export function TopUpSheet({
  isOpen,
  onOpenChange,
  credits,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  credits: CreditsSummary;
}) {
  const refills = refillLines(credits.schedule);
  const freeCredits = freeCreditsLine(credits.topUp);

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="AI credits"
      subline="Power AI quizzes and Stories."
    >
      <div className="flex flex-col gap-4 px-5 pt-3 pb-6">
        <p className="m-0 flex items-baseline gap-2">
          <span className="font-heading text-5xl leading-none font-extrabold tabular-nums">
            {credits.remaining}
          </span>
          <span className="text-base font-bold text-muted">
            {credits.remaining === 1 ? "credit" : "credits"} left
          </span>
        </p>
        <dl className="m-0 flex flex-col divide-y divide-base-300 rounded-2xl bg-base-200 px-3.5">
          <div className="flex justify-between gap-3 py-2.5 text-sm">
            <dt className="font-bold text-muted">A Story</dt>
            <dd className="m-0 font-extrabold">
              about {pluralize(credits.storyCredits, "credit")}
            </dd>
          </div>
          {refills.length > 0 ? (
            <div className="flex justify-between gap-3 py-2.5 text-sm">
              <dt className="font-bold text-muted">Refills</dt>
              <dd className="m-0 text-right font-extrabold">
                {refills.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="m-0 text-[13px] leading-snug font-semibold text-muted">
          {freeCredits ? `${freeCredits} ` : null}
          Simple quizzes, Read, Review and term audio never use credits. Story audio does.
        </p>
        {credits.topUp.available ? <TopUpButton size="lg" amount={credits.topUp.amount} /> : null}
      </div>
    </BottomSheet>
  );
}
