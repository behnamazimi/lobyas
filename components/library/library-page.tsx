"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import type { LibraryPageData, LibraryTerm, Term } from "@/lib/terms/types";
import { loadTermDetails, TermDetailsScope } from "@/lib/library/details-store";
import { useLibraryList } from "@/hooks/use-library-list";
import { useMediaQuery } from "@/hooks/use-platform";
import { useSlashToFocus } from "@/hooks/use-slash-to-focus";
import { BottomSheet, Card, EmptyPanel, Pill } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { ImportedNotice, type ImportedSummary } from "@/components/import/imported-banner";
import { UnfinishedSection } from "@/components/terms/unfinished-section";
import { TermActionsSheet } from "@/components/terms/term-actions-sheet";
import { TermDetail } from "@/components/terms/term-detail";
import { TermList } from "@/components/terms/term-list";
import { TermRowDialogs } from "@/components/terms/term-row-dialogs";
import { CollectionRow } from "./collection-row";
import { LibraryCollectionHeader } from "./library-collection-header";
import { LibraryFilters } from "./library-filters";

/** From `lg` the term opens in a panel beside the list instead of a sheet. */
const DESKTOP_MEDIA = "(min-width: 1024px)";

type LibraryPageProps = {
  data: LibraryPageData;
  /** The filters cookie as the server read it, so both renders agree. */
  filtersCookie: string;
  /** What the import that just finished added (from ?added=). */
  importedSummary: Promise<ImportedSummary | undefined>;
};

/** One collection in the Library: header, filters and the term list. The
 *  collection switcher lives in the app shell; switching is a navigation. */
