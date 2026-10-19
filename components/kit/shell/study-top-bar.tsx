import { X } from "lucide-react";
import type { ReactNode } from "react";
import { CLAMP_ONE_LINE } from "@/lib/kit/text";
import { cn } from "@/lib/utils";
import { IconButton } from "../controls/pill";
import { ProgressRing } from "../progress/ring";
import { Tile } from "../surface/card";
import type { Tone } from "../tones";

const pill =
  "flex h-9 items-center gap-2 rounded-full bg-base-100 text-sm font-extrabold shadow-[0_1px_2px_rgb(var(--shadow-rgb)/0.08)]";

/** The bar over a study screen: close, the collection chip and the goal pill.
 *  Leave `goal.value` out for a running count with no ring. */
export function StudyTopBar({
  closeHref,
  closeLabel = "Close and go home",
  collection,
  goal,
  className,
}: {
  closeHref: string;
  closeLabel?: string;
  collection: { name: string; letter: string; tone: Tone };
  goal?: { label: string; value?: number; tone: Tone };
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <IconButton label={closeLabel} href={closeHref} className="-ml-2">
        <X className="size-6" strokeWidth={2.6} aria-hidden />
      </IconButton>
      <div className="flex min-w-0 flex-1 justify-center">
        <div className={cn(pill, "max-w-full min-w-0 pr-3.5 pl-1.5")}>
          <Tile tone={collection.tone} size={24} serif>
            {collection.letter}
          </Tile>
          <span className={cn("min-w-0", CLAMP_ONE_LINE)}>{collection.name}</span>
        </div>
      </div>
      {goal ? <GoalPill {...goal} /> : <div className="w-9" />}
    </div>
  );
}

function GoalPill({ label, value, tone }: { label: ReactNode; value?: number; tone: Tone }) {
  return (
    <div className={cn(pill, "shrink-0 pr-3 pl-2 tabular-nums")}>
      {value !== undefined ? (
        <ProgressRing value={value} tone={tone} size={24} strokeWidth={10} />
      ) : null}
      <span>{label}</span>
    </div>
  );
}
