"use client";

import { Plus, Trash2 } from "lucide-react";
import type { RelationshipDraft } from "@/lib/terms/relationship-schema";
import type { LibraryTerm } from "@/lib/terms/types";
import { FormField, Pill, SelectInput, TextArea, TextInput } from "@/components/kit";

type TermRelationshipsEditorProps = {
  drafts: RelationshipDraft[];
  onChange: (drafts: RelationshipDraft[]) => void;
  collectionTerms: Pick<LibraryTerm, "id" | "term">[];
  sourceTermId?: string;
};

function createDraftKey() {
  return `draft-${crypto.randomUUID()}`;
}

export function TermRelationshipsEditor({
  drafts,
  onChange,
  collectionTerms,
  sourceTermId,
}: TermRelationshipsEditorProps) {
  const targetOptions = collectionTerms.filter((term) => term.id !== sourceTermId);

  function updateDraft(key: string, patch: Partial<RelationshipDraft>) {
    onChange(drafts.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)));
  }

  function removeDraft(key: string) {
    onChange(drafts.filter((draft) => draft.key !== key));
  }

  function addOutgoingDraft() {
    const firstTarget = targetOptions[0];
    onChange([
      ...drafts,
      {
        key: createDraftKey(),
        direction: "outgoing",
        relatedTermId: firstTarget?.id ?? "",
        relatedTermName: firstTarget?.term ?? "",
        relationshipType: "",
        description: "",
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="m-0 font-sans text-sm font-extrabold">Related terms</h3>
          <p className="m-0 text-[13px] font-semibold text-muted">
            Link this term to others in the collection.
          </p>
        </div>
        <Pill
          variant="soft"
          onClick={addOutgoingDraft}
          disabled={targetOptions.length === 0}
          className="shrink-0"
        >
          <Plus className="size-4" aria-hidden strokeWidth={2.4} />
          Link a term
        </Pill>
      </div>

      {targetOptions.length === 0 ? (
        <p className="m-0 text-[13px] font-semibold text-muted">
          Add another term first, then you can link them.
        </p>
      ) : null}

      {drafts.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {drafts.map((draft) => (
            <li key={draft.key} className="flex flex-col gap-2.5 rounded-2xl bg-base-200 p-3">
              {draft.direction === "incoming" ? (
                <p className="m-0 text-sm font-semibold text-muted">
                  <span className="font-extrabold text-base-content">{draft.relatedTermName}</span>{" "}
                  <span className="italic">{draft.relationshipType}</span> this term
                </p>
              ) : (
                <>
                  <FormField label="Related term" htmlFor={`${draft.key}-target`}>
                    <SelectInput
                      id={`${draft.key}-target`}
                      className="bg-base-100"
                      value={draft.relatedTermId}
                      onChange={(event) => {
                        const term = targetOptions.find((item) => item.id === event.target.value);
                        if (!term) return;
                        updateDraft(draft.key, {
                          relatedTermId: term.id,
                          relatedTermName: term.term,
                        });
                      }}
                    >
                      {targetOptions.map((term) => (
                        <option key={term.id} value={term.id}>
                          {term.term}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>

                  <FormField label="Relationship type" htmlFor={`${draft.key}-type`}>
                    <TextInput
                      id={`${draft.key}-type`}
                      className="bg-base-100"
                      value={draft.relationshipType}
                      onChange={(event) =>
                        updateDraft(draft.key, {
                          relationshipType: event.target.value,
                        })
                      }
                      placeholder="e.g. often confused with"
                    />
                  </FormField>

                  <FormField label="Description (optional)" htmlFor={`${draft.key}-description`}>
                    <TextArea
                      id={`${draft.key}-description`}
                      className="bg-base-100"
                      rows={2}
                      value={draft.description}
                      onChange={(event) =>
                        updateDraft(draft.key, {
                          description: event.target.value,
                        })
                      }
                    />
                  </FormField>
                </>
              )}

              <div className="flex justify-end">
                <Pill variant="ghost" onClick={() => removeDraft(draft.key)}>
                  <Trash2 className="size-4" aria-hidden strokeWidth={2.4} />
                  Remove
                </Pill>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
