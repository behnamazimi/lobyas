"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { cn } from "@/lib/utils";

type Option = { value: string; label: ReactNode; description?: ReactNode };

/** One choice from a short list, each row at least 56 px with a check on the chosen one. */
export function RadioList({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onChange={onChange}
      className={cn("flex flex-col", className)}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          className={({ isFocusVisible }) =>
            cn(
              "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 outline-none",
              isFocusVisible && "ring-2 ring-base-content",
            )
          }
        >
          {({ isSelected }) => (
            <>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-base font-extrabold">{option.label}</span>
                {option.description ? (
                  <span className="text-[13px] leading-snug font-semibold text-muted">
                    {option.description}
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  isSelected ? "bg-mastered text-white" : "border-2 border-line",
                )}
              >
                {isSelected ? <Check className="size-4" strokeWidth={3.5} /> : null}
              </span>
            </>
          )}
        </Radio>
      ))}
    </RadioGroup>
  );
}
