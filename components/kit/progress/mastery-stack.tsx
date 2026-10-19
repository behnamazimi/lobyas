import { formatCount } from "@/lib/kit/text";
import { cn } from "@/lib/utils";

/** Mastered, learning and not-started terms in one bar, with an optional legend. */
export function MasteryStack({
  name,
  mastered,
  learning,
  notStarted,
  showLegend = true,
  className,
}: {
  /** Names the bar for screen readers, for example a collection name. */
  name: string;
  mastered: number;
  learning: number;
  notStarted: number;
  showLegend?: boolean;
  className?: string;
}) {
  const total = mastered + learning + notStarted;
  const share = (count: number) => (total === 0 ? 0 : (count / total) * 100);
  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${name}: ${formatCount(mastered)} mastered, ${formatCount(
          learning,
        )} learning, ${formatCount(notStarted)} not started`}
        className="flex h-2.5 overflow-hidden rounded-full bg-base-300"
      >
        <span className="bg-mastered" style={{ width: `${share(mastered)}%` }} />
        <span className="bg-learning" style={{ width: `${share(learning)}%` }} />
      </div>
      {showLegend ? (
        <div className={cn("mt-1.5 flex flex-wrap gap-x-3 text-xs font-bold text-muted")}>
          <span>{formatCount(mastered)} mastered</span>
          <span>{formatCount(learning)} learning</span>
          <span>{formatCount(notStarted)} not started</span>
        </div>
      ) : null}
    </div>
  );
}
