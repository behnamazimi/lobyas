import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type AnswerInputState = "default" | "correct" | "wrong" | "skipped";

const RING: Record<AnswerInputState, string> = {
  default:
    "shadow-[inset_0_0_0_2px_var(--color-line)] focus:shadow-[inset_0_0_0_2.5px_var(--color-quiz-ring)]",
  correct: "shadow-[inset_0_0_0_2.5px_var(--color-mastered)]",
  wrong: "shadow-[inset_0_0_0_2.5px_var(--color-wrong)]",
  skipped: "shadow-[inset_0_0_0_2.5px_var(--color-read)]",
};

/** The typed answer field: 58 px, ringed purple while typing and green, coral or blue once checked. */
export function AnswerInput({
  state = "default",
  className,
  ...rest
}: { state?: AnswerInputState } & ComponentProps<"input">) {
  return (
    <input
      type="text"
      {...rest}
      className={cn(
        "h-[58px] w-full rounded-[14px] bg-base-200 px-[18px] text-[19px] font-bold text-base-content placeholder:text-muted/70",
        RING[state],
        className,
      )}
    />
  );
}
