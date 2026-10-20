"use client";

import { Download } from "lucide-react";
import { Suspense, use, useMemo, useState } from "react";
import { BottomSheet, Pill } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { ImportCodePanel } from "@/components/import/import-ui";
import { CopyIconSwap } from "@/components/settings/ui";
import {
  buildImportPayloadFromCollection,
  exportFilename,
} from "@/lib/export/build-import-payload";
import { stringifyImportPayload } from "@/lib/import/sample-payload";
import { collectionToCsv, collectionToText } from "@/lib/export/build-text-export";
import type { CollectionExport } from "@/lib/export/fetch-collection-export";
import type { Collection, Term } from "@/lib/terms/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SkeletonBar } from "@/components/page-skeleton";

type CollectionExportSheetProps = {
  collection: Collection;
  /** Started when the sheet was opened; the full terms load only for export. */
  terms: Promise<CollectionExport>;
  onOpenChange: (open: boolean) => void;
};

/** Mounted only while open, so its state starts fresh every time. */
export function CollectionExportSheet({
  collection,
  terms,
  onOpenChange,
}: CollectionExportSheetProps) {
  return (
    <BottomSheet
      isOpen
      onOpenChange={onOpenChange}
      title="Export collection"
      subline={`Export “${collection.name}” as JSON. Copy it or download a file you can re-import later.`}
    >
      <Suspense
        fallback={
          <div className="space-y-2 py-4" aria-busy="true" aria-label="Loading collection">
            <SkeletonBar className="h-40 w-full rounded-field" />
          </div>
        }
      >
        <ExportBody collection={collection} terms={terms} onOpenChange={onOpenChange} />
      </Suspense>
    </BottomSheet>
  );
}

function ExportBody({
  collection,
  terms: termsPromise,
  onOpenChange,
}: {
  collection: Collection;
  terms: Promise<CollectionExport>;
  onOpenChange: (open: boolean) => void;
}) {
  const result = use(termsPromise);
  if ("error" in result) {
    return (
      <div className="flex flex-col gap-3">
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
        <Pill variant="secondary" onClick={() => onOpenChange(false)}>
          Close
        </Pill>
      </div>
    );
  }
  return <ExportPanel collection={collection} terms={result.terms} />;
}

function ExportPanel({ collection, terms }: { collection: Collection; terms: Term[] }) {
  const [copied, setCopied] = useState(false);

  const json = useMemo(
    () => stringifyImportPayload(buildImportPayloadFromCollection(collection, terms)),
    [collection, terms],
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyText() {
    await navigator.clipboard.writeText(collectionToText(terms));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadCsv() {
    download(
      collectionToCsv(terms),
      "text/csv",
      exportFilename(collection.name).replace(/\.json$/, ".csv"),
    );
  }

  function handleDownload() {
    download(json, "application/json", exportFilename(collection.name));
  }

  function download(contents: string, type: string, filename: string) {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <ImportCodePanel
        actions={
          <Button type="button" variant="outline" size="sm" onPress={handleCopy} isDisabled={!json}>
            <CopyIconSwap copied={copied} />
            {copied ? "Copied" : "Copy JSON"}
          </Button>
        }
      >
        {json}
      </ImportCodePanel>

      <div className="mt-3 flex flex-wrap gap-2">
        <Pill variant="secondary" onClick={() => void handleCopyText()} disabled={!json}>
          Copy as text
        </Pill>
        <Pill variant="secondary" onClick={handleDownloadCsv} disabled={!json}>
          Download CSV
        </Pill>
        <Pill onClick={handleDownload} disabled={!json}>
          <Download className="size-4" aria-hidden />
          Download .json
        </Pill>
      </div>
    </>
  );
}
