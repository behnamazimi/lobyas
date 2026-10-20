"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { formatCount } from "@/lib/kit/text";
import { BottomSheet, CollectionSwitcherRow, Tile } from "@/components/kit";
import { collectionLetter, collectionTone } from "./collection-look";
import { useShell, type ShellCollection } from "./shell-context";

export function CollectionList() {
  const { collections, current, setCollection } = useShell();
  const active = collections.filter((collection) => collection.isActiveForReview);
  const paused = collections.filter((collection) => !collection.isActiveForReview);
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
          detail={`Read ${formatCount(collection.queues.read)} · Review ${formatCount(
            collection.queues.review,
          )} · Quiz ${formatCount(collection.queues.quiz)}`}
          selected={collection.id === current?.id}
          onPress={() => setCollection(collection.id)}
        />
      ))}
      {paused.length > 0 ? (
        <>
          <p className="m-0 px-3 pt-3 text-xs font-extrabold tracking-wide text-muted uppercase">
            Paused
          </p>
          {paused.map((collection) => (
            <CollectionSwitcherRow
              key={collection.id}
              name={collection.name}
              letter={collectionLetter(collection.name)}
              tone={collectionTone(collection.kind)}
              detail="Paused"
              selected={collection.id === current?.id}
              onPress={() => setCollection(collection.id)}
            />
          ))}
        </>
      ) : null}
      <Link
        href="/app/import"
        className="flex min-h-14 items-center gap-3 rounded-2xl px-2 text-base font-extrabold hover:bg-base-200"
      >
        <Tile tone="success">
          <Plus className="size-5" strokeWidth={2.8} aria-hidden />
        </Tile>
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
