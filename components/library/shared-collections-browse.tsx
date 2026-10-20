"use client";

import { useRef, useState } from "react";
import { ReportCollectionSheet } from "@/components/library/report-collection-sheet";
import { SharedCollectionCard } from "@/components/library/shared-collection-card";
import { SharedCollectionsFilterBar } from "@/components/library/shared-collections-filter-bar";
import {
  SharedCollectionsEmptyCatalog,
  SharedCollectionsEmptyGroup,
  SharedCollectionsNoMatches,
} from "@/components/library/shared-collections-empty-states";
import { setCollectionLove } from "@/app/(private)/app/actions";
import { useToast } from "@/components/ui/toast";
import { useCollectionActions } from "@/hooks/use-collection-actions";
import { useSharedCollectionsBrowse } from "@/hooks/use-shared-collections-browse";
import { useSlashToFocus } from "@/hooks/use-slash-to-focus";
import type { BrowseGroup, BrowsePageResult } from "@/lib/library/browse";
import type { RequestEntry } from "@/lib/requests/entry";
import { cn } from "@/lib/utils";

type SharedCollectionsBrowseProps = {
  initialPage: BrowsePageResult;
  initialGroup: BrowseGroup;
  requestEntry: RequestEntry;
};

function EmptyResults({
  browse,
  allAdded,
  requestEntry,
  onClearFilters,
}: {
  browse: ReturnType<typeof useSharedCollectionsBrowse>;
  allAdded: boolean;
  requestEntry: RequestEntry;
  onClearFilters: () => void;
}) {
  if (browse.isRefreshing) return null;
  if (!browse.hasActiveFilters) {
    return <SharedCollectionsEmptyGroup group={browse.group} requestEntry={requestEntry} />;
  }
  return (
    <SharedCollectionsNoMatches
      group={browse.group}
      allAdded={allAdded}
      hasActiveFilters={browse.hasActiveFilters}
      onClearFilters={onClearFilters}
      onRetry={browse.retry}
      requestEntry={requestEntry}
      search={browse.searchInput}
    />
  );
}

export function SharedCollectionsBrowse({
  initialPage,
  initialGroup,
  requestEntry,
}: SharedCollectionsBrowseProps) {
  const { error, busyId, addToCollection, removeFromCollection } = useCollectionActions();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const browse = useSharedCollectionsBrowse({ initialPage, initialGroup });
  const { toast } = useToast();
  const [reporting, setReporting] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useSlashToFocus(searchInputRef);

  const [justAdded, setJustAdded] = useState<ReadonlySet<string>>(new Set());

  function setAddedNow(collectionId: string, added: boolean) {
    setJustAdded((current) => {
      const next = new Set(current);
      if (added) next.add(collectionId);
      else next.delete(collectionId);
      return next;
    });
  }

  async function handleAdd(collectionId: string) {
    const name = browse.collections.find((collection) => collection.id === collectionId)?.name;
    browse.markInCollection(collectionId, true);
    const ok = await addToCollection(collectionId);
    if (!ok) {
      browse.retry();
      return;
    }
    setAddedNow(collectionId, true);
    toast(name ? `Added "${name}"` : "Added to your library", "success");
  }

  async function handleRemove(collectionId: string) {
    browse.markInCollection(collectionId, false);
    setAddedNow(collectionId, false);
    const ok = await removeFromCollection(collectionId);
    if (!ok) browse.retry();
  }

  async function handleToggleLove(collectionId: string, loved: boolean) {
    browse.markLoved(collectionId, loved);
    const result = await setCollectionLove(collectionId, loved);
    if (result.error) {
      browse.markLoved(collectionId, !loved);
      toast(result.error, "destructive");
      return;
    }
    if (result.count !== undefined) browse.markLoved(collectionId, loved, result.count);
  }

  const allAdded =
    browse.filter === "available" &&
    browse.searchInput.trim() === "" &&
    browse.counts.available === 0 &&
    browse.counts.all > 0;
  const bannerError = error ?? browse.listError;

  if (browse.isEmptyCatalog) {
    return <SharedCollectionsEmptyCatalog bannerError={bannerError} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {bannerError ? (
        <p
          role="alert"
          className="m-0 rounded-2xl bg-wrong-tint px-3.5 py-3 text-sm font-bold text-wrong-text"
        >
          {bannerError}
        </p>
      ) : null}

      <SharedCollectionsFilterBar browse={browse} searchInputRef={searchInputRef} />

      <div role="region" aria-label="Collections" className="space-y-3">
        {browse.collections.length === 0 ? (
          <EmptyResults
            browse={browse}
            allAdded={allAdded}
            requestEntry={requestEntry}
            onClearFilters={() => {
              browse.clearFilters();
              searchInputRef.current?.focus();
            }}
          />
        ) : (
          <ul
            className={cn(
              "m-0 flex list-none flex-col gap-3 p-0",
              browse.isRefreshing && "opacity-70",
            )}
          >
            {browse.collections.map((collection) => (
              <li key={collection.id}>
                <SharedCollectionCard
                  collection={collection}
                  busy={busyId === collection.id}
                  justAdded={justAdded.has(collection.id)}
                  onAdd={() => void handleAdd(collection.id)}
                  onRemove={() => void handleRemove(collection.id)}
                  onToggleLove={() => void handleToggleLove(collection.id, !collection.lovedByMe)}
                  onReport={() => setReporting({ id: collection.id, name: collection.name })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {reporting ? (
        <ReportCollectionSheet
          collectionId={reporting.id}
          collectionName={reporting.name}
          onReported={() => browse.markReported(reporting.id)}
          onClose={() => setReporting(null)}
        />
      ) : null}

      {browse.nextOffset !== null ? (
        <div
          ref={browse.bindSentinel}
          data-browse-sentinel
          className="flex min-h-11 items-center justify-center py-3"
        >
          {browse.isLoadingMore ? (
            <span className="loading loading-spinner loading-sm text-base-content/70" />
          ) : (
            <span className="sr-only">Loading more collections</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
