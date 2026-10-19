import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** A number with minus and plus buttons and a small unit under it ("terms a day"). */
export function Stepper({
  value,
  unit,
  decreaseLabel,
  increaseLabel,
  onDecrease,
  onIncrease,
  valueText,
  disableDecrease,
  disableIncrease,
  className,
}: {
  value: number;
  unit: string;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
  /** Shown instead of the number, for example "Off". */
  valueText?: string;
  disableDecrease?: boolean;
  disableIncrease?: boolean;
  className?: string;
}) {
  const step =
    "flex size-11 items-center justify-center rounded-full bg-base-200 text-base-content disabled:opacity-40";
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label={decreaseLabel}
        onClick={onDecrease}
        disabled={disableDecrease}
        className={step}
      >
        <Minus className="size-5" strokeWidth={3} aria-hidden />
      </button>
      <div className="min-w-14 text-center">
        <div className="text-[22px] leading-tight font-extrabold tabular-nums">
          {valueText ?? value}
        </div>
        <div className="text-[11px] leading-tight font-bold text-muted">{unit}</div>
      </div>
      <button
        type="button"
        aria-label={increaseLabel}
        onClick={onIncrease}
        disabled={disableIncrease}
        className={step}
      >
        <Plus className="size-5" strokeWidth={3} aria-hidden />
      </button>
    </div>
  );
}
