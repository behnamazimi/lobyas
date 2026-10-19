import { Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListenStatus = "idle" | "loading" | "playing";

/** The blue Listen pill on a term. It reads as pressed while the clip plays. */
export function ListenButton({
  status = "idle",
  onPress,
  label = "Listen",
  className,
}: {
  status?: ListenStatus;
  onPress?: () => void;
  label?: string;
  className?: string;
}) {
  const Icon = status === "loading" ? Loader2 : Volume2;
  return (
    <button
      type="button"
      aria-pressed={status === "playing"}
      aria-busy={status === "loading"}
      onClick={onPress}
      className={cn(
        "flex h-11 shrink-0 items-center gap-1.5 rounded-full pr-3.5 pl-3 text-sm font-extrabold text-read-text",
        status === "playing" ? "bg-read/30" : "bg-read-tint",
        className,
      )}
    >
      <Icon
        className={cn("size-[18px]", status === "loading" && "animate-spin")}
        strokeWidth={2.4}
        aria-hidden
      />
      {status === "playing" ? "Playing" : label}
    </button>
  );
}
