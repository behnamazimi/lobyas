"use client";

import Link from "next/link";
import { BottomSheet, CollectionSwitcherRow } from "@/components/kit";
import { collectionLetter, collectionTone } from "./collection-look";
import { useShell, type ShellCollection } from "./shell-context";

export function CollectionList() {
  const { collections, current, setCollection } = useShell();
  const active = collections.filter((collection) => collection.isActiveForReview);
  return (
    <div className="flex flex-col gap-1">
      {active.map((collection) => (
        <CollectionSwitcherRow
          key={collection.id}
          name={collection.name}
          letter={collectionLetter(collection.name)}
          tone={collectionTone(collection.kind)}
          mastered={collection.termsLearnedCount}
          total={collection.termCount}
          selected={collection.id === current?.id}
          onPress={() => setCollection(collection.id)}
        />
      ))}
      <Link
        href="/app/import"
        className="flex min-h-14 items-center rounded-2xl px-3 text-base font-extrabold"
      >
        Add a collection
      </Link>
    </div>
  );
}

export function CollectionSwitcher() {
  const { switcherOpen, setSwitcherOpen, degraded } = useShell();
  if (degraded) return null;
  return (
    <BottomSheet isOpen={switcherOpen} onOpenChange={setSwitcherOpen} title="Collections">
      <CollectionList />
    </BottomSheet>
  );
}

export function collectionChip(collection: ShellCollection | null): {
  name: string;
  letter: string;
  tone: ReturnType<typeof collectionTone>;
} {
  if (!collection) return { name: "Add a collection", letter: "+", tone: "neutral" };
  return {
    name: collection.name,
    letter: collectionLetter(collection.name),
    tone: collectionTone(collection.kind),
  };
}
