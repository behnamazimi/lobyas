import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tile } from "./card";
import type { Tone } from "../tones";

type ListRowProps = {
  label: ReactNode;
  subline?: ReactNode;
  /** The icon drawn inside the tile. */
  icon?: ReactNode;
  tone?: Tone;
  /** Replaces the chevron a linked or pressable row shows. */
  trailing?: ReactNode;
  href?: string;
  onPress?: () => void;
  /** Coral label, for an action that removes something. */
  danger?: boolean;
  className?: string;
};

/** A row: icon tile, label, subline and a trailing slot. A row with `href` or
 *  `onPress` is one tap target (at least 56 px tall) with a chevron. */
export function ListRow({
  label,
  subline,
  icon,
  tone = "neutral",
  trailing,
  href,
  onPress,
  danger,
  className,
}: ListRowProps) {
  const interactive = Boolean(href || onPress);
  const base = cn(
    "flex min-h-14 w-full items-center gap-3 px-1 py-2 text-start",
    danger ? "text-wrong-text" : "text-base-content",
    className,
  );
  const body = (
    <>
      {icon ? <Tile tone={danger ? "wrong" : tone}>{icon}</Tile> : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-extrabold [overflow-wrap:anywhere]">{label}</span>
        {subline ? (
          <span className="text-[13px] leading-snug font-semibold text-muted">{subline}</span>
        ) : null}
      </span>
      {trailing ??
        (interactive ? (
          <ChevronRight className="size-[18px] shrink-0 text-muted" strokeWidth={2.6} aria-hidden />
        ) : null)}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={base}>
        {body}
      </Link>
    );
  }
  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={cn(base, "cursor-pointer")}>
        {body}
      </button>
    );
  }
  return <div className={base}>{body}</div>;
}
