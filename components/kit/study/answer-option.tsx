import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AnswerState = "default" | "picked" | "correct" | "wrong";

export const ANSWER_SURFACE: Record<AnswerState, string> = {
  default: "bg-base-100 text-base-content shadow-card",
  picked: "bg-quiz-tint text-base-content shadow-[inset_0_0_0_2.5px_var(--color-quiz-ring)]",
  correct: "bg-success-tint text-success-text shadow-[inset_0_0_0_2.5px_var(--color-mastered)]",
  wrong: "bg-wrong-tint text-wrong-text shadow-[inset_0_0_0_2.5px_var(--color-wrong)]",
};

/** One answer in a choice question. `marker` is the leading letter or number
 *  shown while the option is unmarked. */
export function AnswerOption({
  state = "default",
  marker,
  onPress,
  disabled,
  className,
  children,
}: {
  state?: AnswerState;
  marker?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const icon =
    state === "correct" ? (
      <Check className="size-4" strokeWidth={3.5} aria-hidden />
    ) : state === "wrong" ? (
      <X className="size-4" strokeWidth={3.5} aria-hidden />
    ) : (
      marker
    );
  return (
    <button
      type="button"
      aria-pressed={state === "picked"}
      disabled={disabled}
      onClick={onPress}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-[20px] px-4 py-3 text-start text-base font-extrabold",
        ANSWER_SURFACE[state],
        className,
      )}
    >
      {icon !== undefined && icon !== null ? (
        <span
          aria-hidden
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-sm",
            state === "correct" && "bg-mastered text-white",
            state === "wrong" && "bg-wrong text-white",
            state === "picked" && "bg-quiz-ring text-white",
            state === "default" && "bg-base-200 text-base-content",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{children}</span>
    </button>
  );
}
