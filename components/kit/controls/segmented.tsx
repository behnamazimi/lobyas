"use client";

import { Radio, RadioGroup } from "react-aria-components";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

/** Two to four choices on a pill track; the chosen one is white. Behaves as a radio group. */
export function SegmentedControl({
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
      orientation="horizontal"
      value={value}
      onChange={onChange}
      className={cn("grid rounded-full bg-base-300 p-0", className)}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          className={({ isSelected, isFocusVisible }) =>
            cn(
              "flex h-11 cursor-pointer items-center justify-center rounded-full text-sm font-extrabold",
              isSelected ? "bg-base-100 text-base-content shadow-sm" : "text-ink-soft",
              isFocusVisible && "outline outline-2 outline-offset-2",
            )
          }
        >
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
