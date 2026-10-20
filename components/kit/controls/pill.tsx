import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PillVariant = "primary" | "secondary" | "soft" | "danger" | "ghost";

const VARIANT: Record<PillVariant, string> = {
  primary: "btn-neutral shadow-[0_10px_20px_-12px_rgb(var(--shadow-rgb)/0.6)]",
  secondary: "bg-base-100 text-base-content shadow-card",
  soft: "bg-base-200 text-base-content",
  danger: "bg-wrong-tint text-wrong-text",
  ghost: "bg-transparent px-3 text-ink-soft",
};

type PillProps = {
  variant?: PillVariant;
  /** `md` is 44 px; `lg` is the pinned 60 px action and fills its row. */
  size?: "md" | "lg";
  /** Renders a link instead of a button. */
  href?: string;
  className?: string;
  /** Marks the pill as a guided-tour target. */
  "data-tour"?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children">;

/** The fully rounded action: ink (primary), white (secondary), tinted (soft) coral (danger) or bare text (ghost). */
export function Pill({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: PillProps) {
  const classes = cn(
    "btn rounded-full border-0 px-5 text-[15px] font-extrabold shadow-none",
    size === "lg" ? "h-[60px] w-full text-[17px]" : "h-11 min-h-11",
    VARIANT[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes} data-tour={rest["data-tour"]}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

/** A 44 px round button for an icon. The label is required: there is no text. */
export function IconButton({
  label,
  tone = "ghost",
  href,
  transitionTypes,
  className,
  children,
  ...rest
}: {
  label: string;
  tone?: "ghost" | "soft";
  href?: string;
  transitionTypes?: ComponentProps<typeof Link>["transitionTypes"];
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children" | "aria-label">) {
  const classes = cn(
    "flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-base-200",
    tone === "soft" && "bg-base-200 text-base-content",
    className,
  );
  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={classes}
        {...(transitionTypes ? { transitionTypes } : {})}
      >
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} className={classes} {...rest}>
      {children}
    </button>
  );
}
