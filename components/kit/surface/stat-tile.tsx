import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONES, type Tone } from "../tones";

/** A big number over a short label. Without a tone it is a white card; with one it is tinted. */
export function StatTile({
  value,
  label,
  tone,
  icon,
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2 py-3 text-center",
        tone ? cn("rounded-[18px]", TONES[tone].soft) : "rounded-[20px] bg-base-100 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1 text-2xl leading-none font-extrabold tabular-nums">
        {icon}
        {value}
      </div>
      <div className={cn("mt-1 text-[13px] font-bold", !tone && "text-muted")}>{label}</div>
    </div>
  );
}
