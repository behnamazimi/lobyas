import { CollectionPicker } from "@/components/capture/collection-picker";
import type { ClipboardEvent, Ref } from "react";
import { FormField, PageHeader, TextArea, TextInput } from "@/components/kit";
import { CAPTURE_COPY } from "@/lib/capture/copy";
import type { ImportDestination } from "@/lib/import/import-collections";

export function CaptureHeader({
  backHref,
  collections,
  selectedId,
  onSelect,
}: {
  backHref: string;
  collections: ImportDestination[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <PageHeader
      title={CAPTURE_COPY.title}
      backHref={backHref}
      action={
        selectedId ? (
          <CollectionPicker collections={collections} selectedId={selectedId} onSelect={onSelect} />
        ) : undefined
      }
    />
  );
}

export function DefinitionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField label={CAPTURE_COPY.definition} htmlFor="capture-definition">
      <TextArea
        id="capture-definition"
        value={value}
        rows={2}
        placeholder={CAPTURE_COPY.definitionPlaceholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="m-0 text-[13px] leading-snug font-semibold text-muted">
        {CAPTURE_COPY.definitionHint}
      </p>
    </FormField>
  );
}

export function TermField({
  inputRef,
  value,
  onChange,
  onPaste,
}: {
  inputRef: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <FormField label={CAPTURE_COPY.term} htmlFor="capture-term">
      <TextInput
        id="capture-term"
        ref={inputRef}
        value={value}
        autoFocus
        className="h-14 font-heading text-[22px] font-extrabold"
        placeholder={CAPTURE_COPY.termPlaceholder}
        onChange={(event) => onChange(event.target.value)}
        onPaste={onPaste}
      />
    </FormField>
  );
}
