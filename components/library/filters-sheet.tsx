"use client";

import { BottomSheet, Chip, Pill, RadioList, ToggleRow } from "@/components/kit";
import type { SortMode } from "@/lib/terms/types";
import { pluralize } from "@/lib/utils";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "category", label: "Category order" },
  { value: "az", label: "A to Z" },
  { value: "unknown", label: "Unknown first" },
];

type FiltersSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

export function FiltersSheet({
  isOpen,
  onOpenChange,
  categories,
  categoryCounts,
  totalCount,
  activeCategories,
  onToggleCategory,
  hideKnown,
  onHideKnownChange,
  sortMode,
  onSortChange,
  visibleCount,
}: FiltersSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Filter terms"
      subline={`${visibleCount} shown`}
      footer={
        <Pill size="lg" onClick={() => onOpenChange(false)}>
          Show {pluralize(visibleCount, "term")}
        </Pill>
      }
    >
      {categories.length >= 2 ? (
        <>
          <div className="text-sm font-extrabold">Category</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip
              selected={activeCategories.size === 0}
              count={totalCount}
              onPress={() => onToggleCategory("All")}
            >
              All
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={activeCategories.has(category)}
                count={categoryCounts[category] ?? 0}
                onPress={() => onToggleCategory(category)}
              >
                {category}
              </Chip>
            ))}
          </div>
        </>
      ) : null}
      <ToggleRow
        className="mt-2"
        label="Hide terms I know"
        description="Leaves out terms you marked known or mastered."
        checked={hideKnown}
        onChange={onHideKnownChange}
      />
      <div className="mt-1 mb-1 text-sm font-extrabold">Sort</div>
      <RadioList
        label="Sort"
        options={SORT_OPTIONS}
        value={sortMode}
        onChange={(value) => onSortChange(value as SortMode)}
      />
    </BottomSheet>
  );
}
