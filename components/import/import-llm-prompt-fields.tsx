import { FormField, SelectInput, TextArea, TextInput } from "@/components/kit";
import type { ImportDestination } from "@/lib/import/import-collections";
import { DEFAULT_COUNT, NEW_COLLECTION_KEY } from "@/components/import/import-llm-prompt-helpers";

type ImportLlmPromptFieldsProps = {
  collections: ImportDestination[];
  loadError: string | null;
  isLoadingTerms: boolean;
  selectedCollectionId: string;
  onCollectionChange: (key: string) => void;
  collectionName: string;
  onCollectionNameChange: (value: string) => void;
  count: string;
  onCountChange: (value: string) => void;
  exclude: string;
  onExcludeChange: (value: string) => void;
};

export function ImportLlmPromptFields({
  collections,
  loadError,
  isLoadingTerms,
  selectedCollectionId,
  onCollectionChange,
  collectionName,
  onCollectionNameChange,
  count,
  onCountChange,
  exclude,
  onExcludeChange,
}: ImportLlmPromptFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      {collections.length > 0 ? (
        <FormField label="Add to collection" htmlFor="import-skill-collection">
          <SelectInput
            id="import-skill-collection"
            value={selectedCollectionId}
            onChange={(event) => onCollectionChange(event.target.value)}
          >
            <option value={NEW_COLLECTION_KEY}>New collection</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </SelectInput>
          {loadError ? <p className="m-0 text-xs font-bold text-wrong-text">{loadError}</p> : null}
        </FormField>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem]">
        <FormField label="Collection name" htmlFor="import-skill-collection-name">
          <TextInput
            id="import-skill-collection-name"
            value={collectionName}
            onChange={(event) => onCollectionNameChange(event.target.value)}
            placeholder="e.g. Product Management"
          />
        </FormField>

        <FormField label="Count" htmlFor="import-skill-count">
          <TextInput
            id="import-skill-count"
            inputMode="numeric"
            value={count}
            onChange={(event) => onCountChange(event.target.value)}
            placeholder={String(DEFAULT_COUNT)}
            className="tabular-nums"
          />
        </FormField>
      </div>

      <FormField label="Exclude terms" htmlFor="import-skill-exclude">
        <TextArea
          id="import-skill-exclude"
          value={exclude}
          onChange={(event) => onExcludeChange(event.target.value)}
          placeholder={isLoadingTerms ? "Loading terms…" : "e.g. Agile, Scrum, OKR"}
          rows={2}
        />
      </FormField>
    </div>
  );
}
