import { CLAMP_ONE_LINE, formatCount } from "@/lib/kit/text";
import { cn } from "@/lib/utils";
import { ProgressBar } from "../progress/bar";
import { Tile } from "../surface/card";
import type { Tone } from "../tones";

/** One collection in the switcher: a letter tile, the name, and how much is mastered. */
export function CollectionSwitcherRow({
  name,
  letter,
  tone,
  mastered = 0,
  total,
  detail,
  selected = false,
  onPress,
}: {
  name: string;
  letter: string;
  tone: Tone;
  /** Leave out `total` to hide the progress bar and its count, for a paused collection. */
  mastered?: number;
  total?: number;
  /** A small third line, for example the queue sizes. */
  detail?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const value = total ? mastered / total : 0;
  return (
    <button
      type="button"
      onClick={onPress}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-2xl px-2 py-2 text-start",
        selected ? "bg-success-tint" : "hover:bg-base-200",
      )}
    >
      <Tile tone={tone} serif>
        {letter}
      </Tile>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn("text-base font-extrabold", CLAMP_ONE_LINE)}>{name}</span>
        {total === undefined ? null : (
          <span className="flex items-center gap-2">
            <ProgressBar value={value} label={`${name} mastered`} className="w-16" />
            <span className="text-[13px] font-semibold text-muted">
              {formatCount(mastered)} of {formatCount(total)} mastered
            </span>
          </span>
        )}
        {detail ? <span className="text-[13px] font-semibold text-muted">{detail}</span> : null}
      </span>
    </button>
  );
}
