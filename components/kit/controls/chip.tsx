import type { ReactNode } from "react";
import { formatCount } from "@/lib/kit/text";
import { cn } from "@/lib/utils";

/** A filter chip with an optional count. It looks 36 px tall and its tap area reaches 48 px. */
export function Chip({
  selected = false,
  count,
  onPress,
  className,
  children,
}: {
  selected?: boolean;
  count?: number | string;
  onPress?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onPress}
      className={cn(
        "hit-area inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-extrabold",
        selected ? "bg-neutral text-neutral-content" : "bg-base-100 text-base-content shadow-card",
        className,
      )}
    >
      {children}
      {count !== undefined ? (
        <span
          className={cn(
            "text-[13px] font-bold tabular-nums",
            selected ? "opacity-80" : "text-muted",
          )}
        >
          {typeof count === "number" ? formatCount(count) : count}
        </span>
      ) : null}
    </button>
  );
}
