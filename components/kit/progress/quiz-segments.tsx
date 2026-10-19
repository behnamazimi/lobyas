import { cn } from "@/lib/utils";

/** One segment per question: done, the current one, and the rest to come. */
export function QuizSegments({
  total,
  current,
  className,
}: {
  total: number;
  /** Zero-based index of the question on screen. */
  current: number;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={`Question ${Math.min(current + 1, total)} of ${total}`}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.min(current + 1, total)}
      className={cn("grid gap-1.5", className)}
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 rounded-full",
            index < current ? "bg-quiz-ring" : index === current ? "bg-quiz" : "bg-base-300",
          )}
        />
      ))}
    </div>
  );
}
