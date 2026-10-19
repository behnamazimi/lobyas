import { Check, SkipForward, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONES } from "../tones";

const KINDS = {
  correct: { tone: "success", Icon: Check },
  wrong: { tone: "wrong", Icon: X },
  skipped: { tone: "quiz", Icon: SkipForward },
} as const;

export type FeedbackKind = keyof typeof KINDS;

/** What a quiz says after an answer: right, wrong or skipped, with a line of detail. */
export function FeedbackNote({
  kind,
  title,
  className,
  children,
}: {
  kind: FeedbackKind;
  title: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const { tone, Icon } = KINDS[kind];
  return (
    <div role="status" className={cn("flex gap-3 rounded-[20px] p-4", TONES[tone].soft, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={3} aria-hidden />
      <div className="min-w-0">
        <div className="text-base font-extrabold">{title}</div>
        {children ? (
          <div className="mt-0.5 text-[15px] leading-snug font-semibold">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
