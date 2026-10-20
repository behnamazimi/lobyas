import { Loader2, Pause, Volume2 } from "lucide-react";
import { ListenButton } from "@/components/kit";
import { Button } from "@/components/ui/button";

export type NarrationStatus = "idle" | "loading" | "playing" | "paused";

/** The play button of a term clip: a small icon, or the labelled Listen pill of the study cards. */
export function NarrationButton({
  status,
  look,
  onPress,
}: {
  status: NarrationStatus;
  look: "icon" | "pill";
  onPress: () => void;
}) {
  const ariaLabel = status === "playing" ? "Pause" : "Listen (AI voice)";
  if (look === "pill") {
    return (
      <ListenButton
        status={status === "playing" ? "playing" : status === "loading" ? "loading" : "idle"}
        onPress={onPress}
        disabled={status === "loading"}
        ariaLabel={ariaLabel}
      />
    );
  }
  const Icon = status === "loading" ? Loader2 : status === "playing" ? Pause : Volume2;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-11 rounded-full text-ink-soft"
      onPress={onPress}
      isDisabled={status === "loading"}
      aria-label={ariaLabel}
    >
      <Icon
        className={status === "loading" ? "size-4 animate-spin" : "size-4"}
        aria-hidden
        strokeWidth={1.5}
      />
    </Button>
  );
}
