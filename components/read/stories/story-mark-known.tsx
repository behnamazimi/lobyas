"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { setTermMarkedKnownAction } from "@/app/(private)/app/actions";
import { overrideMarkedKnown } from "@/lib/library/overrides";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/** A compact "I already know this" for a glossary row, so the option stays
 *  available for new terms without outweighing the definition itself. */
export function StoryMarkKnown({
  termId,
  term,
  variant = "row",
}: {
  termId: string;
  term: string;
  /** `pill` is the full-width action in the term sheet. */
  variant?: "row" | "pill";
}) {
  const [marked, setMarked] = useState(false);
  const { toast } = useToast();

  if (marked && variant === "pill") {
    return (
      <span
        role="status"
        className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-success-tint text-[15px] font-extrabold text-success-text"
      >
        <Check className="size-4" aria-hidden strokeWidth={3} />
        Known
      </span>
    );
  }

  if (marked) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success-text">
        <Check className="size-3.5" aria-hidden strokeWidth={2.5} />
        Known
      </span>
    );
  }

  return (
    <Button
      type="button"
      size="xs"
      variant="ghost"
      aria-label={`Mark ${term} as known`}
      className={
        variant === "pill"
          ? "h-11 flex-1 rounded-full bg-success-tint text-[15px] font-extrabold text-success-text hover:bg-success-tint"
          : "h-7 px-2 text-xs font-medium text-base-content/70 hover:text-base-content"
      }
      onPress={async () => {
        setMarked(true);
        const { error, savedAt } = await setTermMarkedKnownAction(termId, true);
        if (savedAt) overrideMarkedKnown(termId, true, savedAt);
        if (error) {
          setMarked(false);
          toast("Couldn't mark that term known. It may show up again.", "destructive");
        }
      }}
    >
      {variant === "pill" ? "Mark as known" : "I know this"}
    </Button>
  );
}
