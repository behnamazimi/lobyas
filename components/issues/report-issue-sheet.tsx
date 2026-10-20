"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { submitIssueReport } from "@/app/(private)/app/issues/actions";
import { BottomSheet, FormField, Pill, SegmentedControl, TextArea } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { ISSUE_COPY } from "@/lib/issues/copy";
import { isAcceptedImage, shrinkScreenshot } from "@/lib/issues/image";
import { BODY_MAX, BODY_MIN, ISSUE_KINDS, type IssueKind } from "@/lib/issues/schema";

const FORM_ID = "report-issue-form";

type ReportIssueSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Mounted only while open, so a closed sheet forgets its draft. */
export function ReportIssueSheet({ isOpen, onOpenChange }: ReportIssueSheetProps) {
  return isOpen ? <OpenReportIssueSheet onOpenChange={onOpenChange} /> : null;
}

type Screenshot = { blob: Blob; url: string };

function OpenReportIssueSheet({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<IssueKind>("problem");
  const [body, setBody] = useState("");
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedLength = body.trim().length;
  const canSend = trimmedLength >= BODY_MIN && !isSending && !isPreparing;

  function clearScreenshot() {
    if (screenshot) URL.revokeObjectURL(screenshot.url);
    setScreenshot(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function addScreenshot(file: File) {
    setError(null);
    if (!isAcceptedImage(file)) {
      setError(ISSUE_COPY.screenshotUnsupported);
      return;
    }
    setIsPreparing(true);
    const blob = await shrinkScreenshot(file);
    setIsPreparing(false);
    if (!blob) {
      setError(ISSUE_COPY.screenshotUnreadable);
      return;
    }
    clearScreenshot();
    setScreenshot({ blob, url: URL.createObjectURL(blob) });
  }

  function handlePaste(event: React.ClipboardEvent) {
    const file = Array.from(event.clipboardData.files).find((item) =>
      item.type.startsWith("image/"),
    );
    if (!file || isSending) return;
    event.preventDefault();
    void addScreenshot(file);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;

    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("body", body);
    formData.set("pagePath", window.location.pathname);
    formData.set("userAgent", navigator.userAgent);
    formData.set("viewport", `${window.innerWidth}x${window.innerHeight}`);
    if (screenshot) formData.set("screenshot", screenshot.blob, "screenshot.webp");

    setError(null);
    setIsSending(true);
    let result: Awaited<ReturnType<typeof submitIssueReport>>;
    try {
      result = await submitIssueReport(formData);
    } catch {
      result = { ok: false, error: ISSUE_COPY.failed };
    }
    setIsSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    clearScreenshot();
    toast(ISSUE_COPY.sent, "success");
    onOpenChange(false);
  }

  return (
    <BottomSheet
      isOpen
      onOpenChange={(open) => {
        if (!open && isSending) return;
        onOpenChange(open);
      }}
      title={ISSUE_COPY.title}
      subline={ISSUE_COPY.intro}
      footer={
        <Pill size="lg" type="submit" form={FORM_ID} disabled={!canSend}>
          {isSending ? ISSUE_COPY.sending : ISSUE_COPY.send}
        </Pill>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        onPaste={handlePaste}
        className="flex flex-col gap-4 px-5 pt-3 pb-4"
      >
        <FormField label={ISSUE_COPY.kindLabel}>
          <SegmentedControl
            label={ISSUE_COPY.kindLabel}
            value={kind}
            onChange={(next) => {
              if (next === "problem" || next === "idea") setKind(next);
            }}
            options={ISSUE_KINDS.map((item) => ({
              value: item,
              label: ISSUE_COPY.kinds[item],
            }))}
          />
        </FormField>

        <FormField label={ISSUE_COPY.bodyLabel} htmlFor="report-issue-body">
          <TextArea
            id="report-issue-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={ISSUE_COPY.bodyPlaceholder[kind]}
            maxLength={BODY_MAX}
            rows={4}
            disabled={isSending}
            required
          />
          <span className="self-end text-xs font-bold text-muted tabular-nums">
            {trimmedLength < BODY_MIN ? ISSUE_COPY.bodyTooShort : `${body.length}/${BODY_MAX}`}
          </span>
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-extrabold">{ISSUE_COPY.screenshotLabel}</span>
          {screenshot ? (
            <div className="relative w-fit">
              {/* oxlint-disable-next-line nextjs/no-img-element -- a local blob preview */}
              <img
                src={screenshot.url}
                alt=""
                className="max-h-40 rounded-2xl border border-base-300 object-contain"
              />
              <button
                type="button"
                onClick={clearScreenshot}
                disabled={isSending}
                aria-label={ISSUE_COPY.screenshotRemove}
                className="absolute -top-3 -right-3 flex size-11 items-center justify-center"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-neutral text-neutral-content">
                  <X className="size-3.5" strokeWidth={2.6} aria-hidden />
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Pill
                variant="soft"
                onClick={() => fileInput.current?.click()}
                disabled={isSending || isPreparing}
              >
                <ImagePlus className="size-4" strokeWidth={2.3} aria-hidden />
                {isPreparing ? ISSUE_COPY.screenshotPreparing : ISSUE_COPY.screenshotAdd}
              </Pill>
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void addScreenshot(file);
            }}
          />
          <p className="m-0 text-xs leading-snug font-semibold text-muted">
            {screenshot ? null : `${ISSUE_COPY.screenshotPasteHint} `}
            {ISSUE_COPY.screenshotHint}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="m-0 rounded-2xl bg-wrong-tint px-3.5 py-3 text-sm font-bold text-wrong-text"
          >
            {error}
          </p>
        ) : null}
      </form>
    </BottomSheet>
  );
}
