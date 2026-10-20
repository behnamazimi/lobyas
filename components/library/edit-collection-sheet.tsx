"use client";

import { useState } from "react";
import {
  BottomSheet,
  FormField,
  Pill,
  SegmentedControl,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/kit";
import { useCollectionActions } from "@/hooks/use-collection-actions";
import type { CollectionInput } from "@/lib/library/collection-schema";
import { COLLECTION_KIND_OPTIONS, parseKind } from "@/lib/terms/kinds";
import { COLLECTION_LANGUAGE_OPTIONS } from "@/lib/terms/languages";
import type { Collection } from "@/lib/terms/types";

type EditCollectionSheetProps = {
  collection: Collection;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

function collectionToForm(collection: Collection): CollectionInput {
  return {
    name: collection.name,
    description: collection.description || null,
    language: collection.language,
    kind: collection.kind,
  };
}

/** Mount it only while it is open, so every opening starts from the saved values. */
export function EditCollectionSheet({
  collection,
  isOpen,
  onOpenChange,
}: EditCollectionSheetProps) {
  const { updateOwnedCollection, isBusy, busyId, error } = useCollectionActions();
  const [form, setForm] = useState<CollectionInput>(() => collectionToForm(collection));
  const isSubmitting = isBusy && busyId === collection.id;

  function updateField<K extends keyof CollectionInput>(key: K, value: CollectionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await updateOwnedCollection(
      collection.id,
      {
        name: form.name.trim(),
        description: form.description?.trim() ? form.description.trim() : null,
        language: form.language,
        kind: form.kind,
      },
      () => onOpenChange(false),
    );
  }

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange} title="Edit collection">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <FormField label="Name" htmlFor="collection-name">
          <TextInput
            id="collection-name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="e.g. Startup Terms"
            required
          />
        </FormField>
        <FormField label="What it teaches">
          <SegmentedControl
            label="What it teaches"
            options={COLLECTION_KIND_OPTIONS}
            value={form.kind}
            onChange={(kind) => updateField("kind", parseKind(kind))}
          />
        </FormField>
        <FormField label="Content language" htmlFor="collection-language">
          <SelectInput
            id="collection-language"
            value={form.language}
            onChange={(event) =>
              updateField("language", event.target.value as CollectionInput["language"])
            }
          >
            {COLLECTION_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Description (optional)" htmlFor="collection-description">
          <TextArea
            id="collection-description"
            rows={3}
            value={form.description ?? ""}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="What is this collection about?"
          />
        </FormField>
        {error ? (
          <p role="alert" className="m-0 text-sm font-bold text-wrong-text">
            {error}
          </p>
        ) : null}
        <Pill type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Pill>
      </form>
    </BottomSheet>
  );
}
