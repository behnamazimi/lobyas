"use client";

import { PageHeader } from "@/components/kit";
import { StepBar } from "@/components/import/step-bar";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { CheckStep } from "@/components/import/check-step";
import { PasteStep } from "@/components/import/paste-step";
import type { ImportAdapter } from "@/components/import/import-flow-helpers";
import { useImportFlow } from "@/components/import/use-import-flow";
import type { ImportDestination } from "@/lib/import/import-collections";
import type { CommitImportInput } from "@/lib/import/commit-schema";

type ImportFlowProps = {
  collections: ImportDestination[];
  addedNames: string[];
  presetCollectionId?: string;
  entry: CommitImportInput["entry"];
  /** Go straight to Check, for a list that was pasted somewhere else. */
  autoCheck?: boolean;
  adapter?: ImportAdapter;
  /** Where the Paste step's back button goes. Without it the page draws its own header. */
  backHref?: string;
};

/** Paste a list, check it, add it. */
export function ImportFlow({
  collections,
  addedNames,
  presetCollectionId,
  entry,
  autoCheck = false,
  adapter,
  backHref,
}: ImportFlowProps) {
  const flow = useImportFlow({
    collections,
    presetCollectionId,
    entry,
    adapter,
  });
  useMountEffect(() => {
    if (autoCheck && flow.draft) flow.checkText(flow.draft, undefined);
  });

  if (flow.step === "check") return <CheckStep flow={flow} addedNames={addedNames} />;

  return (
    <>
      {backHref ? <PageHeader title="Paste a list" backHref={backHref} /> : null}
      <StepBar current={0} />
      <PasteStep
        draft={flow.draft}
        problem={flow.problem}
        onTextChange={(text) => {
          flow.clearProblem();
          flow.setDraftText(text);
        }}
        onCheck={(text, html) => flow.checkText(text, html)}
        onTreatAsText={() => {
          flow.checkText(flow.draft, flow.html, {
            ...flow.options,
            treatAsText: true,
          });
        }}
        onProblem={(message) => flow.setProblem({ message })}
      />
    </>
  );
}
