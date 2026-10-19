"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useKeyboardOpen } from "@/hooks/use-keyboard-open";
import { shellLayout } from "@/lib/chrome";
import { cn } from "@/lib/utils";

export function AppShell({
  header,
  footer,
  signedIn,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  signedIn: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  useKeyboardOpen();
  const app = signedIn && shellLayout(pathname) !== "site";

  if (!app) {
    return (
      <div className="flex min-h-full flex-1 flex-col" data-chrome="site">
        {header}
        {signedIn ? children : <main className="flex min-h-0 flex-1 flex-col">{children}</main>}
        {footer}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col",
        "max-lg:fixed max-lg:inset-0 max-lg:min-h-0 max-lg:overflow-hidden",
        "lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden",
        shellLayout(pathname) === "tabs" && "chrome-tabs",
      )}
      data-chrome="study"
    >
      {children}
    </div>
  );
}
