"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type LoveButtonProps = {
  loved: boolean;
  count: number;
  onToggle: () => void;
  isDisabled?: boolean;
};

export function LoveButton({ loved, count, onToggle, isDisabled }: LoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-pressed={loved}
      aria-label={loved ? "Loved" : "Love this collection"}
      className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-extrabold transition-transform active:scale-[0.96] disabled:opacity-50"
    >
      <Heart
        className={cn("size-[18px]", loved ? "fill-wrong text-wrong" : "text-muted")}
        strokeWidth={2.3}
        aria-hidden
      />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
