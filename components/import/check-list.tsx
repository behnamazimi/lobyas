"use client";

import { Banner, Card, Chip, Pill } from "@/components/kit";
import { CheckCard } from "@/components/import/check-card";
import type { CardFilter, ImportFlowState } from "@/components/import/use-import-flow";
import { activeDrafts, effectivePolicy, matchFor } from "@/lib/import/check-state";
import { pluralize } from "@/lib/utils";

function summaryLine(flow: ImportFlowState) {
  const { toAdd, toFinish, updated, alreadyThere } = flow.summary;
  return [
    `${pluralize(toAdd - toFinish - updated, "term")} ready`,
    toFinish > 0 ? `${toFinish} without a definition` : null,
    alreadyThere > 0 ? `${alreadyThere} already in this collection` : null,
    flow.checking ? "Checking…" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function RemovedNotice({ flow }: { flow: ImportFlowState }) {
  const removed = flow.check.drafts.find(
    (draft) => draft.id === flow.lastRemoved && flow.check.removedIds.includes(draft.id),
  );
  if (!removed) return null;

  return (
    <Banner
      action={
        <Pill variant="secondary" onClick={() => flow.restoreCard(removed.id)}>
          Restore
        </Pill>
      }
    >
      Removed &ldquo;{removed.term}&rdquo;
    </Banner>
  );
}

/** The summary, the filter chips and one card per term. When nothing needs a
 *  look, only a compact "ready" line shows. */
export function CheckList({
  flow,
  onEdit,
}: {
  flow: ImportFlowState;
  onEdit: (id: string) => void;
}) {
  const drafts = activeDrafts(flow.check);
  const { toFinish, alreadyThere, toAdd } = flow.summary;
  const quiet = toFinish === 0 && alreadyThere === 0 && (flow.built?.conflicts.length ?? 0) === 0;

  if (!flow.reviewAll && quiet && drafts.length > 0) {
    return (
      <Card radius="md" className="flex items-center justify-between gap-3 px-4 py-1">
        <p className="m-0 text-[15px] font-extrabold" role="status">
          {pluralize(toAdd, "term")} ready
        </p>
        <Pill variant="ghost" onClick={() => flow.setReviewAll(true)}>
          Review all
        </Pill>
      </Card>
    );
  }

  const visible = drafts.filter((draft) => {
    if (flow.filter === "attention") return !draft.definition;
    if (flow.filter === "there") return Boolean(matchFor(flow.check, draft));
    return true;
  });

  const filters: { id: CardFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "attention", label: "Needs a look" },
    { id: "there", label: "Already there" },
  ];

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="m-0 text-sm font-extrabold" role="status">
          {summaryLine(flow)}
        </p>
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Chip
              key={item.id}
              selected={flow.filter === item.id}
              onPress={() => flow.setFilter(item.id)}
            >
              {item.label}
            </Chip>
          ))}
        </div>
      </div>

      <RemovedNotice flow={flow} />

      <Card radius="md" className="px-4 py-1">
        <ul className="m-0 list-none p-0">
          {visible.map((draft) => (
            <CheckCard
              key={draft.id}
              draft={draft}
              match={matchFor(flow.check, draft)}
              policy={effectivePolicy(flow.check, draft)}
              onEdit={() => onEdit(draft.id)}
              onRemove={() => flow.removeCard(draft.id)}
              onPolicyChange={(policy) => flow.setOverride(draft.id, policy)}
            />
          ))}
        </ul>
      </Card>
    </>
  );
}
