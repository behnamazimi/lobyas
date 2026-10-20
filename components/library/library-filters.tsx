"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState, type RefObject } from "react";
import { SearchField } from "@/components/kit";
import type { SortMode } from "@/lib/terms/types";
import { FiltersSheet } from "./filters-sheet";

type LibraryFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  categories: string[];
  categoryCounts: Record<string, number>;
  totalCount: number;
  activeCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  hideKnown: boolean;
  onHideKnownChange: (value: boolean) => void;
  sortMode: SortMode;
  onSortChange: (value: SortMode) => void;
  visibleCount: number;
};

function countActiveFilters(activeCategories: Set<string>, hideKnown: boolean, sortMode: SortMode) {
  let count = 0;
  if (activeCategories.size > 0) count += 1;
  if (hideKnown) count += 1;
  if (sortMode !== "default") count += 1;
  return count;
}

export function LibraryFilters({
  searchQuery,
  onSearchChange,
  searchInputRef,
  totalCount,
  ...sheet
}: LibraryFiltersProps) {
  const [open, setOpen] = useState(false);
  const activeFilterCount = countActiveFilters(
    sheet.activeCategories,
    sheet.hideKnown,
    sheet.sortMode,
  );

  if (totalCount === 0) return null;

  return (
    <section aria-label="Search and filter terms" data-tour="library-search" className="flex gap-2">
      <SearchField
        label="Search terms"
        placeholder="Search terms"
        value={searchQuery}
        onChange={onSearchChange}
        inputRef={searchInputRef}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl bg-base-100 px-3.5 text-sm font-extrabold shadow-card"
      >
        <SlidersHorizontal className="size-[18px]" strokeWidth={2.4} aria-hidden />
        Filters
        {activeFilterCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-neutral text-xs text-neutral-content tabular-nums">
            {activeFilterCount}
          </span>
        ) : null}
      </button>
      <FiltersSheet isOpen={open} onOpenChange={setOpen} totalCount={totalCount} {...sheet} />
    </section>
  );
}
