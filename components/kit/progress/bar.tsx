import { cn } from "@/lib/utils";

/** A thin pill bar. `value` is 0 to 1. Give `label` when it is the only way to read the number. */
export function ProgressBar({
  value,
  label,
  className,
  fillClassName = "bg-success",
}: {
  value: number;
  label?: string;
  className?: string;
  fillClassName?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return (
    <div
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-valuenow={label ? Math.round(clamped * 100) : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("h-2 w-24 overflow-hidden rounded-full bg-base-300", className)}
    >
      <div
        className={cn("h-full rounded-full", fillClassName)}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
