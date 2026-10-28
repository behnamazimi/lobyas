"use client";

import { ChevronDown } from "lucide-react";
import { useShell } from "./shell-context";

/** Phone and tablet: the current collection, opening the shell's switcher. The
 *  desktop rail has its own switcher, so this hides from `lg`. */
export function CollectionRow({ name }: { name: string }) {
  const { degraded, setSwitcherOpen } = useShell();
  const body = (
    <>
      <span className="text-[13px] font-bold text-muted">Collection</span>
      <span className="min-w-0 flex-1 truncate text-end text-[15px] font-extrabold">{name}</span>
      <ChevronDown className="size-4 shrink-0 text-muted" strokeWidth={2.6} aria-hidden />
    </>
  );
  const classes =
    "flex min-h-12 w-full items-center gap-2.5 rounded-2xl bg-base-100 px-3.5 shadow-card lg:hidden";
  return degraded ? (
    <div className={classes}>{body}</div>
  ) : (
    <button type="button" onClick={() => setSwitcherOpen(true)} className={classes}>
      {body}
    </button>
  );
}
