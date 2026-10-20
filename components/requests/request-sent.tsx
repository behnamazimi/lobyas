"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { setRequestNotify } from "@/app/(private)/app/actions-requests";
import { Card, PinnedAction, Pill, Tile, ToggleRow } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { REQUEST_COPY } from "@/lib/requests/copy";

const SENT = REQUEST_COPY.sent;

export function RequestSent({
  id,
  topic,
  estimateDays,
}: {
  id: string;
  topic: string;
  estimateDays: number;
}) {
  const { toast } = useToast();
  const [notify, setNotify] = useState(true);

  async function changeNotify(next: boolean) {
    setNotify(next);
    const result = await setRequestNotify(id, next);
    if (!result.ok) {
      setNotify(!next);
      toast(result.message, "destructive");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-5 pt-2">
      <Tile tone="success" size={48}>
        <Check className="size-6" aria-hidden strokeWidth={2.6} />
      </Tile>
      <div className="flex flex-col gap-1">
        <h2 tabIndex={-1} className="m-0 font-heading text-2xl font-extrabold outline-none">
          {SENT.title}
        </h2>
        <p className="m-0 text-[15px] font-semibold text-ink-soft" role="status">
          {SENT.body(topic, estimateDays)}
        </p>
      </div>

      <Card radius="md" className="px-4 py-1">
        <ToggleRow
          label={SENT.email}
          description={SENT.emailHint}
          checked={notify}
          onChange={(next) => void changeNotify(next)}
        />
      </Card>

      <PinnedAction className="flex flex-col gap-2">
        <Pill size="lg" href="/app/import">
          {SENT.done}
        </Pill>
        <Pill variant="ghost" href="/app/browse">
          {SENT.browse}
        </Pill>
      </PinnedAction>
    </div>
  );
}
