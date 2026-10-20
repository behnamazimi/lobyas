"use client";

import type { ReactNode } from "react";
import { EMPTY_STREAK } from "@/lib/streak/status";
import { ShellFrame } from "./shell-frame";
import { ShellProvider } from "./shell-context";

/** Shown while the shell's collections and streak are still loading. Nav stays;
 *  the switcher stays hidden, the same as a failed collections read. */
export function ShellSkeleton({
  initialIsDark,
  children,
}: {
  initialIsDark: boolean;
  children: ReactNode;
}) {
  return (
    <ShellProvider
      email=""
      isAdmin={false}
      initialIsDark={initialIsDark}
      streak={EMPTY_STREAK}
      collections={[]}
      currentId={null}
      degraded
    >
      <ShellFrame>{children}</ShellFrame>
    </ShellProvider>
  );
}
