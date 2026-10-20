"use client";

import { useMemo, useState } from "react";
import type { MasteryTermRow as MasteryTermRowData } from "@/lib/mastery/mastery";
import { SearchField, SelectInput } from "@/components/kit";
import { MasteryTermRow } from "./mastery-term-row";
import {
  MasteryTierChips,
  rowGroup,
  type MasteryGroup,
  type MasteryTierFilter,
} from "./mastery-tier-chips";

type MasteryTermListProps = {
  termRows: MasteryTermRowData[];
  collections: { id: string; name: string }[];
  collectionId: string;
  onCollectionChange: (collectionId: string) => void;
};

function groupCounts(rows: MasteryTermRowData[]): Record<MasteryGroup, number> {
  const counts: Record<MasteryGroup, number> = {
    notStarted: 0,
    weak: 0,
    medium: 0,
    strong: 0,
    markedKnown: 0,
  };
  for (const row of rows) counts[rowGroup(row)] += 1;
  return counts;
}

export function MasteryTermList({
  termRows,
  collections,
  collectionId,
  onCollectionChange,
}: MasteryTermListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTier, setActiveTier] = useState<MasteryTierFilter>("all");

  const collectionFiltered = useMemo(
    () =>
      collectionId === "all"
        ? termRows
        : termRows.filter((row) => row.collectionId === collectionId),
    [termRows, collectionId],
  );

  const counts = useMemo(() => groupCounts(collectionFiltered), [collectionFiltered]);

  const visibleRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return collectionFiltered.filter((row) => {
      if (activeTier !== "all" && rowGroup(row) !== activeTier) return false;
      if (query && !row.term.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [collectionFiltered, activeTier, searchQuery]);

  if (termRows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <SearchField label="Search terms" value={searchQuery} onChange={setSearchQuery} />
      <SelectInput
        aria-label="Collection"
        value={collectionId}
        onChange={(event) => onCollectionChange(event.target.value)}
        className="bg-base-100 shadow-card"
      >
        <option value="all">All collections</option>
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.name}
          </option>
        ))}
      </SelectInput>

      <MasteryTierChips
        counts={counts}
        totalCount={collectionFiltered.length}
        activeTier={activeTier}
        onChange={setActiveTier}
      />

      <p className="m-0 text-xs font-bold text-muted">
        {visibleRows.length} of {collectionFiltered.length} shown
      </p>

      {visibleRows.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {visibleRows.map((row) => (
            <MasteryTermRow key={row.termId} row={row} />
          ))}
        </ul>
      ) : (
        <p className="text-sm font-semibold text-muted">No terms match your filters.</p>
      )}
    </div>
  );
}
