import { Undo2 } from "lucide-react";
import type { MouseEvent } from "react";
import { IconButton, Pill } from "@/components/kit";

type TriageActionsProps = {
  canUndo: boolean;
  onUndo: () => void;
  onNotYet: () => void;
  onKnew: () => void;
};

/** A clicked or tapped button keeps focus, and a focused button owns Enter,
 *  so a later Enter would press it again instead of revealing the next card. */
function blurAfterPointer(event: MouseEvent<HTMLElement>) {
  if (event.detail > 0) event.currentTarget.blur();
}

const PRESS = "transition-transform duration-150 ease-out active:scale-[0.96]";
const CHOICE = `h-[60px] min-h-[60px] flex-1 text-base ${PRESS}`;

export function TriageActions({ canUndo, onUndo, onNotYet, onKnew }: TriageActionsProps) {
  return (
    <div data-tour="triage-actions" className="shrink-0 space-y-3">
      <div className="flex items-center gap-2.5">
        <IconButton
          label="Undo last choice"
          disabled={!canUndo}
          className={`h-[60px] w-[52px] disabled:opacity-40 ${PRESS}`}
          onClick={(event) => {
            blurAfterPointer(event);
            onUndo();
          }}
        >
          <Undo2 className="size-[22px]" strokeWidth={2.4} aria-hidden />
        </IconButton>
        <Pill
          variant="secondary"
          className={CHOICE}
          onClick={(event) => {
            blurAfterPointer(event);
            onNotYet();
          }}
        >
          Not yet
        </Pill>
        <Pill
          variant="secondary"
          className={`${CHOICE} bg-success text-success-content shadow-[0_10px_20px_-12px_rgb(var(--shadow-rgb)/0.5)]`}
          onClick={(event) => {
            blurAfterPointer(event);
            onKnew();
          }}
        >
          I know this
        </Pill>
      </div>

      <p className="m-0 hidden text-center text-xs font-semibold text-muted md:block coarse:hidden">
        <kbd className="kbd kbd-xs">Space</kbd> reveal · <kbd className="kbd kbd-xs">←</kbd> not yet
        · <kbd className="kbd kbd-xs">→</kbd> know it · <kbd className="kbd kbd-xs">Z</kbd> undo
      </p>
    </div>
  );
}
