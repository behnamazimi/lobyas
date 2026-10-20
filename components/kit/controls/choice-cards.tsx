"use client";

import type { ReactNode } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { cn } from "@/lib/utils";

type Option = { value: string; label: ReactNode; note?: ReactNode };
type ChoiceTone = "neutral" | "read" | "quiz";

const SELECTED: Record<ChoiceTone, string> = {
  neutral: "bg-base-200 shadow-[inset_0_0_0_2.5px_var(--color-base-content)]",
  read: "bg-read-tint shadow-[inset_0_0_0_2.5px_var(--color-read-ring)]",
  quiz: "bg-quiz-tint shadow-[inset_0_0_0_2.5px_var(--color-quiz-ring)]",
};

/** Pick one from a few options. With `note` each is a card (label and a line
 *  under it); without, a row of fully rounded pills. `columns` is the grid width.
 *  `tone` is the mode that owns the screen, or neutral where there is no mode. */
export function ChoiceCards({
  label,
  options,
  value,
  onChange,
  columns = 2,
  tone = "neutral",
  className,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3 | 4;
  tone?: ChoiceTone;
  className?: string;
}) {
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onChange={onChange}
      className={cn(
        "choice-cards grid gap-2",
        columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4",
        className,
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          className={({ isSelected, isFocusVisible }) =>
            cn(
              "flex cursor-pointer flex-col items-start justify-center gap-1 text-start text-base-content outline-none",
              option.note
                ? "min-h-[88px] rounded-[14px] px-3.5 py-3"
                : "h-12 items-center rounded-full px-2 text-[17px] font-extrabold",
              isSelected ? SELECTED[tone] : "bg-base-200",
              isFocusVisible && "ring-2 ring-base-content ring-offset-2 ring-offset-base-100",
            )
          }
        >
          <span className={cn(option.note && "text-base font-extrabold")}>{option.label}</span>
          {option.note ? (
            <span className="text-[13px] leading-snug font-semibold text-muted">{option.note}</span>
          ) : null}
        </Radio>
      ))}
    </RadioGroup>
  );
}
