"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setNarrationRoute } from "@/app/(private)/admin/ai/narration/actions";
import { settleAdminAction } from "@/lib/admin/settle-action";
import { PROVIDER_LABELS } from "@/lib/ai/speech/labels";
import type { SpeechProvider } from "@/lib/ai/speech/provider";
import { ROUTE_LABELS, type NarrationRoute } from "@/lib/ai/speech/routes";

/** Shows a change at once, and falls back if saving fails. */
export function RouteSelect({
  route,
  provider,
}: {
  route: NarrationRoute;
  provider: SpeechProvider;
}) {
  const [shown, setShown] = useOptimistic(provider);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(target: SpeechProvider) {
    if (isPending || target === provider) return;
    setError(null);
    startTransition(async () => {
      setShown(target);
      const result = await settleAdminAction(() => setNarrationRoute(route, target));
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        className="select select-sm w-44"
        aria-label={`Voice used first for ${ROUTE_LABELS[route].toLowerCase()}`}
        aria-disabled={isPending || undefined}
        value={shown}
        onChange={(event) => handleChange(event.target.value as SpeechProvider)}
      >
        {(Object.keys(PROVIDER_LABELS) as SpeechProvider[]).map((option) => (
          <option key={option} value={option}>
            {PROVIDER_LABELS[option]}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="m-0 text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
