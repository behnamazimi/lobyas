"use client";

import { useState } from "react";
import { BottomSheet, ConfirmDialog, FormField, Pill, TextArea } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { useTermActions } from "@/hooks/use-term-actions";
import type { UnfinishedLibraryTerm } from "@/lib/terms/types";

type FinishTermsDialogProps = {
  terms: UnfinishedLibraryTerm[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a term is removed, so the page can reload. Finishing one
   *  reloads the page by itself (the action revalidates it). */
  onRemoved: () => void;
};

function FinishRow({ term, onRemoved }: { term: UnfinishedLibraryTerm; onRemoved: () => void }) {
  const { finishTerm, deleteTerm, isBusy, error } = useTermActions();
  const { toast } = useToast();
  const [definition, setDefinition] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const inputId = `finish-${term.id}`;

  async function handleSave() {
    if (!definition.trim() || isBusy) return;
    await finishTerm(term.id, { definition }, () => {
      toast(`Saved "${term.term}"`, "success");
    });
  }

  async function handleRemove() {
    setConfirmRemove(false);
    if (await deleteTerm(term.id)) onRemoved();
  }

  return (
    <li className="m-0 flex list-none flex-col gap-2 rounded-2xl bg-base-200 p-3">
      <FormField label={term.term} htmlFor={inputId}>
        <TextArea
          id={inputId}
          rows={3}
          value={definition}
          placeholder="What does it mean?"
          onChange={(event) => setDefinition(event.target.value)}
          className="bg-base-100"
        />
      </FormField>
      {error ? (
        <p role="alert" className="m-0 text-sm font-bold text-wrong-text">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Pill variant="ghost" disabled={isBusy} onClick={() => setConfirmRemove(true)}>
          Remove
        </Pill>
        <Pill disabled={isBusy || !definition.trim()} onClick={() => void handleSave()}>
          {isBusy ? "Saving…" : "Save"}
        </Pill>
      </div>

      <ConfirmDialog
        isOpen={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={<>Remove &ldquo;{term.term}&rdquo;?</>}
        confirmLabel="Remove"
        onConfirm={() => void handleRemove()}
      >
        It has no progress yet, so nothing else is lost.
      </ConfirmDialog>
    </li>
  );
}

export function FinishTermsDialog({
  terms,
  isOpen,
  onOpenChange,
  onRemoved,
}: FinishTermsDialogProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Finish terms"
      subline="Add a definition and the term joins Read, Review and Quiz."
      footer={
        <Pill variant="secondary" size="lg" onClick={() => onOpenChange(false)}>
          Done
        </Pill>
      }
    >
      {terms.length === 0 ? (
        <p className="m-0 py-6 text-center text-sm font-semibold text-muted">All terms finished.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {terms.map((term) => (
            <FinishRow key={term.id} term={term} onRemoved={onRemoved} />
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
