"use client";

import { PIECE_LENGTHS, type PieceLength } from "@/lib/stories/types";
import { cn } from "@/lib/utils";

export const PIECE_LENGTH_LABELS: Record<PieceLength, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};

/** Short, Medium or Long as three pills; the chosen one is outlined in purple. */
export function PieceLengthField({
  value,
  onChange,
}: {
  value: PieceLength;
  onChange: (length: PieceLength) => void;
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="p-0 text-sm font-extrabold">Length</legend>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {PIECE_LENGTHS.map((length) => {
          const picked = length === value;
          return (
            <button
              key={length}
              type="button"
              aria-pressed={picked}
              onClick={() => onChange(length)}
              className={cn(
                "h-11 cursor-pointer rounded-full text-[15px] font-extrabold",
                picked ? "bg-quiz-tint ring-[2.5px] ring-quiz-ring ring-inset" : "bg-base-200",
              )}
            >
              {PIECE_LENGTH_LABELS[length]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
