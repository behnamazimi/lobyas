"use client";

import { ArrowUpDown } from "lucide-react";
import type { RefObject } from "react";
import { Chip, SearchField } from "@/components/kit";
import { SharedCollectionsTabs } from "@/components/library/shared-collections-tabs";
import type { useSharedCollectionsBrowse } from "@/hooks/use-shared-collections-browse";
import type { BrowseCollectionFilter } from "@/lib/library/browse";
import { pluralize } from "@/lib/utils";

const FILTERS: Array<{
  value: BrowseCollectionFilter;
  label: string;
  countKey: "all" | "available" | "inCollection";
}> = [
  { value: "all", label: "All", countKey: "all" },
  { value: "available", label: "Available", countKey: "available" },
  { value: "in-collection", label: "In library", countKey: "inCollection" },
];

type SharedCollectionsFilterBarProps = {
  browse: ReturnType<typeof useSharedCollectionsBrowse>;
  searchInputRef: RefObject<HTMLInputElement | null>;
};

export function SharedCollectionsFilterBar({
  browse,
  searchInputRef,
}: SharedCollectionsFilterBarProps) {
  const sortedByLoved = browse.sort === "loved";

  return (
    <section aria-label="Filter collections" className="flex flex-col gap-3">
      <SearchField
        label="Search collections"
        placeholder="Search collections"
        value={browse.searchInput}
        onChange={browse.setSearchInput}
        inputRef={searchInputRef}
      />
      <div data-tour="browse-filters">
        <SharedCollectionsTabs
          active={browse.group}
          counts={browse.counts.groups}
          onChange={browse.setGroup}
        />
      </div>
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Collection status"
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.value}
            selected={browse.filter === item.value}
            count={browse.counts[item.countKey]}
            onPress={() => browse.setFilter(item.value)}
          >
            {item.label}
          </Chip>
        ))}
        <Chip
          selected={sortedByLoved}
          onPress={() => browse.setSort(sortedByLoved ? "name" : "loved")}
          className="ms-auto"
        >
          Most loved
          <ArrowUpDown className="size-3.5" strokeWidth={2.4} aria-hidden />
        </Chip>
      </div>
      <p className="m-0 text-xs font-bold text-muted tabular-nums" aria-live="polite">
        {pluralize(browse.matchingCount, "collection")}
        {browse.isRefreshing ? "…" : ""}
      </p>
    </section>
  );
}
