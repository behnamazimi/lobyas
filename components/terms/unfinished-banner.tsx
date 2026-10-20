"use client";

import { Banner, Pill } from "@/components/kit";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { pluralize } from "@/lib/utils";
import type { UnfinishedLibraryTerm } from "@/lib/terms/types";

type UnfinishedBannerProps = {
  terms: UnfinishedLibraryTerm[];
  onFinish: () => void;
  /** Where to ask for definitions, when that's possible right now. */
  requestHref?: string;
};

/** Owner-only prompt for terms that are saved but still need a definition. */
export function UnfinishedBanner({ terms, onFinish, requestHref }: UnfinishedBannerProps) {
  if (terms.length === 0) return null;

  return (
    <Banner
      action={
        <>
          <Pill variant="secondary" onClick={onFinish}>
            Finish {pluralize(terms.length, "term")}
          </Pill>
          {requestHref ? (
            <Pill variant="secondary" href={requestHref}>
              {REQUEST_COPY.definitions.link}
            </Pill>
          ) : null}
        </>
      }
    >
      <strong className="font-extrabold">{pluralize(terms.length, "term")} to finish.</strong> They
      stay out of Read, Review and Quiz until they have a definition.
    </Banner>
  );
}
