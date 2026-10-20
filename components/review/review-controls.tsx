"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageBadge } from "@/components/illustrations/scenes/page-badge";
import type { MouseEvent, ReactNode } from "react";
import { IconButton, ModeLabel, Pill } from "@/components/kit";

/** A clicked or tapped button keeps focus, and a focused button owns Enter,
 *  so a later Enter would press it again instead of revealing the next card. */
function blurAfterPointer(event: MouseEvent<HTMLElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

const PRESS = "transition-transform duration-150 ease-out active:scale-[0.96]";

/** The row under the study bar: the Review label, moving between cards, options. */
export function ReviewControls({
  canGoBack,
  showForward,
  revealed,
  optionsControl,
  onPrevious,
  onNext,
}: {
  canGoBack: boolean;
  showForward: boolean;
  revealed: boolean;
  optionsControl: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <ModeLabel tone="review" icon={<PageBadge page="review" className="size-6" />}>
        Review
      </ModeLabel>
      <div className="ml-auto flex items-center">
        {canGoBack ? (
          <IconButton
            label="Previous term"
            className={PRESS}
            onClick={(event) => {
              blurAfterPointer(event);
              onPrevious();
            }}
          >
            <ChevronLeft className="size-5" strokeWidth={2.6} aria-hidden />
          </IconButton>
        ) : null}
        {showForward ? (
          <Pill
            variant="ghost"
            aria-label={revealed ? "Next term" : "Skip this term"}
            className={`gap-1 text-sm ${PRESS}`}
            onClick={(event) => {
              blurAfterPointer(event);
              onNext();
            }}
          >
            {revealed ? "Next" : "Skip"}
            <ChevronRight className="size-3.5" strokeWidth={3} aria-hidden />
          </Pill>
        ) : null}
        {optionsControl}
      </div>
    </div>
  );
}
