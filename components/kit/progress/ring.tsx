import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONES, type Tone } from "../tones";

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A goal ring. `value` is 0 to 1; it starts at the top. Children sit in the middle. */
export function ProgressRing({
  value,
  tone = "read",
  size = 100,
  strokeWidth = 6,
  label,
  className,
  children,
}: {
  value: number;
  tone?: Tone;
  size?: number;
  strokeWidth?: number;
  /** Spoken description, for example "10 of 20 today". Without it the ring is decorative. */
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-base-300"
        />
        {clamped > 0 ? (
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
            className={TONES[tone].ring}
          />
        ) : null}
      </svg>
      {children ? <span className="relative flex">{children}</span> : null}
    </span>
  );
}
