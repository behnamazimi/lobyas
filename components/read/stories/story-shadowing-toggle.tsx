"use client";

import { Speech } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { saveReadOptionAction } from "@/app/(private)/app/read/actions";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Turns Shadowing on or off from the story itself. The story keeps playing;
 *  the player just switches between its shadowing and usual controls. */
export function StoryShadowingToggle({ on }: { on: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [shownOn, setShownOn] = useOptimistic(on);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setShownOn(!on);
      const result = await saveReadOptionAction("shadowing", !on);
      if (result.error) {
        toast(result.error, "destructive");
        return;
      }
      toast(on ? "Shadowing is off" : "Shadowing is on");
      router.refresh();
    });
  }

  return (
    <TooltipTrigger>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Shadowing"
        aria-pressed={shownOn}
        onPress={toggle}
        className={cn(
          "absolute top-1.5 right-2 size-11 rounded-full",
          shownOn ? "bg-read-tint text-read-text" : "text-muted",
        )}
      >
        <Speech className="size-5" aria-hidden strokeWidth={2.2} />
      </Button>
      <Tooltip>{shownOn ? "Shadowing is on" : "Turn on shadowing"}</Tooltip>
    </TooltipTrigger>
  );
}
