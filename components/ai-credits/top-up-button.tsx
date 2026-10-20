"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { topUpAiCreditsAction } from "@/app/(private)/app/actions-ai-credits";
import { Pill } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { TOPUP_COPY } from "@/lib/ai-credits/topup-copy";

export function TopUpButton({
  size,
  variant,
  className,
  amount,
  onAdded,
}: {
  size?: "md" | "lg";
  variant?: "primary" | "soft";
  className?: string;
  /** The free credits on offer, so the label can say how many. */
  amount?: number;
  onAdded?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function topUp() {
    startTransition(async () => {
      const result = await topUpAiCreditsAction();
      if (!result.ok) {
        const message = {
          unavailable: TOPUP_COPY.unavailable,
          "not-needed": TOPUP_COPY.notNeeded,
          "already-today": TOPUP_COPY.alreadyToday,
          failed: TOPUP_COPY.failed,
        }[result.reason];
        toast(message, "destructive");
        router.refresh();
        return;
      }
      toast(TOPUP_COPY.added(result.added), "success");
      onAdded?.();
      router.refresh();
    });
  }

  return (
    <Pill size={size} variant={variant} className={className} onClick={topUp} disabled={isPending}>
      {isPending ? TOPUP_COPY.working : amount ? TOPUP_COPY.buttonFor(amount) : TOPUP_COPY.button}
    </Pill>
  );
}
