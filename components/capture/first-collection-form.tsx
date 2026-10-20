"use client";

import { track } from "@/lib/analytics/track";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { KindToggle } from "@/components/shared/kind-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { FormField, PinnedAction, Pill, TextInput } from "@/components/kit";
import { useCollectionActions } from "@/hooks/use-collection-actions";
import { CAPTURE_COPY } from "@/lib/capture/copy";
import type { CollectionKind } from "@/lib/terms/kinds";
import type { CollectionLanguage } from "@/lib/terms/languages";

/** For someone with no collection yet: create one, then reload this page with it chosen. */
export function FirstCollectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createEmptyCollection, isBusy, error } = useCollectionActions();
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<CollectionLanguage>("en");
  const [kind, setKind] = useState<CollectionKind | null>(null);
  const canCreate = name.trim().length > 0 && kind !== null && !isBusy;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canCreate || !kind) return;
    await createEmptyCollection({ name: name.trim(), language, kind }, (collectionId) => {
      track("collection_created", {
        language,
        kind,
        creation_source: "first_capture",
      });
      const params = new URLSearchParams(searchParams.toString());
      params.set("to", collectionId);
      router.replace(`/app/capture?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <div>
        <h2 className="m-0 font-sans text-lg font-extrabold">{CAPTURE_COPY.firstTitle}</h2>
        <p className="m-0 text-[15px] font-semibold text-muted">{CAPTURE_COPY.firstBody}</p>
      </div>
      <FormField label={CAPTURE_COPY.firstName} htmlFor="first-collection-name">
        <TextInput
          id="first-collection-name"
          value={name}
          maxLength={100}
          placeholder={CAPTURE_COPY.firstNamePlaceholder}
          disabled={isBusy}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
      <FormField label={CAPTURE_COPY.language}>
        <LanguageToggle value={language} onChange={setLanguage} isDisabled={isBusy} />
      </FormField>
      <FormField label={CAPTURE_COPY.kind}>
        <KindToggle value={kind} onChange={setKind} isDisabled={isBusy} />
      </FormField>
      {error ? (
        <p className="m-0 text-sm font-bold text-wrong-text" role="alert">
          {error}
        </p>
      ) : null}
      <PinnedAction>
        <Pill size="lg" type="submit" disabled={!canCreate}>
          {isBusy ? CAPTURE_COPY.creating : CAPTURE_COPY.firstCreate}
        </Pill>
      </PinnedAction>
    </form>
  );
}
