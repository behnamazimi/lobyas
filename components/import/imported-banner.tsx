"use client";

import { use, useState } from "react";
import { Banner, Pill } from "@/components/kit";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { clearDraft } from "@/lib/import/draft-store";
import { pluralize } from "@/lib/utils";
import { dropSearchParamFromUrl } from "@/components/library/library-page-helpers";

export type ImportedSummary = {
  collectionId: string;
  collectionName: string;
  created: number;
  updated: number;
  skipped: number;
  unfinished: number;
  relationshipsDropped: number;
};

/** Holds the confirmation for the import that just landed, and drops ?added=
 *  so a reload or shared link doesn't repeat it. The pasted list is only
 *  cleared once the import is known to have worked. */
function useImportedNotice(summary: ImportedSummary | undefined) {
  const [dismissed, setDismissed] = useState(false);
  useMountEffect(() => {
    if (!summary) return;
    dropSearchParamFromUrl("added");
    clearDraft();
  });
  return { summary: dismissed ? undefined : summary, dismiss: () => setDismissed(true) };
}

function detailLine(summary: ImportedSummary) {
  const parts: string[] = [];
  if (summary.unfinished > 0) parts.push(`${summary.unfinished} to finish later`);
  if (summary.skipped > 0) parts.push(`Skipped ${summary.skipped} already in this collection`);
  if (summary.updated > 0 && summary.created > 0) parts.push(`Updated ${summary.updated}`);
  if (summary.relationshipsDropped > 0)
    parts.push(`${pluralize(summary.relationshipsDropped, "link")} left out`);
  return parts.join(" · ");
}

/** One-time confirmation after an import lands on its collection. The
 *  server loads the summary in parallel and passes the promise; wrap this in
 *  <Suspense> so the list never waits for it. */
export function ImportedNotice({
  summary: summaryPromise,
  collection,
  onFinish,
}: {
  summary: Promise<ImportedSummary | undefined>;
  collection: { id: string; name: string };
  onFinish: () => void;
}) {
  const notice = useImportedNotice(use(summaryPromise));
  return (
    <ImportedBanner
      summary={notice.summary}
      collection={collection}
      onFinish={onFinish}
      onDismiss={notice.dismiss}
    />
  );
}

function ImportedBanner({
  summary,
  collection,
  onFinish,
  onDismiss,
}: {
  summary: ImportedSummary | undefined;
  collection: { id: string; name: string };
  onFinish: () => void;
  onDismiss: () => void;
}) {
  if (!summary || summary.collectionId !== collection.id) return null;

  const addedAny = summary.created > 0;
  const title = addedAny
    ? `Added ${pluralize(summary.created, "term")} to ${summary.collectionName}`
    : `Updated ${pluralize(summary.updated, "term")} in ${summary.collectionName}`;
  const studyable = summary.created - summary.unfinished + summary.updated > 0;
  const details = detailLine(summary);

  return (
    <Banner
      tone="success"
      onDismiss={onDismiss}
      action={
        <>
          {studyable ? (
            <Pill variant="secondary" href={`/app/read?collection=${collection.id}`}>
              Start reading
            </Pill>
          ) : null}
          {studyable ? (
            <Pill variant="secondary" href={`/app/triage?collection=${collection.id}`}>
              Mark what you know
            </Pill>
          ) : null}
          {summary.unfinished > 0 ? (
            <Pill variant="secondary" onClick={onFinish}>
              Finish {pluralize(summary.unfinished, "term")}
            </Pill>
          ) : null}
        </>
      }
    >
      <strong className="font-extrabold">{title}</strong>
      {details ? <span className="block font-semibold">{details}</span> : null}
    </Banner>
  );
}
