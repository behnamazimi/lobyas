import { cn } from "@/lib/utils";

type StudyProgressProps = {
  current: number;
  total: number;
  /** Read out by screen readers, e.g. "Question 3 of 10". */
  label: string;
  className?: string;
  /** Colours the bar; defaults to the primary colour. */
  barClassName?: string;
};

export function StudyProgress({
  current,
  total,
  label,
  className,
  barClassName = "progress-primary",
}: StudyProgressProps) {
  return (
    <progress
      className={cn("progress h-1 w-full", barClassName, className)}
      value={current}
      max={total}
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={label}
    />
  );
}
