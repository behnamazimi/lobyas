"use client";

import { Button } from "react-aria-components";
import { BookmarkMinus, CheckCircle2, Ellipsis, Flag, Plus } from "lucide-react";
import { collectionLetter } from "@/components/app/shell/collection-look";
import { Pill, Tile } from "@/components/kit";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { REPORTED_THANKS } from "@/lib/collections/moderation";
import { LoveButton } from "./love-button";
import type { SharedCollection } from "@/lib/terms/types";
import { pluralize } from "@/lib/utils";

type SharedCollectionCardProps = {
  collection: SharedCollection;
  busy: boolean;
  /** Added from this page a moment ago: offers what to do next. */
  justAdded?: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onToggleLove: () => void;
  onReport: () => void;
};

export function SharedCollectionCard({
  collection,
  busy,
  justAdded = false,
  onAdd,
  onRemove,
  onToggleLove,
  onReport,
}: SharedCollectionCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-base-100 p-4 shadow-card">
      <div className="contents">
        <div className="flex items-center gap-3">
          <Tile tone="read" serif>
            {collection.icon || collectionLetter(collection.name)}
          </Tile>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 truncate font-sans text-base font-extrabold">{collection.name}</h2>
            <p className="m-0 text-[13px] font-bold text-muted tabular-nums">
              {pluralize(collection.termCount, "term")}
            </p>
          </div>
        </div>
        {collection.description ? (
          <p className="m-0 line-clamp-2 text-sm leading-snug font-semibold text-ink-soft">
            {collection.description}
          </p>
        ) : null}
        <div className="-mb-1 flex items-center gap-1">
          <LoveButton
            loved={collection.lovedByMe}
            count={collection.loveCount}
            onToggle={onToggleLove}
          />
          <div className="ms-auto flex items-center gap-1">
            {collection.inCollection ? (
              <Pill href={`/app/library?collection=${collection.id}`} variant="soft">
                <CheckCircle2 className="size-4 text-success-text" strokeWidth={2.3} aria-hidden />
                In library
              </Pill>
            ) : (
              <Pill data-tour="browse-add" onClick={onAdd} disabled={busy}>
                <Plus className="size-4" strokeWidth={2.6} aria-hidden />
                Add
              </Pill>
            )}
            {collection.inCollection || !collection.isBuiltin ? (
              <DropdownMenuTrigger>
                <Button
                  className="flex size-11 items-center justify-center rounded-full text-muted"
                  aria-label="More actions"
                >
                  <Ellipsis className="size-5" aria-hidden strokeWidth={2.3} />
                </Button>
                <DropdownMenu className="min-w-[200px]" placement="bottom end">
                  {collection.inCollection ? (
                    <DropdownMenuItem isDisabled={busy} onAction={onRemove}>
                      <BookmarkMinus className="h-4 w-4" />
                      Remove from library
                    </DropdownMenuItem>
                  ) : null}
                  {collection.isBuiltin ? null : (
                    <DropdownMenuItem isDisabled={collection.reportedByMe} onAction={onReport}>
                      <Flag className="h-4 w-4" />
                      {collection.reportedByMe ? REPORTED_THANKS : "Report collection"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenu>
              </DropdownMenuTrigger>
            ) : null}
          </div>
        </div>
        {justAdded && collection.inCollection ? (
          <div
            role="status"
            className="flex flex-col gap-2 rounded-2xl bg-success-tint px-4 py-3 text-success-text"
          >
            <p className="m-0 text-sm font-extrabold">Added to your library.</p>
            <div className="flex flex-wrap gap-2">
              <Pill href={`/app/triage?collection=${collection.id}`} variant="secondary">
                Sort what you know
              </Pill>
              <Pill href={`/app/read?collection=${collection.id}`}>Start reading</Pill>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
