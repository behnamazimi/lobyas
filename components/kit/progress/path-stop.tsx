import Link from "next/link";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./ring";

type StopTone = "read" | "review" | "quiz";

const HIGHLIGHT_RING: Record<StopTone, string> = {
  read: "ring-[5px] ring-info",
  review: "ring-[5px] ring-accent",
  quiz: "ring-[5px] ring-secondary",
};

const SOFT_ICON: Record<StopTone, string> = {
  read: "text-read-text",
  review: "text-review-text",
  quiz: "text-quiz-text",
};

/** A stop on Home's path: a round node with an icon, an optional goal ring, and a
 *  check once the goal is met. `highlighted` rings the node in the mode's color.
 *  `onCard` says the stop sits on a white panel, so the check's border matches it. */
export function PathStop({
  href,
  tone,
  icon,
  label,
  ringValue = null,
  met = false,
  highlighted = false,
  onCard = false,
  size = 100,
  className,
}: {
  href: string;
  tone: StopTone;
  icon: ReactNode;
  /** Spoken name of the stop, including progress and queue. */
  label: string;
  /** 0 to 1; null draws no ring (the tier has no goal). */
  ringValue?: number | null;
  met?: boolean;
  highlighted?: boolean;
  onCard?: boolean;
  size?: 100 | 104;
  className?: string;
}) {
  const node = size - 20;
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("relative block shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {ringValue !== null ? (
        <ProgressRing value={ringValue} tone={tone} size={size} className="absolute inset-0" />
      ) : null}
      <span
        className={cn(
          "absolute inset-2.5 flex items-center justify-center rounded-full shadow-card",
          "bg-base-100",
          highlighted ? HIGHLIGHT_RING[tone] : SOFT_ICON[tone],
        )}
        style={{ width: node, height: node }}
      >
        {icon}
      </span>
      {met ? (
        <span
          className={cn(
            "absolute top-0 right-0 flex size-8 items-center justify-center rounded-full border-[3px] bg-success text-success-content",
            onCard ? "border-base-100" : "border-base-200",
          )}
        >
          <Check className="size-4" strokeWidth={4} aria-hidden />
        </span>
      ) : null}
    </Link>
  );
}
