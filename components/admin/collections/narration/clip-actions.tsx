"use client";

import { useTransition } from "react";
import { regenerateClip } from "@/app/(private)/admin/collections/narration-clip-actions";
import { useToast } from "@/components/ui/toast";
import { settleAdminAction } from "@/lib/admin/settle-action";

export function RegenerateClipButton({
  collectionId,
  termId,
  term,
  disabled,
}: {
  collectionId: string;
  termId: string;
  term: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function regenerate() {
    startTransition(async () => {
      const result = await settleAdminAction(() => regenerateClip(collectionId, termId));
      toast(
        result.ok
          ? `Made ${term}${result.data.provider ? ` with ${result.data.provider}` : ""}.`
          : result.error,
      );
    });
  }

  return (
    <button
      type="button"
      className="btn btn-xs"
      disabled={disabled || isPending}
      aria-label={`Regenerate narration of ${term}`}
      onClick={regenerate}
    >
      {isPending ? "Making…" : "Regenerate"}
    </button>
  );
}
