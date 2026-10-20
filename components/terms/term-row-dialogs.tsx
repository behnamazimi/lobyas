"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ConfirmDialog } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { forgetTermDetails } from "@/lib/library/details-store";
import type { LibraryTerm, Term } from "@/lib/terms/types";

const TermFormDialog = dynamic(() =>
  import("@/components/terms/term-form-dialog").then((mod) => mod.TermFormDialog),
);

type TermRowDialogsProps = {
  collectionTerms: LibraryTerm[];
  /** The term being edited, with its details loaded. */
  editing: Term | null;
  onEditingChange: (term: Term | null) => void;
  deleting: LibraryTerm | null;
  onDeletingChange: (term: LibraryTerm | null) => void;
  /** The details snapshot to drop once a term is gone. */
  detailsScope: string;
  /** Deletes the term; resolves false if it couldn't. */
  onRemove: (termId: string) => Promise<boolean>;
};

/** The edit and delete dialogs for whichever row asked, mounted once for
 *  the whole list instead of once per row. */
export function TermRowDialogs({
  collectionTerms,
  editing,
  onEditingChange,
  deleting,
  onDeletingChange,
  detailsScope,
  onRemove,
}: TermRowDialogsProps) {
  const { toast } = useToast();

  async function confirmDelete(term: LibraryTerm) {
    onDeletingChange(null);
    if (await onRemove(term.id)) {
      // Other cards may still list it under related terms.
      forgetTermDetails(detailsScope);
      toast(`"${term.term}" deleted`);
    } else {
      toast(`Couldn't delete "${term.term}". It's back in the list.`, "destructive");
    }
  }

  return (
    <>
      {editing ? (
        <Suspense fallback={null}>
          <TermFormDialog
            key={editing.id}
            collectionTerms={collectionTerms}
            initialTerm={editing}
            onOpenChange={(open) => {
              if (!open) onEditingChange(null);
            }}
          />
        </Suspense>
      ) : null}

      <ConfirmDialog
        isOpen={deleting !== null}
        onOpenChange={(open) => {
          if (!open) onDeletingChange(null);
        }}
        title="Delete term?"
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) void confirmDelete(deleting);
        }}
      >
        &ldquo;{deleting?.term}&rdquo; and its progress will be removed from this collection. This
        can&apos;t be undone.
      </ConfirmDialog>
    </>
  );
}
