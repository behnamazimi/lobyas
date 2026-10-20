import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TONES, type Tone } from "../tones";

/** White surface with the soft two-layer shadow. `radius` is 24 (`md`) or 28 (`lg`) px. */
export function Card({
  radius = "lg",
  className,
  children,
  ...rest
}: {
  radius?: "md" | "lg";
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"div">, "className" | "children">) {
  return (
    <div
      {...rest}
      className={cn(
        "bg-base-100 shadow-card",
        radius === "lg" ? "rounded-[28px]" : "rounded-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A settings-style section: optional serif-free title and subline, then rows. */
export function SectionCard({
  title,
  description,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card radius="md" className={cn("p-4", className)}>
      {title ? <h2 className="m-0 font-sans text-lg font-extrabold">{title}</h2> : null}
      {description ? (
        <p className="mt-1 mb-2 text-[13px] leading-snug font-semibold text-muted">{description}</p>
      ) : null}
      {children}
    </Card>
  );
}

/** A tinted rounded square for an icon or a letter. `serif` draws a collection letter. */
export function Tile({
  tone = "neutral",
  size = 40,
  serif = false,
  className,
  children,
}: {
  tone?: Tone;
  size?: 24 | 40 | 44 | 48;
  serif?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const box = {
    24: "size-6 rounded-lg text-[13px]",
    40: "size-10 rounded-xl text-lg",
    44: "size-11 rounded-[14px] text-lg",
    48: "size-12 rounded-[14px] text-[22px]",
  }[size];
  return (
    <span
      aria-hidden={serif ? true : undefined}
      className={cn(
        "flex shrink-0 items-center justify-center",
        box,
        TONES[tone].soft,
        serif && "font-heading font-extrabold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div role="separator" className={cn("mx-1 h-px bg-base-300", className)} />;
}
