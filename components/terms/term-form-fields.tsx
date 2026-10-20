import { FormField, TextArea, TextInput } from "@/components/kit";
import { TermRelationshipsEditor } from "@/components/terms/term-relationships-editor";
import type { RelationshipDraft } from "@/lib/terms/relationship-schema";
import type { TermFormValues } from "@/lib/terms/term-schema";
import type { LibraryTerm } from "@/lib/terms/types";

type TermFormFieldsProps = {
  form: TermFormValues;
  onFieldChange: <K extends keyof TermFormValues>(key: K, value: TermFormValues[K]) => void;
  canManageRelationships: boolean;
  relationshipDrafts: RelationshipDraft[];
  onRelationshipDraftsChange: (drafts: RelationshipDraft[]) => void;
  collectionTerms: Pick<LibraryTerm, "id" | "term">[];
  sourceTermId: string | undefined;
};

type FieldsProps = {
  form: TermFormValues;
  onFieldChange: <K extends keyof TermFormValues>(key: K, value: TermFormValues[K]) => void;
};

export function CategoryField({
  form,
  onFieldChange,
  required,
}: FieldsProps & { required?: boolean }) {
  return (
    <FormField label="Category (optional)" htmlFor="term-category">
      <TextInput
        id="term-category"
        value={form.category}
        onChange={(event) => onFieldChange("category", event.target.value)}
        placeholder="e.g. Architecture"
        required={required}
      />
    </FormField>
  );
}

const OPTIONAL_FIELDS = [
  { key: "example", id: "term-example", label: "Example (optional)" },
  {
    key: "mental_model",
    id: "term-mental-model",
    label: "Mental model (optional)",
  },
  { key: "discussion", id: "term-discussion", label: "In practice (optional)" },
  {
    key: "anti_example",
    id: "term-anti-example",
    label: "Anti-example (optional)",
  },
  { key: "controversy", id: "term-controversy", label: "Debated (optional)" },
  { key: "note", id: "term-note", label: "Note (optional)" },
] as const;

export function OptionalDetailFields({ form, onFieldChange }: FieldsProps) {
  return (
    <>
      {OPTIONAL_FIELDS.map((field) => (
        <FormField key={field.key} label={field.label} htmlFor={field.id}>
          <TextArea
            id={field.id}
            value={form[field.key] ?? ""}
            rows={2}
            onChange={(event) => onFieldChange(field.key, event.target.value)}
          />
        </FormField>
      ))}
    </>
  );
}

export function TermFormFields({
  form,
  onFieldChange,
  canManageRelationships,
  relationshipDrafts,
  onRelationshipDraftsChange,
  collectionTerms,
  sourceTermId,
}: TermFormFieldsProps) {
  return (
    <div className="min-h-0 flex flex-col gap-3 overflow-y-auto">
      <FormField label="Term" htmlFor="term-name">
        <TextInput
          id="term-name"
          value={form.term}
          onChange={(event) => onFieldChange("term", event.target.value)}
          placeholder="e.g. Coupling"
          required
        />
      </FormField>

      <CategoryField form={form} onFieldChange={onFieldChange} />

      <FormField label="Definition" htmlFor="term-definition">
        <TextArea
          id="term-definition"
          value={form.definition}
          rows={3}
          onChange={(event) => onFieldChange("definition", event.target.value)}
          placeholder="What does this term mean?"
          required
        />
      </FormField>

      <OptionalDetailFields form={form} onFieldChange={onFieldChange} />

      {canManageRelationships ? (
        <TermRelationshipsEditor
          drafts={relationshipDrafts}
          onChange={onRelationshipDraftsChange}
          collectionTerms={collectionTerms}
          sourceTermId={sourceTermId}
        />
      ) : null}
    </div>
  );
}
