"use client";

import { useRef, useState, type Ref } from "react";
import {
  StoryAudioControls,
  type StoryPlayerHandle,
} from "@/components/read/stories/story-audio-controls";
import type { ShadowingSetup } from "@/components/read/stories/use-shadowing-playback";
import type { ClipPauses } from "@/lib/stories/silence";
import { ListenButton } from "@/components/kit";
import { TopUpButton } from "@/components/ai-credits/top-up-button";
import { CreditGateNotice } from "@/components/ai-credits/credit-gate-notice";
import { creditGate } from "@/lib/ai-credits/gate";
import type { TopUpState } from "@/lib/ai-credits/types";
import { useMountEffect } from "@/hooks/use-mount-effect";
import type { NarrationPrice } from "@/lib/stories/narration-price";

const RETRY_INTERVAL_MS = 3000;
const PREPARE_TIMEOUT_MS = 2 * 60 * 1000;

type PlayerStatus = "idle" | "preparing" | "ready" | "capped" | "insufficient" | "unavailable";

const STATUS_MESSAGES: Partial<Record<PlayerStatus, string>> = {
  preparing: "Preparing audio…",
  capped: "Daily listening limit reached. Try again tomorrow.",
  unavailable: "Audio unavailable for this story.",
};

const REFUSED_STATUS: Record<number, PlayerStatus> = { 429: "capped", 402: "insufficient" };

function isShort(price: NarrationPrice | null | undefined): price is NarrationPrice {
  return price != null && price.cost > price.remaining;
}

function isBlocked(status: PlayerStatus, price: NarrationPrice | null | undefined) {
  return status === "insufficient" || (status === "idle" && isShort(price));
}

function shortSummary(status: PlayerStatus, price: NarrationPrice | null | undefined) {
  if (status === "idle" && isShort(price)) {
    return `This audio needs ${price.cost} credits and you have ${price.remaining}.`;
  }
  return "You don't have enough credits to make this audio.";
}

function NarrationCreditGate({
  summary,
  topUp,
  onAdded,
}: {
  summary: string;
  topUp: TopUpState | undefined;
  onAdded: () => void;
}) {
  const gate = creditGate(topUp);
  return (
    <CreditGateNotice
      gate={gate}
      summary={summary}
      action={
        gate.kind === "top-up" ? (
          <TopUpButton variant="soft" amount={gate.amount} onAdded={onAdded} />
        ) : null
      }
    />
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Audio is made on the first Listen tap, so the player asks the route to
 *  prepare it (retrying while another request is still making it), then hands
 *  the ready file to the story's audio controls. */
export function StoryNarrationPlayer({
  storyId,
  onProgress,
  shadowing,
  sentencePlayback,
  handleRef,
  onClipPauses,
  price,
  topUp,
}: {
  storyId: string;
  onProgress?: (fraction: number | null) => void;
  shadowing?: ShadowingSetup | null;
  sentencePlayback?: ShadowingSetup | null;
  handleRef?: Ref<StoryPlayerHandle>;
  onClipPauses?: (clip: ClipPauses) => void;
  /** What making this audio costs, if credits pay for it. The first listen pays;
   *  a clip that already exists is free. */
  price?: NarrationPrice | null;
  /** Whether the free top-up would work, for when the audio can't be paid for. */
  topUp?: TopUpState;
}) {
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [version, setVersion] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const base = `/api/stories/${storyId}/narration`;
  const src = version ? `${base}?v=${version}` : base;

  useMountEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  });

  async function prepare() {
    setStatus("preparing");
    const deadline = Date.now() + PREPARE_TIMEOUT_MS;
    while (!cancelledRef.current && Date.now() < deadline) {
      let response: Response;
      try {
        response = await fetch(base, { method: "POST" });
      } catch {
        break;
      }
      if (cancelledRef.current) return;
      if (response.status === 200) {
        const body: { version?: string } = await response.json().catch(() => ({}));
        setVersion(body.version ?? null);
        setStatus("ready");
        return;
      }
      const refused = REFUSED_STATUS[response.status];
      if (refused) {
        setStatus(refused);
        return;
      }
      if (response.status !== 202) break;
      await sleep(RETRY_INTERVAL_MS);
    }
    if (!cancelledRef.current) setStatus("unavailable");
  }

  if (status === "ready") {
    return (
      <StoryAudioControls
        src={src}
        onError={() => {
          setStatus("unavailable");
          onProgress?.(null);
        }}
        onProgress={onProgress}
        shadowing={shadowing}
        sentencePlayback={sentencePlayback}
        handleRef={handleRef}
        onClipPauses={onClipPauses}
      />
    );
  }

  const blocked = isBlocked(status, price);
  const message = blocked ? null : STATUS_MESSAGES[status];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <ListenButton
          status={status === "preparing" ? "loading" : "idle"}
          onPress={() => void prepare()}
          disabled={status === "preparing" || status === "capped" || status === "insufficient"}
          label={`${shadowing ? "Listen and shadow" : "Listen"}${
            price ? ` · ${price.cost} ${price.cost === 1 ? "credit" : "credits"}` : ""
          }`}
          className="h-12"
        />
        {message ? (
          <p className="m-0 text-sm font-bold text-muted" role="status">
            {message}
          </p>
        ) : null}
      </div>
      {blocked ? (
        <NarrationCreditGate
          summary={shortSummary(status, price)}
          topUp={price?.topUp ?? topUp}
          onAdded={() => setStatus("idle")}
        />
      ) : null}
    </div>
  );
}
