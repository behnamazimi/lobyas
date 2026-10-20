"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FormField, PageHeader, PinnedAction, Pill, StatTile, TextInput } from "@/components/kit";
import { CheckList } from "@/components/import/check-list";
import { ConflictChooser, DuplicatePolicy, Notices } from "@/components/import/check-extras";
import { DestinationBlock } from "@/components/import/destination-block";
import { FixedDestinationNote, UnfinishedNote } from "@/components/import/fixed-destination";
import { EditTermDialog } from "@/components/import/edit-term-dialog";
import { ImportFailurePanel } from "@/components/import/import-errors";
import { ColumnRoles } from "@/components/import/column-roles";
import { SeparatorChips } from "@/components/import/separator-chips";
import { StepBar } from "@/components/import/step-bar";
import type { ImportFlowState } from "@/components/import/use-import-flow";
import { activeDrafts } from "@/lib/import/check-state";
import { guessLanguage } from "@/lib/import/parse/dutch-hint";
import { guessScriptLanguage } from "@/lib/import/parse/script-hint";
import { readAsLine } from "@/lib/import/read-as";
import { pluralize } from "@/lib/utils";

function commitLabel(flow: ImportFlowState) {
  if (flow.adapter) return flow.adapter.commitLabel(flow.summary, flow.isCommitting);
  if (flow.isCommitting) return "Adding…";
  const { toAdd, toFinish } = flow.summary;
  if (toAdd === 0) return "Add terms";
  const base = `Add ${pluralize(toAdd, "term")}`;
  return toFinish > 0 ? `${base} · ${toFinish} to finish later` : base;
}

export function CheckStep({ flow, addedNames }: { flow: ImportFlowState; addedNames: string[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const drafts = activeDrafts(flow.check);
  const guessed =
    guessScriptLanguage(drafts.map((d) => d.term)) ??
    guessLanguage(drafts.flatMap((d) => [d.term, d.definition ?? ""]));
  const editingDraft = flow.check.drafts.find((d) => d.id === editing) ?? null;
  const { toAdd, toFinish, updated, alreadyThere } = flow.summary;

  return (
    <>
      <PageHeader title={`Check ${pluralize(drafts.length, "term")}`} onBack={flow.backToPaste} />
      <StepBar current={flow.isCommitting ? 2 : 1} />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <StatTile tone="success" value={Math.max(toAdd - toFinish - updated, 0)} label="New" />
          <StatTile tone="hard" value={alreadyThere} label="Already there" />
          <StatTile value={toFinish} label="Unfinished" />
        </div>

        <div>
          <p className="m-0 text-[13px] font-bold text-muted">Read as: {readAsLine(flow.parsed)}</p>
          {flow.parsed ? (
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-extrabold text-read-text [&::-webkit-details-marker]:hidden">
                Change how it&apos;s read
                <ChevronDown
                  className="size-4 transition-transform group-open:rotate-180"
                  aria-hidden
                  strokeWidth={2.6}
                />
              </summary>
              <div className="flex flex-col gap-4 pb-2">
                <SeparatorChips
                  parsed={flow.parsed}
                  options={flow.options}
                  onOptionsChange={flow.changeOptions}
                />
                <ColumnRoles
                  parsed={flow.parsed}
                  onRolesChange={(roles) => flow.changeOptions({ roles })}
                />
              </div>
            </details>
          ) : null}
        </div>

        {flow.adapter ? (
          <FixedDestinationNote flow={flow} />
        ) : (
          <DestinationBlock
            collections={flow.collections}
            addedNames={addedNames}
            mode={flow.mode}
            newName={flow.newName}
            language={flow.language}
            kind={flow.kind}
            existingId={flow.existingId}
            disabled={flow.isCommitting}
            guessedLanguage={guessed}
            fileLanguage={flow.json?.language ?? null}
            onModeChange={flow.setDestination}
            onNameChange={flow.setNewName}
            onLanguageChange={flow.setLanguage}
            onKindChange={flow.setKind}
          />
        )}

        <FormField label="Category for these terms (optional)" htmlFor="import-category">
          <TextInput
            id="import-category"
            value={flow.check.category}
            placeholder="e.g. Finance"
            onChange={(event) => flow.setCategory(event.target.value)}
          />
        </FormField>

        <UnfinishedNote flow={flow} />
        <Notices flow={flow} />
        <ConflictChooser flow={flow} />
        <DuplicatePolicy flow={flow} />
        <CheckList flow={flow} onEdit={setEditing} />

        {flow.failure ? <ImportFailurePanel failure={flow.failure} /> : null}
      </div>

      <PinnedAction>
        <Pill size="lg" disabled={!flow.canAdd || flow.isCommitting} onClick={flow.commit}>
          {commitLabel(flow)}
        </Pill>
        {toAdd === 0 && drafts.length > 0 ? (
          <p className="m-0 mt-2 text-center text-sm font-semibold text-muted" role="status">
            Every term is already in this collection.
          </p>
        ) : null}
      </PinnedAction>

      <EditTermDialog
        draft={editingDraft}
        onClose={() => setEditing(null)}
        onSave={flow.editCard}
      />
    </>
  );
}
