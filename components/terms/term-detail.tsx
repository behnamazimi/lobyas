"use client";

import { Check, Pencil, Undo2 } from "lucide-react";
import { useContext } from "react";
import { NarrationButton } from "@/components/library/narration-access";
import { Pill, Skeleton, TermBody } from "@/components/kit";
import {
  prefetchTermDetails,
  retryTermDetails,
  TermDetailsScope,
  useTermDetails,
} from "@/lib/library/details-store";
import type { CollectionLanguage } from "@/lib/terms/languages";

type TermDetailProps = {
  termId: string;
  language: CollectionLanguage;
  markedKnown: boolean;
  isOwner: boolean;
  onToggleMarkedKnown: (termId: string) => Promise<boolean>;
  onEdit: (termId: string) => void;
};

/** What a term opens to in the Library: Listen, Edit and Mark known above the
 *  full term body. The details load on demand (usually already prefetched while
 *  the row scrolled into view). */
export function TermDetail({
  termId,
  language,
  markedKnown,
  isOwner,
  onToggleMarkedKnown,
  onEdit,
}: TermDetailProps) {
  const scope = useContext(TermDetailsScope);
  const details = useTermDetails(termId);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap gap-2">
        <NarrationButton termId={termId} look="pill" />
        {isOwner ? (
          <Pill variant="soft" onClick={() => onEdit(termId)}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Pill>
        ) : null}
        <Pill
          variant="soft"
          className={markedKnown ? undefined : "bg-success-tint text-success-text"}
          onClick={() => void onToggleMarkedKnown(termId)}
        >
          {markedKnown ? (
            <>
              <Undo2 className="size-4" aria-hidden />
              Mark unknown
            </>
          ) : (
            <>
              <Check className="size-4" strokeWidth={3} aria-hidden />
              Mark known
            </>
          )}
        </Pill>
      </div>

      {details === "failed" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-sm font-semibold text-muted">Couldn&apos;t load this term.</p>
          <Pill variant="secondary" onClick={() => retryTermDetails(scope, termId)}>
            Try again
          </Pill>
        </div>
      ) : !details ? (
        <div
          ref={() => prefetchTermDetails(scope, [termId])}
          className="flex flex-col gap-2"
          aria-busy="true"
          aria-label="Loading term"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        <TermBody term={details} language={language} />
      )}
    </div>
  );
}
