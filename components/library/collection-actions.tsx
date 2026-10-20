"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { BottomSheet, ConfirmDialog } from "@/components/kit";
import { useCollectionActions } from "@/hooks/use-collection-actions";
import { fetchCollectionExport, type CollectionExport } from "@/lib/export/fetch-collection-export";
import type { Collection } from "@/lib/terms/types";
import { pluralize } from "@/lib/utils";
import { CollectionActionRows } from "./collection-action-rows";
import { ReportCollectionSheet } from "./report-collection-sheet";

const CollectionExportSheet = dynamic(() =>
  import("./collection-export-sheet").then((mod) => mod.CollectionExportSheet),
);
const EditCollectionSheet = dynamic(() =>
  import("./edit-collection-sheet").then((mod) => mod.EditCollectionSheet),
);

type CollectionActionsProps = {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleActiveForReview: () => void;
  onToggleLove: () => void;
  togglePending: boolean;
};

/** The collection's More sheet, plus the edit, export, report and confirm
 *  surfaces its rows open. Owners get Edit and Delete; a collection added from
 *  Browse gets Love, Report and Remove. */
export function CollectionActions({
  collection,
  open,
  onOpenChange,
  onToggleActiveForReview,
  onToggleLove,
  togglePending,
}: CollectionActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  // Set when the export sheet opens; the sheet reads it.
  const [exportTerms, setExportTerms] = useState<Promise<CollectionExport> | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState<string | null>(null);
  const { error, isBusy, busyId, deleteOwnedCollection, removeFromCollection, resetProgress } =
    useCollectionActions();

  const disabled = togglePending || (isBusy && busyId === collection.id);
  const owned = collection.source === "owned";
  const reportedByMe = collection.reportedByMe || reported === collection.id;

  // Each row closes the sheet first, then opens what it leads to.
  function pick(action: () => void) {
    return () => {
      onOpenChange(false);
      action();
    };
  }

  async function confirmDelete() {
    setDeleting(true);
    const deleted = await deleteOwnedCollection(collection.id, () => router.push("/app/library"));
    // On success the dialog stays up until the navigation unmounts this.
    if (deleted) return;
    setDeleting(false);
    setDeleteOpen(false);
  }

  return (
    <>
      <BottomSheet
        isOpen={open}
        onOpenChange={onOpenChange}
        title={collection.name}
        subline={`${owned ? "Your collection" : "Added collection"} · ${pluralize(collection.termCount, "term")}`}
      >
        <CollectionActionRows
          collection={collection}
          disabled={disabled}
          reportedByMe={reportedByMe}
          pick={pick}
          onToggleLove={onToggleLove}
          onEdit={() => setEditOpen(true)}
          onToggleActiveForReview={onToggleActiveForReview}
          onExport={() => setExportTerms(fetchCollectionExport(collection.id))}
          onReset={() => setResetOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onReport={() => setReportOpen(true)}
          onRemove={() => removeFromCollection(collection.id, () => router.push("/app/library"))}
        />
      </BottomSheet>

      {/* Their own boundaries, so loading a sheet's code doesn't suspend the page. */}
      {owned && editOpen ? (
        <Suspense fallback={null}>
          <EditCollectionSheet collection={collection} isOpen onOpenChange={setEditOpen} />
        </Suspense>
      ) : null}

      {exportTerms ? (
        <Suspense fallback={null}>
          <CollectionExportSheet
            collection={collection}
            terms={exportTerms}
            onOpenChange={(next) => {
              if (!next) setExportTerms(null);
            }}
          />
        </Suspense>
      ) : null}

      {reportOpen ? (
        <ReportCollectionSheet
          collectionId={collection.id}
          collectionName={collection.name}
          onReported={() => setReported(collection.id)}
          onClose={() => setReportOpen(false)}
        />
      ) : null}

      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={(next) => {
          if (!deleting) setDeleteOpen(next);
        }}
        title="Delete collection?"
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
      >
        Delete &ldquo;{collection.name}&rdquo; and all its terms? This can&apos;t be undone.
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset progress?"
        confirmLabel="Reset progress"
        onConfirm={() => {
          resetProgress(collection.id);
          setResetOpen(false);
        }}
      >
        {`Erase your learning progress for all ${pluralize(collection.termCount, "term")} in “${collection.name}”? Mastered and marked-known terms start over, and Triage choices are cleared. This can't be undone.`}
      </ConfirmDialog>

      {error ? (
        <p role="alert" className="m-0 text-sm font-bold text-wrong-text">
          {error}
        </p>
      ) : null}
    </>
  );
}
