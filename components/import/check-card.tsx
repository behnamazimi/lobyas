"use client";

import { X } from "lucide-react";
import { ChoiceCards, IconButton } from "@/components/kit";
import type { DestinationMatch, DuplicatePolicy } from "@/lib/import/check-state";
import type { DraftTerm } from "@/lib/import/parse/types";
import { cn } from "@/lib/utils";

type CheckCardProps = {
  draft: DraftTerm;
  match: DestinationMatch | undefined;
  policy: DuplicatePolicy;
  onEdit: () => void;
  onRemove: () => void;
  onPolicyChange: (policy: DuplicatePolicy | null) => void;
};

const BADGE = "flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-extrabold";

export function CheckCard({
  draft,
  match,
  policy,
  onEdit,
  onRemove,
  onPolicyChange,
}: CheckCardProps) {
  const updating = match && policy === "update";

  return (
    <li className="content-visibility-auto border-b border-line py-1 last:border-b-0 [contain-intrinsic-size:auto_4rem]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="min-h-11 min-w-0 flex-1 rounded-xl py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-base-content"
          aria-label={`Edit "${draft.term}"`}
          onClick={onEdit}
        >
          <span className="block truncate text-[15px] font-extrabold">{draft.term}</span>
          {updating ? (
            <span className="mt-1 grid gap-1 text-[13px] font-semibold">
              <span className="text-muted">
                <span className="font-extrabold">Now: </span>
                {match.definition ?? "No definition yet"}
              </span>
              <span>
                <span className="font-extrabold">New: </span>
                {draft.definition ?? "No definition. The current one stays."}
              </span>
            </span>
          ) : (
            <span
              className={cn(
                "block text-[13px] font-semibold text-muted",
                draft.definition ? "line-clamp-2" : "text-hard-text",
              )}
            >
              {draft.definition ?? "No definition yet · Add one"}
            </span>
          )}
        </button>
        {match ? (
          <span className={cn(BADGE, "bg-hard-tint text-hard-text")}>Already there</span>
        ) : draft.definition ? (
          <span className={cn(BADGE, "bg-success-tint text-success-text")}>New</span>
        ) : (
          <span className={cn(BADGE, "bg-base-200 text-ink-soft")}>Unfinished</span>
        )}
        <IconButton label={`Remove "${draft.term}"`} onClick={onRemove}>
          <X className="size-4" strokeWidth={2.6} aria-hidden />
        </IconButton>
      </div>
      {match ? (
        <div className="pb-2">
          <ChoiceCards
            label={`What to do with "${draft.term}"`}
            options={[
              { value: "skip", label: "Skip" },
              { value: "update", label: "Update" },
            ]}
            value={policy}
            onChange={(key) => {
              if (key === "skip" || key === "update") onPolicyChange(key);
            }}
          />
        </div>
      ) : null}
    </li>
  );
}
