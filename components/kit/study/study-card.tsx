import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The card on a study screen. The body scrolls inside it and the footer stays
 *  pinned, so a long term never pushes the actions off screen. With `onPress` the
 *  whole card is one button (the front of a review card). */
export function StudyCard({
  children,
  footer,
  centered = false,
  onPress,
  pressLabel,
  className,
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** Centers the content, for the front of a card. */
  centered?: boolean;
  onPress?: () => void;
  pressLabel?: string;
  className?: string;
}) {
  const frame = cn(
    "flex min-h-0 w-full flex-1 flex-col rounded-[28px] bg-base-100 text-base-content shadow-[0_1px_2px_rgb(var(--shadow-rgb)/0.05),0_20px_40px_-22px_rgb(var(--shadow-rgb)/0.3)]",
    className,
  );
  const inner = cn(
    "min-h-0 flex-1 overflow-y-auto px-5 pt-[18px] pb-2",
    centered && "flex flex-col items-center justify-center p-6 text-center",
  );
  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        aria-label={pressLabel}
        className={cn(frame, inner, "cursor-pointer")}
      >
        {children}
      </button>
    );
  }
  return (
    <article className={frame}>
      <div className={inner}>{children}</div>
      {footer ? <div className="flex-none px-5 pb-4">{footer}</div> : null}
    </article>
  );
}
