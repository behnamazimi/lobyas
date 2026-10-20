import { cn } from "@/lib/utils";

export type KitGrade = "again" | "hard" | "good" | "easy";

/** The tile colours, shared by the review buttons and the Mastery grading summary. */
export const GRADE_TILE_COLORS: Record<KitGrade, string> = {
  again: "bg-[color-mix(in_oklab,var(--color-wrong-tint),var(--color-wrong)_14%)] text-wrong-text",
  hard: "bg-[color-mix(in_oklab,var(--color-hard-tint),var(--color-hard)_55%)] text-hard-text",
  good: "bg-[color-mix(in_oklab,var(--color-success-tint),var(--color-success)_30%)] text-success-text",
  easy: "bg-success text-success-content",
};

const TILES: { grade: KitGrade; label: string; className: string }[] = [
  { grade: "again", label: "Again", className: GRADE_TILE_COLORS.again },
  { grade: "hard", label: "Hard", className: GRADE_TILE_COLORS.hard },
  { grade: "good", label: "Good", className: GRADE_TILE_COLORS.good },
  {
    grade: "easy",
    label: "Easy",
    className: cn(GRADE_TILE_COLORS.easy, "shadow-[0_10px_20px_-12px_rgb(20_86_58/0.7)]"),
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
