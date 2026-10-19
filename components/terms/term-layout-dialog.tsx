"use client";

import { useState, useTransition } from "react";
import { BottomSheet, Pill, SegmentedControl } from "@/components/kit";
import { TERM_LABELS } from "@/lib/terms/term-labels";
import { TERM_BLOCKS, type TermBlock } from "@/lib/terms/term-layout";
import type { TermLayoutAccess } from "./term-layout-provider";

const BLOCK_LABELS: Record<TermBlock, string> = {
  mentalModel: TERM_LABELS.en.mentalModel,
  example: TERM_LABELS.en.example,
  antiExample: TERM_LABELS.en.antiExample,
  discussion: TERM_LABELS.en.discussion,
  controversy: TERM_LABELS.en.controversy,
  note: TERM_LABELS.en.note,
  relationships: TERM_LABELS.en.relatedTerms,
  searchLink: "Google search link",
};

type Target = "collection" | "default";

const TARGETS: { value: Target; label: string }[] = [
  { value: "collection", label: "This collection" },
  { value: "default", label: "All collections" },
];

const PLACEMENTS = [
  { value: "shown", label: "Shown" },
  { value: "more", label: "More" },
];

/** Edits what sits under "More" for this collection or for all of them: a
 *  bottom sheet on phone and a dialog on larger screens, like Read options.
 *  It starts from the layout it is mounted with, so mount a fresh one each
 *  time it opens. Don't render it inside a card: it is a portal, and a card's
 *  handlers would see its events. */
export function TermLayoutDialog({
  collectionId,
  access,
  isOpen,
  onOpenChange,
}: {
  collectionId: string | undefined;
  access: TermLayoutAccess;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { placement, hasOverride, save } = access;
  const [draft, setDraft] = useState(placement);
  const [target, setTarget] = useState<Target>(collectionId ? "collection" : "default");
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function submit(change: Parameters<typeof save>[0]) {
    startTransition(async () => {
      const saved = await save(change);
      setFailed(!saved);
      if (saved) onOpenChange(false);
    });
  }

  const body = (
    <div>
      {collectionId ? (
        <div className="mb-2">
          <div className="mb-1.5 text-sm font-extrabold">Apply to</div>
          <SegmentedControl
            label="Apply to"
            options={TARGETS}
            value={target}
            onChange={(value) => setTarget(value as Target)}
          />
        </div>
      ) : null}
      <ul className="m-0 list-none p-0">
        {TERM_BLOCKS.map((block) => (
          <li
            key={block}
            className="flex min-h-14 items-center gap-2.5 border-b border-line last:border-b-0"
          >
            <span className="min-w-0 flex-1 text-[15px] font-extrabold">{BLOCK_LABELS[block]}</span>
            <SegmentedControl
              label={BLOCK_LABELS[block]}
              options={PLACEMENTS}
              value={draft[block]}
              onChange={(value) =>
                setDraft({ ...draft, [block]: value === "shown" ? "shown" : "more" })
              }
              className="flex shrink-0"
            />
          </li>
        ))}
      </ul>
      {failed ? (
        <p role="alert" className="m-0 mt-3 text-sm font-bold text-wrong-text">
          Couldn't save the layout. Try again.
        </p>
      ) : null}
      {hasOverride && target === "default" ? (
        <p className="m-0 mt-3 text-[13px] font-semibold text-muted">
          This collection has its own layout, so it won't change here. Choose “Use my default here”
          to follow the new one.
        </p>
      ) : null}
    </div>
  );

  const footer = (
    <div className="flex flex-col gap-2">
      {hasOverride && collectionId ? (
        <Pill
          variant="soft"
          disabled={isPending}
          onClick={() => submit({ scope: "reset-collection", collectionId })}
        >
          Use my default here
        </Pill>
      ) : null}
      <Pill
        size="lg"
        disabled={isPending}
        onClick={() =>
          submit(
            target === "collection" && collectionId
              ? { scope: "collection", collectionId, placement: draft }
              : { scope: "default", placement: draft },
          )
        }
      >
        Done
      </Pill>
    </div>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="What cards show"
      subline="The definition always shows. Move anything else under More."
      footer={footer}
    >
      {body}
    </BottomSheet>
  );
}
