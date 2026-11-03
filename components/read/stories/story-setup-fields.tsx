"use client";

import { PIECE_LENGTHS, STORY_OUTLINE_MAX, type PieceLength } from "@/lib/stories/types";
import { cn } from "@/lib/utils";

export const PIECE_LENGTH_LABELS: Record<PieceLength, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};

/** Short, Medium or Long as three pills; the chosen one is outlined in Read blue. */
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
                picked ? "bg-read-tint ring-[2.5px] ring-read-ring ring-inset" : "bg-base-200",
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

/** Optional free-text topic; the length counter appears once the learner types. */
export function StoryTopicField({
  value,
  onChange,
}: {
  value: string;
  onChange: (topic: string) => void;
}) {
  return (
    <div>
      <label htmlFor="story-topic" className="text-sm font-extrabold">
        Topic (optional)
      </label>
      <textarea
        id="story-topic"
        rows={2}
        value={value}
        maxLength={STORY_OUTLINE_MAX}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. A late-night outage at a small startup"
        className="textarea mt-1.5 min-h-16 w-full resize-none rounded-[14px] border-0 bg-base-200 px-3.5 py-3 text-[15px] font-bold"
      />
      {value.length > 0 ? (
        <div className="mt-1.5 text-right text-[13px] font-semibold text-muted tabular-nums">
          {value.length}/{STORY_OUTLINE_MAX}
        </div>
      ) : null}
    </div>
  );
}
