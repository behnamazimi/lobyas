import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONES, type Tone } from "../tones";

/** The label that starts a study mode's controls row. */
export function ModeLabel({
  tone,
  icon,
  children,
  className,
}: {
  tone: Tone;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-[30px] w-fit shrink-0 items-center gap-1.5 rounded-full pr-3 pl-2.5 text-[13px] font-extrabold",
        TONES[tone].soft,
        className,
      )}
    >
      {icon}
      {children}
    </div>
  );
}
