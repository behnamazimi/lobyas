"use client";

import { Clipboard, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { Banner, FormField, PinnedAction, Pill, TextArea } from "@/components/kit";
import { FormatHelpButton } from "@/components/import/format-help-dialog";
import { ImportFailurePanel } from "@/components/import/import-errors";
import { decodeFileBytes } from "@/lib/import/parse/decode";
import { PASTE_EXAMPLE, PASTE_SEPARATOR_RULE, type PasteProblem } from "@/lib/import/read-input";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const PLACEHOLDER = PASTE_EXAMPLE;

type PasteStepProps = {
  draft: string;
  problem: PasteProblem | null;
  onTextChange: (text: string) => void;
  /** Reads the text and moves on to Check. */
  onCheck: (text: string, html?: string) => void;
  onTreatAsText: () => void;
  onProblem: (message: string) => void;
};

export function PasteStep({
  draft,
  problem,
  onTextChange,
  onCheck,
  onTreatAsText,
  onProblem,
}: PasteStepProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteBlocked, setPasteBlocked] = useState(false);

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const plain = event.clipboardData.getData("text/plain");
    const html = event.clipboardData.getData("text/html");
    if (!plain && !html) return;
    event.preventDefault();

    const target = event.currentTarget;
    const next = plain
      ? draft.slice(0, target.selectionStart) + plain + draft.slice(target.selectionEnd)
      : draft;
    onTextChange(next);
    onCheck(next, /<table[\s>]/i.test(html) ? html : undefined);
  }

  async function handlePasteButton() {
    setPasteBlocked(false);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        textareaRef.current?.focus();
        return;
      }
      onTextChange(text);
      onCheck(text);
    } catch {
      setPasteBlocked(true);
      textareaRef.current?.focus();
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      onProblem("That file is too big. Split it and add it in parts.");
      return;
    }

    const decoded = decodeFileBytes(new Uint8Array(await file.arrayBuffer()));
    if (decoded.kind === "package") {
      onProblem(
        "That file looks like a package from Anki or a spreadsheet app. Export it as text or CSV, or copy the cells and paste them here.",
      );
      return;
    }
    if (!decoded.text.trim()) {
      onProblem(`"${file.name}" is empty.`);
      return;
    }
    onTextChange(decoded.text);
    onCheck(decoded.text);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <FormField label="Your list" htmlFor="import-list">
          <div className="relative">
            <TextArea
              id="import-list"
              ref={textareaRef}
              value={draft}
              placeholder={PLACEHOLDER}
              className="min-h-64 pr-12 font-mono text-sm leading-relaxed font-medium"
              onChange={(event) => onTextChange(event.target.value)}
              onPaste={handlePaste}
            />
            <FormatHelpButton className="absolute top-1 right-1" />
          </div>
        </FormField>

        <div className="flex flex-wrap gap-2">
          <Pill variant="secondary" onClick={() => void handlePasteButton()}>
            <Clipboard className="size-4" aria-hidden strokeWidth={2.4} />
            Paste
          </Pill>
          <Pill variant="secondary" onClick={() => fileRef.current?.click()}>
            <FileText className="size-4" aria-hidden strokeWidth={2.4} />
            Choose a file
          </Pill>
          {/* No accept filter: iOS greys out files it doesn't recognise. */}
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a file"
            onChange={(event) => void handleFile(event)}
          />
        </div>

        {pasteBlocked ? (
          <p className="m-0 text-sm font-semibold text-muted" role="status">
            Paste isn&apos;t available here. Tap the box and choose Paste.
          </p>
        ) : null}

        {problem?.failure ? <ImportFailurePanel failure={problem.failure} /> : null}
        {problem && !problem.failure ? (
          <Banner
            action={
              problem.canTreatAsText ? (
                <Pill variant="secondary" onClick={onTreatAsText}>
                  Treat it as a list
                </Pill>
              ) : undefined
            }
          >
            {problem.message}
          </Banner>
        ) : null}

        <p className="m-0 text-[13px] leading-snug font-semibold text-muted">
          {PASTE_SEPARATOR_RULE} A term without one is saved to finish later. Works with lists from
          Notes, Google Sheets, Excel, Docs and WhatsApp, and with exports from Quizlet and Anki.
        </p>

        <div className="flex justify-center">
          <Pill variant="ghost" href="/app/import/more">
            More ways to add
          </Pill>
        </div>
      </div>

      <PinnedAction>
        <Pill size="lg" disabled={!draft.trim()} onClick={() => onCheck(draft)}>
          Check your list
        </Pill>
      </PinnedAction>
    </>
  );
}
