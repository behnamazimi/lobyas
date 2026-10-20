"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Pill } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import { shareLink } from "@/lib/collections/share";
import type { Collection } from "@/lib/terms/types";

const noSubscribe = () => () => {};
const canShareNatively = () => typeof navigator.share === "function";

/** Copies the collection's link and says so in a toast. */
export async function copyCollectionLink(
  collection: Pick<Collection, "id" | "publicSlug">,
  toast: ReturnType<typeof useToast>["toast"],
  owner: boolean,
) {
  try {
    await navigator.clipboard.writeText(shareLink(collection));
    track("share_link_copied", { owner });
    return true;
  } catch {
    toast("Couldn't copy the link. Try again.", "destructive");
    return false;
  }
}

export function ShareLink({ collection }: { collection: Collection }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const nativeShare = useSyncExternalStore(noSubscribe, canShareNatively, () => false);
  const link = shareLink(collection);

  async function copy() {
    if (!(await copyCollectionLink(collection, toast, true))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    try {
      await navigator.share({ title: collection.name, url: link });
      track("share_native");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast("Couldn't open sharing. Copy the link instead.", "destructive");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          aria-label="Link to this collection"
          onFocus={(event) => event.currentTarget.select()}
          className="h-12 min-w-0 flex-1 rounded-[14px] border-0 bg-base-200 px-3.5 text-sm font-bold text-ink-soft outline-none focus-visible:ring-2 focus-visible:ring-base-content"
        />
        <Pill className="h-12 rounded-[14px]" onClick={() => void copy()}>
          {copied ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {copied ? "Copied" : "Copy link"}
        </Pill>
      </div>
      {nativeShare ? (
        <Pill variant="secondary" onClick={() => void share()}>
          <Share2 className="size-4" aria-hidden />
          Share…
        </Pill>
      ) : null}
    </div>
  );
}
