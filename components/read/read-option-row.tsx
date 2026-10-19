"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function OptionRow({
  id,
  label,
  description,
  checked,
  disabledNote,
  disabled: busy = false,
  autoFocus,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabledNote?: string;
  /** Off for a moment, e.g. while a change saves; unlike `disabledNote` it doesn't dim the row. */
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const disabled = Boolean(disabledNote);
  return (
    <li
      className={cn(
        "flex min-h-14 items-center justify-between gap-4 px-4 py-3",
        disabled && "opacity-50",
      )}
    >
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-medium text-base-content",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {label}
        </label>
        <p id={`${id}-description`} className="m-0 text-xs text-base-content/70">
          {disabledNote ?? description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled || busy}
        autoFocus={autoFocus}
        aria-describedby={`${id}-description`}
        onCheckedChange={onChange}
        className="toggle-primary shrink-0"
      />
    </li>
  );
}
