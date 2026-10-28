"use client";

import type { ReactNode } from "react";
import { useShell } from "./shell-context";

/** Covers a page with its loading skeleton if another collection takes a moment to load.
 *  The current page stays until the skeleton fades in, so a quick switch shows no blank. */
export function SwitchingFallback({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  const { switching } = useShell();
  return (
    <div className="relative flex min-h-0 flex-1 flex-col" aria-busy={switching}>
      {children}
      {switching ? (
        <div className="delayed-fade-in absolute inset-0 z-10 flex flex-col bg-base-200">
          {fallback}
        </div>
      ) : null}
    </div>
  );
}
