"use client";

import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CopyIconButton } from "@/components/import/copy-icon-button";
import { BottomSheet, IconButton } from "@/components/kit";
import { PASTE_EXAMPLE, PASTE_SEPARATOR_RULE } from "@/lib/import/read-input";
import { cn } from "@/lib/utils";

function Format({
  title,
  children,
  example,
  copyLabel,
}: {
  title: string;
  children: ReactNode;
  example?: string;
  /** Adds a copy button to the example. */
  copyLabel?: string;
}) {
  return (
    <section className="space-y-1 py-2">
      <h3 className="m-0 text-sm font-extrabold">{title}</h3>
      <p className="m-0 text-sm font-semibold text-muted">{children}</p>
      {example ? (
        <div className="relative">
          <pre
            className={cn(
              "m-0 rounded-2xl bg-base-200 py-2 pl-3 font-mono text-xs leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]",
              copyLabel ? "pr-14" : "pr-3",
            )}
          >
            {example}
          </pre>
          {copyLabel ? (
            <div className="absolute top-1 right-1">
              <CopyIconButton value={example} label={copyLabel} />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

const linkClass = "font-extrabold text-read-text underline";

/** A "?" button that explains what the paste box accepts. */
export function FormatHelpButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        label="What formats can I paste?"
        className={className}
        onClick={() => setOpen(true)}
      >
        <CircleHelp className="size-5" aria-hidden strokeWidth={2.4} />
      </IconButton>
      <BottomSheet
        isOpen={open}
        onOpenChange={setOpen}
        title="What you can paste"
        subline="Only the term is required. Everything else is optional."
      >
        <div className="space-y-2">
          <Format title="A list of terms and definitions" example={PASTE_EXAMPLE}>
            {PASTE_SEPARATOR_RULE}
          </Format>
          <Format title="Just words">
            One word per line. Each is saved as a term to finish later.
          </Format>
          <Format
            title="A spreadsheet or CSV"
            copyLabel="Copy CSV example"
            example={
              "Term,Definition,Example,Category\nAPI,A way for programs to talk,Call the API,Tech"
            }
          >
            Paste the cells or choose a CSV file. Use these header names: Term, Definition, Example,
            Note, Category. Only the first two columns are needed.
          </Format>
          <Format title="Exports from other apps">
            Quizlet and Anki exports work.{" "}
            <Link href="/app/import/apps" className={linkClass}>
              How to export
            </Link>
          </Format>
          <Format title="JSON">
            The only way to add other fields like mental model, in practice, anti-example, debated,
            links between terms, and the language all together in bulk.{" "}
            <Link href="/app/import/more" className={linkClass}>
              See the format
            </Link>
          </Format>
        </div>
      </BottomSheet>
    </>
  );
}
