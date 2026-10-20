"use client";

import { Banner, ChoiceCards, Pill } from "@/components/kit";
import type { ImportFlowState } from "@/components/import/use-import-flow";
import { pluralize } from "@/lib/utils";

const NOTE = "m-0 text-[13px] leading-snug font-semibold text-muted";

export function ConflictChooser({ flow }: { flow: ImportFlowState }) {
  const conflicts = (flow.built?.conflicts ?? []).filter(
    (conflict) => !flow.resolved.includes(conflict.termId),
  );
  if (conflicts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {conflicts.map((conflict) => (
        <Banner key={conflict.termId}>
          <p className="m-0 mb-2">
            &ldquo;{conflict.term}&rdquo; appears twice with different definitions. Keep which?
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {conflict.definitions.map((definition, index) => (
              <li key={`${conflict.termId}-${index}`}>
                <Pill
                  variant="secondary"
                  className="h-auto min-h-11 w-full justify-between gap-2 py-2 text-left whitespace-normal"
                  onClick={() => flow.chooseDefinition(conflict.termId, definition)}
                >
                  <span className="line-clamp-2">{definition ?? "No definition"}</span>
                  <span className="shrink-0 text-xs">Keep this one</span>
                </Pill>
              </li>
            ))}
          </ul>
        </Banner>
      ))}
    </div>
  );
}

export function DuplicatePolicy({ flow }: { flow: ImportFlowState }) {
  const count = flow.summary.alreadyThere;
  if (count === 0) return null;
  const name = flow.existing?.name ?? "this collection";

  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 text-sm font-extrabold" role="status">
        {pluralize(count, "term")} {count === 1 ? "is" : "are"} already in {name}
      </p>
      <ChoiceCards
        label="What to do with terms already there"
        options={[
          { value: "skip", label: "Skip them" },
          { value: "update", label: "Update them" },
        ]}
        value={flow.check.policy}
        onChange={(key) => {
          if (key === "skip" || key === "update") flow.setPolicy(key);
        }}
      />
      <p className={NOTE}>
        Updating keeps your progress and never clears a value with an empty one. Different meaning?
        Add a qualifier, like &ldquo;SLA (legal)&rdquo;.
      </p>
    </div>
  );
}

export function Notices({ flow }: { flow: ImportFlowState }) {
  const notes: string[] = [];
  const collapsed = flow.built?.collapsed ?? 0;
  const withoutTerm = flow.built?.withoutTerm ?? 0;
  if (collapsed) notes.push(`Combined ${collapsed} repeated rows.`);
  if (withoutTerm) {
    notes.push(
      `${pluralize(withoutTerm, "line")} had no term and ${
        withoutTerm === 1 ? "was" : "were"
      } left out.`,
    );
  }
  if (notes.length === 0) return null;
  return (
    <p className={NOTE} role="status">
      {notes.join(" ")}
    </p>
  );
}
