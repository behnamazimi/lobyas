"use client";

import { Check, Eye, Pencil, Trash2, Undo2 } from "lucide-react";
import { BottomSheet, Divider, ListRow } from "@/components/kit";
import type { LibraryTerm } from "@/lib/terms/types";
import { useQuickToggleMarkedKnown } from "./mark-known-controls";

type TermActionsSheetProps = {
  term: LibraryTerm;
  markedKnown: boolean;
  isOwner: boolean;
  onClose: () => void;
  onOpenTerm: (termId: string) => void;
  onToggleMarkedKnown: (termId: string) => Promise<boolean>;
  onEdit: (termId: string) => void;
  onDelete: (term: LibraryTerm) => void;
};

/** A row's ⋯ sheet. Mount it only for the term it was opened on. The edit and
 *  delete surfaces live once on the list (TermRowDialogs), not per row. */
export function TermActionsSheet({
  term,
  markedKnown,
  isOwner,
  onClose,
  onOpenTerm,
  onToggleMarkedKnown,
  onEdit,
  onDelete,
}: TermActionsSheetProps) {
  const quickToggle = useQuickToggleMarkedKnown(term, markedKnown, onToggleMarkedKnown);

  // Closes the sheet first, then does what the row asked.
  function pick(action: () => void) {
    return () => {
      onClose();
      action();
    };
  }

  return (
    <BottomSheet
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={term.term}
    >
      <ListRow
        icon={<Eye className="size-5" aria-hidden />}
        label="Open"
        subline="See every part of the term"
        onPress={pick(() => onOpenTerm(term.id))}
      />
      {isOwner ? (
        <>
          <Divider />
          <ListRow
            icon={<Pencil className="size-5" aria-hidden />}
            label="Edit term"
            subline="Definition, example and every other field"
            onPress={pick(() => onEdit(term.id))}
          />
        </>
      ) : null}
      <Divider />
      <ListRow
        icon={
          markedKnown ? (
            <Undo2 className="size-5" aria-hidden />
          ) : (
            <Check className="size-5" aria-hidden />
          )
        }
        label={markedKnown ? "Mark unknown" : "Mark known"}
        subline={
          markedKnown ? "Puts it back into study." : "Takes it out of study. You can undo this."
        }
        onPress={pick(quickToggle)}
      />
      {isOwner ? (
        <>
          <Divider />
          <ListRow
            danger
            icon={<Trash2 className="size-5" aria-hidden />}
            label="Delete term"
            subline="Removes it and its progress"
            onPress={pick(() => onDelete(term))}
          />
        </>
      ) : null}
    </BottomSheet>
  );
}
