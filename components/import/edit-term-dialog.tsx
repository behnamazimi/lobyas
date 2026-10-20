"use client";

import { useState } from "react";
import { BottomSheet, FormField, Pill, TextArea, TextInput } from "@/components/kit";
import type { DraftTerm } from "@/lib/import/parse/types";

type EditTermDialogProps = {
  draft: DraftTerm | null;
  onClose: () => void;
  onSave: (
    id: string,
    patch: { term: string; definition: string | null; category: string | null },
  ) => void;
};

function EditForm({
  draft,
  onClose,
  onSave,
}: {
  draft: DraftTerm;
  onClose: () => void;
  onSave: EditTermDialogProps["onSave"];
}) {
  const [term, setTerm] = useState(draft.term);
  const [definition, setDefinition] = useState(draft.definition ?? "");
  const [category, setCategory] = useState(draft.category ?? "");

  return (
    <form
      className="flex min-h-0 flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!term.trim()) return;
        onSave(draft.id, {
          term: term.trim(),
          definition: definition.trim() || null,
          category: category.trim() || null,
        });
        onClose();
      }}
    >
      <FormField label="Term" htmlFor="edit-term">
        <TextInput
          id="edit-term"
          value={term}
          autoFocus
          onChange={(event) => setTerm(event.target.value)}
        />
      </FormField>
      <FormField label="Definition" htmlFor="edit-definition">
        <TextArea
          id="edit-definition"
          value={definition}
          rows={3}
          placeholder="What does it mean?"
          onChange={(event) => setDefinition(event.target.value)}
        />
      </FormField>
      <FormField label="Category (optional)" htmlFor="edit-category">
        <TextInput
          id="edit-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </FormField>
      <div className="mt-1 grid grid-cols-2 gap-2.5">
        <Pill variant="secondary" size="lg" onClick={onClose}>
          Cancel
        </Pill>
        <Pill size="lg" type="submit" disabled={!term.trim()}>
          Save
        </Pill>
      </div>
    </form>
  );
}

export function EditTermDialog({ draft, onClose, onSave }: EditTermDialogProps) {
  return (
    <BottomSheet
      isOpen={draft !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Edit term"
    >
      {draft ? <EditForm key={draft.id} draft={draft} onClose={onClose} onSave={onSave} /> : null}
    </BottomSheet>
  );
}
