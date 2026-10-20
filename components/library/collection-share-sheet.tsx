"use client";

import { useState } from "react";
import {
  getCollectionSubscriberCount,
  shareCollection,
  unshareCollection,
} from "@/app/(private)/app/actions";
import { BottomSheet, Pill, ToggleRow } from "@/components/kit";
import { ownerNoticeFor } from "@/lib/collections/moderation";
import type { Collection } from "@/lib/terms/types";
import { ShareLink } from "./collection-share-link";

const SHARED_HINTS = [
  "Anyone with the link sees its name, description and a few terms, and can add it after logging in.",
  "People who add it see your edits, not your progress.",
];

function stopSharingMessage(count: number) {
  if (count === 0) return "It leaves Browse and the link stops working.";
  const who = count === 1 ? "1 person has" : `${count} people have`;
  return `${who} added this collection. Stopping removes it from their libraries, and the link stops working.`;
}

type ShareCollectionSheetProps = {
  collection: Collection;
  initialShared: boolean;
  onSaved: (shared: boolean) => void;
  onClose: () => void;
};

/** The owner's Share sheet. Mount it only while it is open. */
export function ShareCollectionSheet({
  collection,
  initialShared,
  onSaved,
  onClose,
}: ShareCollectionSheetProps) {
  return (
    <BottomSheet
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Share collection"
      subline="Let others find this collection and add it to their library."
    >
      <ShareBody collection={collection} initialShared={initialShared} onSaved={onSaved} />
    </BottomSheet>
  );
}

type ShareBodyProps = {
  collection: Collection;
  initialShared: boolean;
  onSaved: (shared: boolean) => void;
};

type SubscriberCount = number | "loading" | "error";

function ShareBody({ collection, initialShared, onSaved }: ShareBodyProps) {
  // The sheet keeps its own copy: the page catches up when the action's refresh lands.
  const [shared, setShared] = useState(initialShared);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [subscribers, setSubscribers] = useState<SubscriberCount>("loading");
  const blocked = collection.shareBlockedReason !== null;

  async function setSharing(next: boolean) {
    setError(null);
    setBusy(true);
    setShared(next);
    let failure: string | null;
    try {
      const result = await (next ? shareCollection : unshareCollection)(collection.id);
      failure = result.error ?? null;
    } catch {
      failure = "Couldn't save that. Check your connection and try again.";
    }
    setBusy(false);
    if (failure) {
      setShared(!next);
      setError(failure);
    } else {
      onSaved(next);
    }
  }

  function closeConfirm() {
    setConfirming(false);
  }

  function askToStop() {
    setError(null);
    setConfirming(true);
    setSubscribers("loading");
    getCollectionSubscriberCount(collection.id)
      .then((result) => setSubscribers(result.count ?? "error"))
      .catch(() => setSubscribers("error"));
  }

  async function stop() {
    await setSharing(false);
    closeConfirm();
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1" aria-live="polite">
          <p className="m-0 text-lg font-extrabold">Stop sharing?</p>
          <p className="m-0 text-[15px] leading-snug font-semibold text-ink-soft">
            {subscribers === "loading"
              ? "Checking who else uses this collection…"
              : subscribers === "error"
                ? "Couldn't check who else uses this collection. Try again."
                : stopSharingMessage(subscribers)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Pill variant="secondary" disabled={busy} onClick={closeConfirm}>
            Keep sharing
          </Pill>
          <Pill
            variant="danger"
            disabled={busy || typeof subscribers !== "number"}
            onClick={() => void stop()}
          >
            {busy ? "Stopping…" : "Stop sharing"}
          </Pill>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ToggleRow
        label="Shared"
        description={
          blocked
            ? ownerNoticeFor(collection.shareBlockedReason)
            : "Lobyas members see it in Browse, under Community."
        }
        checked={shared}
        disabled={busy || blocked}
        onChange={(checked) => (checked ? void setSharing(true) : askToStop())}
      />
      {shared && !blocked ? (
        <>
          <ShareLink collection={collection} />
          <ul className="m-0 flex list-disc flex-col gap-1.5 ps-5 text-sm leading-snug font-semibold text-muted">
            {SHARED_HINTS.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
          <Pill variant="danger" size="lg" className="h-[52px] text-base" onClick={askToStop}>
            Stop sharing
          </Pill>
        </>
      ) : null}
      {error ? (
        <p role="alert" className="m-0 text-sm font-bold text-wrong-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
