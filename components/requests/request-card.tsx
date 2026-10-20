"use client";

import { useState, useTransition } from "react";
import {
  cancelRequest,
  dismissRequest,
  replyToRequest,
} from "@/app/(private)/app/actions-requests";
import { Card, ConfirmDialog, Pill, TextArea } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { dueLine, pillFor } from "@/lib/requests/status";
import type { MyRequest } from "@/lib/requests/types";
import { cn } from "@/lib/utils";

const CARD = REQUEST_COPY.card;

const BADGE_CLASS = {
  queue: "bg-base-200 text-ink-soft",
  prep: "bg-hard-tint text-hard-text",
  question: "bg-read-tint text-read-text",
  ready: "bg-success-tint text-success-text",
} as const;

function ReplyBox({ request }: { request: MyRequest }) {
  const { toast } = useToast();
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();

  function send() {
    setError(null);
    startSending(async () => {
      const result = await replyToRequest(request.id, reply);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast(CARD.replySent, "success");
    });
  }

  return (
    <div className="space-y-2">
      <p className="m-0 text-sm">{CARD.question}</p>
      {request.question ? (
        <p className="m-0 rounded-2xl bg-base-200 px-3 py-2 text-sm font-semibold break-words whitespace-pre-line">
          {request.question}
        </p>
      ) : null}
      <label className="block text-sm font-extrabold" htmlFor={`reply-${request.id}`}>
        {CARD.replyLabel}
      </label>
      <TextArea
        id={`reply-${request.id}`}
        value={reply}
        rows={3}
        maxLength={1000}
        disabled={isSending}
        className="w-full"
        onChange={(event) => setReply(event.target.value)}
      />
      {error ? (
        <p className="m-0 text-sm font-bold text-wrong-text" role="alert">
          {error}
        </p>
      ) : null}
      <Pill disabled={isSending || reply.trim().length === 0} onClick={send}>
        {isSending ? CARD.sendingReply : CARD.sendReply}
      </Pill>
    </div>
  );
}

function deliveredLine(request: MyRequest): string {
  if (request.deliveryKind === "added_shared" && request.deliveredCollectionName) {
    return CARD.addedShared(request.deliveredCollectionName);
  }
  if (request.deliveryKind === "filled") return CARD.filled(request.deliveredTerms ?? 0);
  return CARD.ready(request.deliveredTerms ?? 0);
}

function Delivered({ request }: { request: MyRequest }) {
  const collectionId = request.deliveredCollectionId;
  return (
    <div className="space-y-3">
      <p className="m-0 text-sm" role="status">
        {deliveredLine(request)}
      </p>
      {collectionId ? (
        <div className="flex flex-wrap gap-2">
          <Pill href={`/app/read?collection=${collectionId}`}>{CARD.startReading}</Pill>
          <Pill variant="soft" href={`/app/library?collection=${collectionId}`}>
            {CARD.openCollection}
          </Pill>
        </div>
      ) : null}
    </div>
  );
}

function Declined({ request }: { request: MyRequest }) {
  return (
    <div className="space-y-3">
      <p className="m-0 font-extrabold">{CARD.declinedTitle}</p>
      {request.declineReason ? (
        <p className="m-0 text-sm">{REQUEST_COPY.declineReasons[request.declineReason]}</p>
      ) : null}
      {request.declineNote ? <p className="m-0 text-sm text-muted">{request.declineNote}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Pill variant="soft" href="/app/import/paste">
          {CARD.pasteList}
        </Pill>
        <Pill variant="soft" href="/app/browse">
          {CARD.browse}
        </Pill>
      </div>
    </div>
  );
}

export function RequestCard({ request }: { request: MyRequest }) {
  const { toast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isWorking, startWorking] = useTransition();
  const status = request.displayStatus;
  const pill = pillFor(status);
  const canCancel = request.status !== "ready" && request.status !== "declined";
  const closed = status === "ready" || status === "declined";

  function cancel() {
    startWorking(async () => {
      const result = await cancelRequest(request.id);
      toast(result.ok ? CARD.cancelled : result.message, result.ok ? "success" : "destructive");
    });
  }

  function dismiss() {
    startWorking(async () => {
      const result = await dismissRequest(request.id);
      if (!result.ok) toast(result.message, "destructive");
    });
  }

  return (
    <Card radius="md" className="space-y-3 p-4" role="region" aria-label={request.topic}>
      <div className="flex items-start gap-3">
        <h2 className="m-0 min-w-0 flex-1 font-sans text-base font-extrabold break-words">
          {request.topic}
        </h2>
        {pill ? (
          <span
            className={cn(
              "flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-extrabold",
              BADGE_CLASS[pill.tone],
            )}
          >
            {pill.label}
          </span>
        ) : null}
      </div>

      {status === "requested" ? <p className="m-0 text-sm text-muted">{dueLine(request)}</p> : null}
      {status === "in_progress" ? (
        <div className="space-y-1">
          <p className="m-0 text-sm">{CARD.preparing}</p>
          <p className="m-0 text-sm text-muted">{dueLine(request)}</p>
        </div>
      ) : null}
      {status === "needs_input" ? <ReplyBox request={request} /> : null}
      {status === "ready" ? <Delivered request={request} /> : null}
      {status === "declined" ? <Declined request={request} /> : null}

      <div className="flex justify-end">
        {canCancel ? (
          <Pill variant="ghost" disabled={isWorking} onClick={() => setCancelOpen(true)}>
            {CARD.cancel}
          </Pill>
        ) : null}
        {closed ? (
          <Pill variant="ghost" disabled={isWorking} onClick={dismiss}>
            {CARD.dismiss}
          </Pill>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={cancelOpen}
        onOpenChange={setCancelOpen}
        title={CARD.cancelTitle(request.topic)}
        confirmLabel={CARD.cancel}
        onConfirm={() => {
          setCancelOpen(false);
          cancel();
        }}
      >
        {request.accepted ? CARD.cancelBodyStarted : CARD.cancelBody}
      </ConfirmDialog>
    </Card>
  );
}
