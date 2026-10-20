"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setCollectionLove, toggleActiveForReview } from "@/app/(private)/app/actions";
import { Card } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { setCurrentCollection } from "@/lib/collections/current";
import type { Collection } from "@/lib/terms/types";
import { CollectionActionTiles } from "./collection-action-tiles";
import { CollectionStudyRow } from "./collection-study-row";
import { CollectionSummary } from "./collection-summary";
import { AddTermsSheet } from "./add-terms-sheet";
import { CollectionActions } from "./collection-actions";
import { copyCollectionLink } from "./collection-share-link";
import { ShareCollectionSheet } from "./collection-share-sheet";

type LibraryCollectionHeaderProps = {
  collection: Collection;
  categoryCount: number;
  isOwner?: boolean;
  /** Terms not yet known or marked known — Triage only shows while > 0. */
  untriagedCount: number;
};

type Sheet = "add" | "share" | "more" | null;

export function LibraryCollectionHeader({
  collection: serverCollection,
  categoryCount,
  isOwner = false,
  untriagedCount,
}: LibraryCollectionHeaderProps) {
  const { toast } = useToast();
  const [sheet, setSheet] = useState<Sheet>(null);
  // What the share sheet last saved, so reopening it before the page refresh lands doesn't show the old state.
  const [savedShare, setSavedShare] = useState<{ id: string; shared: boolean } | null>(null);
  // Shows the new state at once; the action re-renders the page with the
  // saved value, and a failed save falls back to it on its own.
  const [isActiveForReview, setOptimisticActive] = useOptimistic(
    serverCollection.isActiveForReview,
  );
  const [togglePending, startToggle] = useTransition();
  const [loveOverride, setLoveOverride] = useState<{
    id: string;
    loved: boolean;
    count: number;
  } | null>(null);
  const love = loveOverride?.id === serverCollection.id ? loveOverride : null;
  const collection = {
    ...serverCollection,
    isActiveForReview,
    lovedByMe: love?.loved ?? serverCollection.lovedByMe,
    loveCount: love?.count ?? serverCollection.loveCount,
  };
  const shared =
    savedShare?.id === collection.id ? savedShare.shared : collection.visibility === "shared";

  async function toggleLove() {
    const previous = {
      id: collection.id,
      loved: collection.lovedByMe,
      count: collection.loveCount,
    };
    const loved = !previous.loved;
    setLoveOverride({
      id: collection.id,
      loved,
      count: Math.max(0, previous.count + (loved ? 1 : -1)),
    });
    const result = await setCollectionLove(collection.id, loved);
    if (result.error) {
      setLoveOverride(previous);
      toast(result.error, "destructive");
    } else if (result.count !== undefined) {
      setLoveOverride({ id: collection.id, loved, count: result.count });
    }
  }

  function setActiveForReview(active: boolean) {
    // A plain /app/library visit shows the first active collection without
    // remembering it, so pausing that one would move on to the next. Pin it.
    setCurrentCollection(collection.id);
    startToggle(async () => {
      setOptimisticActive(active);
      const { error } = await toggleActiveForReview(collection.id, active);
      if (error) toast(error, "destructive");
    });
  }

  async function copyLink() {
    if (await copyCollectionLink(collection, toast, false)) toast("Link copied");
  }

  return (
    <Card radius="md" className="p-4" data-tour="library-collections">
      <CollectionSummary collection={collection} categoryCount={categoryCount} />

      <CollectionStudyRow
        collection={collection}
        resumePending={togglePending}
        onResume={() => setActiveForReview(true)}
      />

      <CollectionActionTiles
        isOwner={isOwner}
        owned={collection.source === "owned"}
        triageHref={untriagedCount > 0 ? `/app/triage?collection=${collection.id}` : null}
        onAdd={() => setSheet("add")}
        onShare={() => setSheet("share")}
        onCopyLink={() => void copyLink()}
        onMore={() => setSheet("more")}
      />

      {sheet === "add" ? (
        <AddTermsSheet collection={collection} onClose={() => setSheet(null)} />
      ) : null}
      {sheet === "share" ? (
        <ShareCollectionSheet
          collection={collection}
          initialShared={shared}
          onSaved={(next) => setSavedShare({ id: collection.id, shared: next })}
          onClose={() => setSheet(null)}
        />
      ) : null}
      <CollectionActions
        collection={collection}
        open={sheet === "more"}
        onOpenChange={(open) => setSheet(open ? "more" : null)}
        onToggleActiveForReview={() => setActiveForReview(!collection.isActiveForReview)}
        onToggleLove={() => void toggleLove()}
        togglePending={togglePending}
      />
    </Card>
  );
}
