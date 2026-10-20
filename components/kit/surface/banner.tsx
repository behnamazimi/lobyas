import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONES } from "../tones";

/** A short notice on a tint (yellow for something to do, green for done) with an optional
 *  action on the right and a dismiss button. */
export function Banner({
  tone = "hard",
  action,
  onDismiss,
  className,
  children,
}: {
  tone?: "hard" | "success";
  action?: ReactNode;
  onDismiss?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[18px] px-3.5 py-3",
        TONES[tone].soft,
        className,
      )}
    >
      <div className="min-w-0 flex-1 basis-48 text-sm leading-snug font-bold [overflow-wrap:anywhere]">
        {children}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="-mr-1.5 flex size-11 shrink-0 items-center justify-center rounded-full"
        >
          <X className="size-4" strokeWidth={2.6} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
