"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { BottomSheet, Divider, IconButton, ToggleRow } from "@/components/kit";
import { useMediaQuery } from "@/hooks/use-platform";
import { useKeepAwakeAvailable } from "@/hooks/use-wake-lock";
import { PLATFORM_MEDIA } from "@/lib/platform";
import type { ReviewOptionKey, ReviewOptions } from "@/lib/review/options";

type ReviewOptionsMenuProps = {
  options: ReviewOptions;
  narrationAccess: boolean;
  onChange: (key: ReviewOptionKey, value: boolean) => void;
};

/** The options button in the controls row. Rows that can't apply to this
 *  person or device are left out. */
export function ReviewOptionsMenu({ options, narrationAccess, onChange }: ReviewOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const touch = useMediaQuery(PLATFORM_MEDIA.coarsePointer, false);
  const keepAwakeAvailable = useKeepAwakeAvailable();

  const rows: { key: ReviewOptionKey; label: string; description: string }[] = [
    ...(narrationAccess
      ? [
          {
            key: "narrateOnReveal" as const,
            label: "Play narration when card revealed",
            description: "Plays the AI voice for terms that have a clip.",
          },
        ]
      : []),
    ...(touch
      ? [
          {
            key: "swipe" as const,
            label: "Swipe gestures",
            description: "Swipe up to reveal, sideways to move between terms.",
          },
        ]
      : []),
    ...(keepAwakeAvailable
      ? [
          {
            key: "keepAwake" as const,
            label: "Keep screen awake",
            description:
              "Stops the screen sleeping while you study, until you’ve been idle for 2 minutes.",
          },
        ]
      : []),
    {
      key: "showNextReview",
      label: "Show when terms come back",
      description: "Each grade tile shows roughly when you’ll see the term again.",
    },
  ];

  return (
    <>
      <IconButton
        label="Review options"
        onClick={() => setOpen(true)}
        className="transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        <SlidersHorizontal className="size-[22px]" strokeWidth={2.2} aria-hidden />
      </IconButton>
      <BottomSheet isOpen={open} onOpenChange={setOpen} title="Review options">
        <div>
          {rows.map((row, index) => (
            <div key={row.key}>
              {index > 0 ? <Divider /> : null}
              <ToggleRow
                label={row.label}
                description={row.description}
                checked={options[row.key]}
                onChange={(checked) => onChange(row.key, checked)}
              />
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
