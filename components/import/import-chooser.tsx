"use client";

import { FolderPlus, LayoutGrid, NotebookText, Plus } from "lucide-react";
import { useState } from "react";
import { Card, Divider, ListRow, Pill, SearchField, SECTION_TITLE } from "@/components/kit";
import { CreateCollectionDialog } from "@/components/library/create-collection-dialog";
import { RequestRow } from "@/components/requests/request-row";
import { useBrowseSearch } from "@/hooks/use-browse-search";
import { SearchResults } from "@/components/import/chooser-search-results";
import { cn } from "@/lib/utils";
import { REQUEST_COPY } from "@/lib/requests/copy";
import type { RequestEntry } from "@/lib/requests/entry";
import type { ImportDestination } from "@/lib/import/import-collections";

const ICON = "size-5";

export function ImportChooser({
  collections,
  requestEntry,
}: {
  collections: ImportDestination[];
  requestEntry: RequestEntry;
}) {
  const { query, search, addingId, addedIds, handleQuery, add } = useBrowseSearch();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3" data-tour="import-search">
        <SearchField
          value={query}
          onChange={handleQuery}
          label="What do you want to learn?"
          className="h-[52px] rounded-2xl"
        />
        <SearchResults
          state={search}
          addingId={addingId}
          addedIds={addedIds}
          onAdd={(id) => void add(id)}
          noMatchMessage={
            requestEntry.state === "available" ? REQUEST_COPY.chooser.noMatch : undefined
          }
        />
        <RequestRow
          entry={requestEntry}
          query={search.status === "done" || search.status === "error" ? query : ""}
        />
      </section>

      <section
        className="flex flex-col gap-3"
        data-tour="import-routes"
        aria-labelledby="start-own"
      >
        <h2 id="start-own" className={cn(SECTION_TITLE, "mt-1")}>
          Or start your own
        </h2>
        <Card radius="md" className="px-3 py-1">
          <ListRow
            href="/app/import/paste"
            tone="read"
            icon={<NotebookText className={ICON} aria-hidden />}
            label="Paste a list"
            subline="From a doc, a sheet or your notes"
          />
          <Divider />
          <ListRow
            href="/app/import/apps"
            tone="review"
            icon={<LayoutGrid className={ICON} aria-hidden />}
            label="From another app"
            subline="Quizlet, Anki, Google Translate and more"
          />
          <Divider />
          <ListRow
            href="/app/capture"
            tone="success"
            icon={<Plus className={ICON} aria-hidden />}
            label="One term"
            subline="Save a single term in a few seconds"
          />
          <Divider />
          <ListRow
            onPress={() => setCreateOpen(true)}
            tone="quiz"
            icon={<FolderPlus className={ICON} aria-hidden />}
            label="Start an empty collection"
            subline="Name it now and add terms later"
          />
        </Card>
      </section>

      <div className="flex justify-center">
        <Pill variant="ghost" href="/app/import/more">
          More ways to add
        </Pill>
      </div>

      <CreateCollectionDialog
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        existingCollections={collections}
      />
    </div>
  );
}
