"use client";

import { useState, type FormEvent } from "react";
import { reportCollection } from "@/app/(private)/app/actions";
import { BottomSheet, FormField, Pill, RadioList, TextArea } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import {
  REPORT_NOTE_MAX,
  REPORT_REASON_LABELS,
  REPORT_REASONS,
  REPORTED_THANKS,
  type ReportReason,
} from "@/lib/collections/moderation";

type ReportCollectionSheetProps = {
  collectionId: string;
  collectionName: string;
  onReported: () => void;
  onClose: () => void;
};

/** Mount it only while it is open, so every opening starts empty. */
export function ReportCollectionSheet({
  collectionId,
  collectionName,
  onReported,
  onClose,
}: ReportCollectionSheetProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!reason || pending) return;
    setPending(true);
    setError(null);
    const result = await reportCollection(collectionId, reason, note);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast(REPORTED_THANKS, "success");
    onReported();
    onClose();
  }

  return (
    <BottomSheet
      isOpen
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
      title="Report collection"
      subline={collectionName}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <p className="m-0 text-[13px] leading-snug font-semibold text-muted">
          Tell us what&apos;s wrong. Only the people who look after Lobyas will see this.
        </p>
        <RadioList
          label="Reason"
          options={REPORT_REASONS.map((value) => ({
            value,
            label: REPORT_REASON_LABELS[value],
          }))}
          value={reason ?? ""}
          onChange={(value) => setReason(value as ReportReason)}
        />
        <FormField label="Add a note (optional)" htmlFor="report-note">
          <TextArea
            id="report-note"
            rows={3}
            maxLength={REPORT_NOTE_MAX}
            placeholder={`Up to ${REPORT_NOTE_MAX} characters`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </FormField>
        {error ? (
          <p role="alert" className="m-0 text-sm font-bold text-wrong-text">
            {error}
          </p>
        ) : null}
        <Pill type="submit" size="lg" disabled={!reason || pending}>
          {pending ? "Reporting…" : "Report"}
        </Pill>
      </form>
    </BottomSheet>
  );
}
