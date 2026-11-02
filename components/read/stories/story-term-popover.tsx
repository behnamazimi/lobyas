"use client";

import { BottomSheet, Pill } from "@/components/kit";
import { StoryMarkKnown } from "@/components/read/stories/story-mark-known";
import type { StoryTerm } from "@/lib/stories/types";
import { cn } from "@/lib/utils";

/** A term inside the story text. Tapping it opens its definition in a sheet. */
export function StoryTermButton({
  text,
  term,
  review,
  onPress,
}: {
  text: string;
  term: StoryTerm | undefined;
  review: boolean;
  onPress: (term: StoryTerm) => void;
}) {
  if (!term) {
    return (
      <span className="underline decoration-base-content/30 decoration-dotted underline-offset-4">
        {text}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPress(term)}
      className={cn(
        "m-0 inline cursor-pointer rounded p-0 text-start font-[inherit] underline decoration-2 underline-offset-[3px]",
        review ? "text-review-text decoration-review" : "text-read-text decoration-read",
      )}
    >
      {text}
    </button>
  );
}

/** The open term's definition, with the two things a reader may want next. */
export function StoryTermSheet({
  term,
  href,
  onClose,
}: {
  term: StoryTerm | null;
  href: string;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      isOpen={term !== null}
      onOpenChange={(open) => !open && onClose()}
      title={term?.term ?? ""}
    >
      {term ? (
        <div>
          <p className="m-0 text-base leading-snug font-semibold">{term.definition}</p>
          <div className="mt-4 flex gap-2">
            <StoryMarkKnown termId={term.id} term={term.term} variant="pill" />
            <Pill variant="soft" href={href} className="flex-1">
              Open term
            </Pill>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
