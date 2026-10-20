import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A settings row with a switch. The whole row is the label, so it is one 44 px+ target. */
export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex min-h-14 cursor-pointer items-center gap-3.5 px-1 py-3", className)}>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-extrabold">{label}</span>
        {description ? (
          <span className="text-[13px] leading-snug font-semibold text-muted">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        role="switch"
        className="toggle shrink-0 border-muted/50 text-muted checked:border-mastered checked:bg-mastered checked:text-white"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
