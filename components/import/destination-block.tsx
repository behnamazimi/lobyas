"use client";

import { Banner, ChoiceCards, FormField, Pill, SelectInput, TextInput } from "@/components/kit";
import { KindToggle } from "@/components/shared/kind-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import type { DestinationMode } from "@/components/import/use-import-flow";
import type { ImportDestination } from "@/lib/import/import-collections";
import { findSimilarName } from "@/lib/import/similar-name";
import type { CollectionKind } from "@/lib/terms/kinds";
import { COLLECTION_LANGUAGE_OPTIONS, type CollectionLanguage } from "@/lib/terms/languages";
import { pluralize } from "@/lib/utils";

const NOTE = "m-0 text-[13px] font-semibold text-muted";

type DestinationBlockProps = {
  collections: ImportDestination[];
  addedNames: string[];
  mode: DestinationMode;
  newName: string;
  language: CollectionLanguage;
  kind: CollectionKind | null;
  existingId: string;
  disabled: boolean;
  /** What the pasted text looks like, for a soft hint. */
  guessedLanguage: CollectionLanguage | null;
  fileLanguage: CollectionLanguage | null;
  onModeChange: (mode: DestinationMode, existingId?: string) => void;
  onNameChange: (name: string) => void;
  onLanguageChange: (language: CollectionLanguage) => void;
  onKindChange: (kind: CollectionKind) => void;
};

function languageLabel(language: CollectionLanguage) {
  return COLLECTION_LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? language;
}

function languageHint(
  mode: DestinationMode,
  language: CollectionLanguage,
  guessed: CollectionLanguage | null,
  existingName: string | undefined,
): string | null {
  if (!guessed || guessed === language) return null;
  const guessedLabel = languageLabel(guessed);
  if (mode === "existing") {
    return `These terms look ${guessedLabel}, but ${
      existingName ? `"${existingName}"` : "this collection"
    } is set to ${languageLabel(language)}.`;
  }
  return `This list looks ${guessedLabel}. Choose ${guessedLabel} above if that's right.`;
}

type NewFieldsProps = Pick<
  DestinationBlockProps,
  | "collections"
  | "addedNames"
  | "newName"
  | "language"
  | "kind"
  | "disabled"
  | "fileLanguage"
  | "onModeChange"
  | "onNameChange"
  | "onLanguageChange"
  | "onKindChange"
>;

function NewCollectionFields({
  collections,
  addedNames,
  newName,
  language,
  kind,
  disabled,
  fileLanguage,
  onModeChange,
  onNameChange,
  onLanguageChange,
  onKindChange,
}: NewFieldsProps) {
  const similar = findSimilarName(
    newName,
    collections.map((c) => c.name),
  );
  const similarCollection = similar && collections.find((c) => c.name === similar.name);
  const addedMatch = newName.trim()
    ? addedNames.find((name) => name.trim().toLowerCase() === newName.trim().toLowerCase())
    : undefined;

  return (
    <>
      <FormField label="Name" htmlFor="import-name">
        <TextInput
          id="import-name"
          value={newName}
          disabled={disabled}
          placeholder="e.g. Startup finance"
          onChange={(event) => onNameChange(event.target.value)}
        />
      </FormField>
      {similar && similarCollection ? (
        <Banner
          action={
            <Pill
              variant="secondary"
              onClick={() => onModeChange("existing", similarCollection.id)}
            >
              Add to it
            </Pill>
          }
        >
          You already have &ldquo;{similar.name}&rdquo;. Add to it instead?
        </Banner>
      ) : null}
      {addedMatch ? (
        <p className={NOTE} role="status">
          You added a collection called &ldquo;{addedMatch}&rdquo;. This creates your own.
        </p>
      ) : null}
      <FormField label="Language">
        <LanguageToggle value={language} onChange={onLanguageChange} isDisabled={disabled} />
      </FormField>
      {fileLanguage && fileLanguage !== language ? (
        <p className={NOTE} role="status">
          The file says {languageLabel(fileLanguage)}, you chose {languageLabel(language)}. Your
          choice is used.
        </p>
      ) : null}
      <FormField label="What it teaches">
        <KindToggle value={kind} onChange={onKindChange} isDisabled={disabled} />
      </FormField>
    </>
  );
}

export function DestinationBlock({
  collections,
  addedNames,
  mode,
  newName,
  language,
  kind,
  existingId,
  disabled,
  guessedLanguage,
  fileLanguage,
  onModeChange,
  onNameChange,
  onLanguageChange,
  onKindChange,
}: DestinationBlockProps) {
  const existing = collections.find((collection) => collection.id === existingId);
  const effectiveLanguage = mode === "existing" && existing ? existing.language : language;
  const hint = languageHint(mode, effectiveLanguage, guessedLanguage, existing?.name);

  return (
    <div className="flex flex-col gap-3">
      <FormField label="Add to">
        <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
          <ChoiceCards
            label="Where to add"
            options={[
              { value: "new", label: "New collection" },
              ...(collections.length > 0 ? [{ value: "existing", label: "Existing one" }] : []),
            ]}
            value={mode}
            onChange={(key) => {
              if (key === "new" || key === "existing") onModeChange(key);
            }}
          />
        </div>
      </FormField>

      {mode === "new" ? (
        <NewCollectionFields
          collections={collections}
          addedNames={addedNames}
          newName={newName}
          language={language}
          kind={kind}
          disabled={disabled}
          fileLanguage={fileLanguage}
          onModeChange={onModeChange}
          onNameChange={onNameChange}
          onLanguageChange={onLanguageChange}
          onKindChange={onKindChange}
        />
      ) : (
        <>
          <FormField label="Collection" htmlFor="import-existing">
            <SelectInput
              id="import-existing"
              value={existingId}
              disabled={disabled}
              onChange={(event) => onModeChange("existing", event.target.value)}
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name} · {pluralize(collection.termCount, "term")}
                </option>
              ))}
            </SelectInput>
          </FormField>
          {existing ? (
            <p className={NOTE}>
              Language: {languageLabel(existing.language)} (set by this collection)
            </p>
          ) : null}
        </>
      )}

      {hint ? (
        <p className={NOTE} role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
