"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { collectionLetter } from "@/components/app/shell/collection-look";
import { BottomSheet, Divider, ListRow } from "@/components/kit";
import { CAPTURE_COPY } from "@/lib/capture/copy";
import type { ImportDestination } from "@/lib/import/import-collections";
import { pluralize } from "@/lib/utils";

/** The collection a term is saved to. It changes this page only, not the app's current collection. */
export function CollectionPicker({
  collections,
  selectedId,
  onSelect,
}: {
  collections: ImportDestination[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = collections.find((collection) => collection.id === selectedId);
  if (!selected) return null;

  return (
    <>
      <button
        type="button"
        aria-label={`${CAPTURE_COPY.collection}: ${selected.name}`}
        onClick={() => setOpen(true)}
        className="flex h-11 max-w-[60vw] items-center gap-1.5 rounded-full bg-base-100 pr-3 pl-1.5 text-sm font-extrabold shadow-card"
      >
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-read-tint font-heading text-[13px] text-read-text">
          {collectionLetter(selected.name)}
        </span>
        <span className="truncate">{selected.name}</span>
        <ChevronDown className="size-3.5 shrink-0" strokeWidth={3} aria-hidden />
      </button>
      <BottomSheet isOpen={open} onOpenChange={setOpen} title="Save to">
        {collections.map((collection, index) => (
          <div key={collection.id}>
            {index > 0 ? <Divider /> : null}
            <ListRow
              label={collection.name}
              subline={pluralize(collection.termCount, "term")}
              icon={
                <span className="font-heading text-lg">{collectionLetter(collection.name)}</span>
              }
              trailing={
                collection.id === selectedId ? (
                  <Check className="size-5 shrink-0" strokeWidth={2.8} aria-hidden />
                ) : null
              }
              onPress={() => {
                onSelect(collection.id);
                setOpen(false);
              }}
            />
          </div>
        ))}
      </BottomSheet>
    </>
  );
}
