import { Check, CheckCheck, Waves, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KitGrade = "again" | "hard" | "good" | "easy";

const TILES: {
  grade: KitGrade;
  label: string;
  icon: ReactNode;
  className: string;
}[] = [
  {
    grade: "again",
    label: "Again",
    icon: <X className="size-[18px]" strokeWidth={3} aria-hidden />,
    className: "bg-wrong-tint text-wrong-text",
  },
  {
    grade: "hard",
    label: "Hard",
    icon: <Waves className="size-[18px]" strokeWidth={3} aria-hidden />,
    className: "bg-hard-tint text-hard-text",
  },
  {
    grade: "good",
    label: "Good",
    icon: <Check className="size-[18px]" strokeWidth={3} aria-hidden />,
    className: "bg-success-tint text-success-text",
  },
  {
    grade: "easy",
    label: "Easy",
    icon: <CheckCheck className="size-[18px]" strokeWidth={3} aria-hidden />,
    className: "bg-success text-success-content shadow-[0_10px_20px_-12px_rgb(20_86_58/0.7)]",
  },
];

/** The four review grades as pressable tiles. `intervals` adds a small second line
 *  ("2 days") under a label when the learner has that option on. */
export function GradeTiles({
  onGrade,
  intervals,
  ariaLabels,
  selected,
  disabled,
  className,
}: {
  onGrade: (grade: KitGrade) => void;
  intervals?: Partial<Record<KitGrade, string>>;
  /** Spoken names when they differ from the visible label, e.g. with an interval. */
  ariaLabels?: Partial<Record<KitGrade, string>>;
  /** The grade already given to this card; it gets a ring. */
  selected?: KitGrade;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="How well did you know it?"
      className={cn("grid grid-cols-4 gap-2", className)}
    >
      {TILES.map((tile) => (
        <button
          key={tile.grade}
          type="button"
          disabled={disabled}
          aria-label={ariaLabels?.[tile.grade]}
          onClick={() => onGrade(tile.grade)}
          className={cn(
            "flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 text-[15px] font-extrabold transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50",
            tile.className,
            selected === tile.grade && "ring-2 ring-neutral/60",
          )}
        >
          {tile.icon}
          {tile.label}
          {intervals?.[tile.grade] ? (
            <span className="text-[11px] leading-none font-bold opacity-80">
              {intervals[tile.grade]}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
