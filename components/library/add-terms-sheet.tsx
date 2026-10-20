"use client";

import { LayoutGrid, NotebookText, Plus } from "lucide-react";
import { BottomSheet, Divider, ListRow } from "@/components/kit";
import type { Collection } from "@/lib/terms/types";

/** Add terms to this collection: one at a time, a pasted list, or an export from another app. */
export function AddTermsSheet({
  collection,
  onClose,
}: {
  collection: Pick<Collection, "id" | "name">;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`Add terms to ${collection.name}`}
    >
      <ListRow
        icon={<Plus className="size-5" aria-hidden />}
        label="One term"
        subline="Type it in a few seconds"
        href={`/app/capture?to=${collection.id}`}
      />
      <Divider />
      <ListRow
        icon={<NotebookText className="size-5" aria-hidden />}
        label="Paste a list"
        subline="From a doc, a sheet or your notes"
        href={`/app/import/paste?to=${collection.id}`}
      />
      <Divider />
      <ListRow
        icon={<LayoutGrid className="size-5" aria-hidden />}
        label="From another app"
        subline="Quizlet, Anki and more"
        href="/app/import/apps"
      />
    </BottomSheet>
  );
}