export function LibraryPage({ data, filtersCookie, importedSummary }: LibraryPageProps) {
  const [finishOpen, setFinishOpen] = useState(false);
  const [editing, setEditing] = useState<Term | null>(null);
  const [deleting, setDeleting] = useState<LibraryTerm | null>(null);
  const [actionsTerm, setActionsTerm] = useState<LibraryTerm | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA);

  const {
    collection,
    terms,
    removeTerm,
    categories,
    categoryCounts,
    filteredTerms,
    searchQuery,
    setSearchQuery,
    activeCategories,
    hideKnown,
    setHideKnown,
    sortMode,
    setSortMode,
    selectedTermId,
    knownTerms,
    markedKnownTerms,
    everMasteredTerms,
    toggleCategory,
    selectTerm,
    toggleMarkedKnown,
  } = useLibraryList(data, filtersCookie);

  const liveCollection = useMemo(() => {
    const known = new Set<string>();
    const learned = new Set<string>();
    for (const term of terms) {
      if (knownTerms.has(term.id) || markedKnownTerms.has(term.id)) known.add(term.id);
      if (everMasteredTerms.has(term.id) || markedKnownTerms.has(term.id)) learned.add(term.id);
    }
    return {
      ...collection,
      knownCount: known.size,
      termsLearnedCount: learned.size,
      termCount: terms.length,
    };
  }, [collection, terms, knownTerms, markedKnownTerms, everMasteredTerms]);

  const untriagedCount = terms.length - liveCollection.knownCount;
  const isOwner = collection.source === "owned";
  const windowKey = [searchQuery, hideKnown, sortMode, [...activeCategories].join("|")].join("·");
  // A deleted term leaves the list, so its selection goes with it.
  const selectedTerm = terms.find((term) => term.id === selectedTermId) ?? null;

  // Details belong to this server snapshot; an edit's revalidation brings a
  // new one, so nothing needs clearing by hand.
  const detailsScope = `${collection.id}:${data.loadedAt}`;

  useSlashToFocus(searchInputRef);

  // Stable, so a sheet opening doesn't re-render every memoized row.
  const handleEdit = useCallback(
    async (termId: string) => {
      const term = await loadTermDetails(detailsScope, termId);
      if (!term) {
        toast("Couldn't load that term. Try again.", "destructive");
        return;
      }
      // On a phone the detail sheet makes way for the form.
      if (!isDesktop) selectTerm(null);
      setEditing(term);
    },
    [detailsScope, toast, isDesktop, selectTerm],
  );

  const detail = selectedTerm ? (
    <TermDetail
      key={selectedTerm.id}
      termId={selectedTerm.id}
      language={collection.language}
      markedKnown={markedKnownTerms.has(selectedTerm.id)}
      isOwner={isOwner}
      onToggleMarkedKnown={toggleMarkedKnown}
      onEdit={(termId) => void handleEdit(termId)}
    />
  ) : null;

  return (
    <TermDetailsScope value={detailsScope}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center justify-between gap-2.5">
            <h1 className="m-0 font-heading text-[30px] font-extrabold">Library</h1>
            <Pill variant="secondary" href="/app/import">
              <Plus className="size-4" strokeWidth={2.6} aria-hidden />
              Collection
            </Pill>
          </div>
          <CollectionRow name={collection.name} />

          <Suspense fallback={null}>
            <ImportedNotice
              summary={importedSummary}
              collection={collection}
              onFinish={() => setFinishOpen(true)}
            />
          </Suspense>
          <LibraryCollectionHeader
            collection={liveCollection}
            categoryCount={categories.length}
            isOwner={isOwner}
            untriagedCount={untriagedCount}
          />

          {isOwner ? (
            <Suspense fallback={null}>
              <UnfinishedSection
                collectionId={collection.id}
                terms={data.unfinishedTerms}
                isOpen={finishOpen}
                onOpenChange={setFinishOpen}
                onRemoved={() => router.refresh()}
              />
            </Suspense>
          ) : null}

          <LibraryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchInputRef={searchInputRef}
            categories={categories}
            categoryCounts={categoryCounts}
            totalCount={terms.length}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
            hideKnown={hideKnown}
            onHideKnownChange={setHideKnown}
            sortMode={sortMode}
            onSortChange={setSortMode}
            visibleCount={filteredTerms.length}
          />

          <TermList
            terms={filteredTerms}
            windowKey={windowKey}
            knownTerms={knownTerms}
            markedKnownTerms={markedKnownTerms}
            selectedTermId={selectedTermId}
            isOwner={isOwner}
            totalCount={terms.length}
            hasUnfinished={data.unfinishedTerms.length > 0}
            collectionId={collection.id}
            onSelect={selectTerm}
            onToggleMarkedKnown={toggleMarkedKnown}
            onActions={setActionsTerm}
          />
          {filteredTerms.length > 0 ? (
            <p className="m-0 px-1 text-[13px] font-semibold text-muted">
              <span className="md:hidden coarse:inline">
                Tap a term to open it. Swipe it right to mark it known.
              </span>
              <span className="hidden md:inline coarse:hidden">
                Click a term to open it. The check on a row marks it known.
              </span>
            </p>
          ) : null}
        </div>

        <aside
          aria-label="Term"
          className="sticky top-0 hidden max-h-dvh w-[420px] shrink-0 overflow-y-auto lg:block"
        >
          <Card radius="md" className="p-5">
            {selectedTerm ? (
              <>
                <h2 className="m-0 font-heading text-2xl leading-tight font-extrabold [overflow-wrap:anywhere]">
                  {selectedTerm.term}
                </h2>
                {selectedTerm.category ? (
                  <p className="mt-1 mb-3.5 text-sm font-semibold text-muted">
                    {selectedTerm.category}
                  </p>
                ) : (
                  <div className="mb-3.5" />
                )}
                {detail}
              </>
            ) : (
              <EmptyPanel
                className="py-6"
                title="Pick a term"
                description="Open a term to see every part of it here."
              />
            )}
          </Card>
        </aside>
      </div>

      {!isDesktop && selectedTerm ? (
        <BottomSheet
          isOpen
          onOpenChange={(open) => {
            if (!open) selectTerm(null);
          }}
          title={selectedTerm.term}
          subline={selectedTerm.category ?? undefined}
        >
          {detail}
        </BottomSheet>
      ) : null}

      {actionsTerm ? (
        <TermActionsSheet
          term={actionsTerm}
          markedKnown={markedKnownTerms.has(actionsTerm.id)}
          isOwner={isOwner}
          onClose={() => setActionsTerm(null)}
          onOpenTerm={selectTerm}
          onToggleMarkedKnown={toggleMarkedKnown}
          onEdit={(termId) => void handleEdit(termId)}
          onDelete={setDeleting}
        />
      ) : null}

      {isOwner ? (
        <TermRowDialogs
          collectionTerms={terms}
          editing={editing}
          onEditingChange={setEditing}
          deleting={deleting}
          onDeletingChange={setDeleting}
          detailsScope={detailsScope}
          onRemove={removeTerm}
        />
      ) : null}
    </TermDetailsScope>
  );
}
