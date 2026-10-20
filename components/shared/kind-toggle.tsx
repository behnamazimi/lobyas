"use client";

import { ChoiceCards } from "@/components/kit";
import { COLLECTION_KIND_OPTIONS, parseKind, type CollectionKind } from "@/lib/terms/kinds";

const KIND_HINTS: Record<CollectionKind, string> = {
  terms: "Terms from a field or a job, like finance or nursing.",
  vocabulary: "Words and phrases of a language you're learning.",
};

type KindToggleProps = {
  value: CollectionKind | null;
  onChange: (kind: CollectionKind) => void;
  isDisabled?: boolean;
};

/** Field terms or Words and phrases. Starts empty when nothing is picked yet. */
export function KindToggle({ value, onChange, isDisabled }: KindToggleProps) {
  return (
    <div className="space-y-1.5">
      <div className={isDisabled ? "pointer-events-none opacity-60" : undefined}>
        <ChoiceCards
          label="What it teaches"
          options={COLLECTION_KIND_OPTIONS}
          value={value ?? ""}
          onChange={(next) => onChange(parseKind(next))}
        />
      </div>
      <p className="m-0 text-[13px] font-semibold text-muted">
        {value ? KIND_HINTS[value] : "Pick the one that fits."}
      </p>
    </div>
  );
}
