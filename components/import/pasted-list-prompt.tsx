"use client";

import { Banner, Pill } from "@/components/kit";

type PastedListPromptProps = {
  lines: string[];
  onAddAsList: () => void;
  onKeepAsOne: () => void;
  source?: "pasted" | "shared";
};

/** Shown when several lines are pasted into the Term box. */
export function PastedListPrompt({
  lines,
  onAddAsList,
  onKeepAsOne,
  source = "pasted",
}: PastedListPromptProps) {
  return (
    <div role="group" aria-label={source === "shared" ? "You shared a list" : "You pasted a list"}>
      <Banner
        action={
          <>
            <Pill variant="primary" onClick={onAddAsList}>
              Add {lines.length} terms
            </Pill>
            <Pill variant="secondary" onClick={onKeepAsOne}>
              Keep as one
            </Pill>
          </>
        }
      >
        <strong className="block font-extrabold">
          You {source === "shared" ? "shared" : "pasted"} {lines.length} lines
        </strong>
        Add them as separate terms? You&apos;ll check them before anything is saved.
      </Banner>
    </div>
  );
}
