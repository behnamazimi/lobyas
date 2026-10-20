"use client";

import { useState, useTransition } from "react";
import { createDefinitionsRequest } from "@/app/(private)/app/import/request/actions";
import { RequestSent } from "@/components/requests/request-sent";
import { Banner, PinnedAction, Pill } from "@/components/kit";
import { REQUEST_COPY } from "@/lib/requests/copy";

const FORM = REQUEST_COPY.form;
const DEFS = REQUEST_COPY.definitions;
const SHOWN_WORDS = 20;

export function DefinitionsForm({
  collectionId,
  name,
  words,
  count,
  estimateDays,
  paused,
  used,
}: {
  collectionId: string;
  name: string;
  /** The first few words, for a look at what is being asked. */
  words: string[];
  count: number;
  estimateDays: number;
  paused: boolean;
  used: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{
    id: string;
    topic: string;
    estimateDays: number;
  } | null>(null);
  const [isSending, startSending] = useTransition();

  if (sent) return <RequestSent {...sent} />;

  function send() {
    setError(null);
    startSending(async () => {
      const result = await createDefinitionsRequest({
        collectionId,
        notifyEmail: true,
      });
      if (result.ok) setSent(result);
      else setError(result.message);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="m-0 text-sm font-semibold text-muted">{FORM.quota(used)}</p>
      {paused ? <Banner>{FORM.paused(estimateDays)}</Banner> : null}

      <div className="flex flex-col gap-2">
        <p className="m-0 text-[15px] font-semibold">{DEFS.intro(name)}</p>
        <p className="m-0 text-sm font-extrabold">{DEFS.waiting(count)}</p>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {words.slice(0, SHOWN_WORDS).map((word) => (
            <li
              key={word}
              className="rounded-full bg-base-100 px-3 py-1.5 text-sm font-bold shadow-card"
            >
              {word}
            </li>
          ))}
          {count > SHOWN_WORDS ? (
            <li className="px-1 py-1.5 text-sm font-semibold text-muted">+{count - SHOWN_WORDS}</li>
          ) : null}
        </ul>
      </div>

      {error ? (
        <p className="m-0 text-sm font-bold text-wrong-text" role="alert">
          {error}
        </p>
      ) : null}

      <PinnedAction>
        <Pill size="lg" disabled={isSending} onClick={send}>
          {isSending ? FORM.sending : FORM.submit}
        </Pill>
        <p className="m-0 mt-2 text-center text-[13px] font-semibold text-muted">
          {FORM.eta(estimateDays)}
        </p>
      </PinnedAction>
    </div>
  );
}
