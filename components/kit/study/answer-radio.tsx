"use client";

import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { RadioButton, RadioField } from "react-aria-components";
import { cn } from "@/lib/utils";
import { ANSWER_SURFACE, type AnswerState } from "./answer-option";

type ResultState = Exclude<AnswerState, "picked">;

const STATUS_TEXT: Partial<Record<ResultState, string>> = {
  correct: "Correct answer",
  wrong: "Your answer, incorrect",
};

function surface(state: ResultState, selected: boolean, focused: boolean, disabled: boolean) {
  return cn(
    "transition-[color,background-color,box-shadow,transform] duration-150",
    ANSWER_SURFACE[state === "default" && selected ? "picked" : state],
    state !== "default" && "quiz-choice-reveal",
    focused && "outline outline-2 outline-offset-2",
    disabled ? "cursor-default" : "cursor-pointer active:scale-[0.97]",
  );
}

function ResultMark({ state }: { state: ResultState }) {
  if (state === "default") return null;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[26px] shrink-0 items-center justify-center rounded-full text-white",
        state === "correct" ? "bg-mastered" : "bg-wrong",
      )}
    >
      {state === "correct" ? (
        <Check className="size-3.5" strokeWidth={4} />
      ) : (
        <X className="size-3.5" strokeWidth={4} />
      )}
    </span>
  );
}

/** One answer in a radio group (react-aria `RadioGroup` goes around it). `state` shows
 *  the result once checked; before that the selected row gets the purple ring.
 *  `shortcut` is the digit key, shown on desktop keyboards only. Put inside a `RadioGroup`. */
export function AnswerRadio({
  value,
  state = "default",
  shortcut,
  children,
}: {
  value: string;
  state?: ResultState;
  shortcut?: number;
  children: ReactNode;
}) {
  return (
    <RadioField value={value} className="block">
      <RadioButton
        className={({ isSelected, isFocusVisible, isDisabled }) =>
          cn(
            "flex min-h-14 w-full items-center gap-3 rounded-[20px] py-3 pr-3.5 pl-[18px] text-start text-[17px] font-bold",
            surface(state, isSelected, isFocusVisible, isDisabled),
          )
        }
      >
        <span className="min-w-0 flex-1 leading-snug [overflow-wrap:anywhere]">
          {children}
          {STATUS_TEXT[state] ? <span className="sr-only"> — {STATUS_TEXT[state]}</span> : null}
        </span>
        {shortcut !== undefined && state === "default" ? (
          <kbd className="kbd kbd-xs hidden shrink-0 md:inline-flex coarse:hidden" aria-hidden>
            {shortcut}
          </kbd>
        ) : null}
        <ResultMark state={state} />
      </RadioButton>
    </RadioField>
  );
}

/** The big Yes/No tile for a does-it-fit question. `icon` is "yes" (check) or "no" (cross). */
export function AnswerTile({
  value,
  icon,
  state = "default",
  children,
}: {
  value: string;
  icon: "yes" | "no";
  state?: ResultState;
  children: ReactNode;
}) {
  const Icon = icon === "yes" ? Check : X;
  return (
    <RadioField value={value} className="block">
      <RadioButton
        className={({ isSelected, isFocusVisible, isDisabled }) =>
          cn(
            "flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-3xl text-lg font-extrabold",
            surface(state, isSelected, isFocusVisible, isDisabled),
          )
        }
      >
        {({ isSelected }) => (
          <>
            <span
              aria-hidden
              className={cn(
                "flex size-10 items-center justify-center rounded-full",
                state === "correct"
                  ? "bg-mastered text-white"
                  : state === "wrong"
                    ? "bg-wrong text-white"
                    : isSelected
                      ? "bg-quiz-ring text-white"
                      : "bg-base-200 text-base-content",
              )}
            >
              <Icon className="size-5" strokeWidth={3.4} />
            </span>
            <span>
              {children}
              {STATUS_TEXT[state] ? <span className="sr-only"> — {STATUS_TEXT[state]}</span> : null}
            </span>
          </>
        )}
      </RadioButton>
    </RadioField>
  );
}
