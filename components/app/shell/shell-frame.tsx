"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TabBar } from "@/components/kit";
import { cn } from "@/lib/utils";
import { navKey, shellLayout } from "@/lib/chrome";
import { AppRail } from "./app-rail";
import { CollectionSwitcher } from "./collection-switcher";
import { StudyBar } from "./study-bar";
import { SubPageBar } from "./sub-page-bar";

export function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const layout = shellLayout(pathname);

  if (layout === "site") {
    return <main className="flex min-h-0 flex-1 flex-col">{children}</main>;
  }

  const activeKey = navKey(pathname) ?? "";
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-row">
      <AppRail activeKey={activeKey} />
      <div
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col", layout === "study" && "bg-base-200")}
      >
        {layout === "study" ? <StudyBar /> : null}
        {layout === "sub" ? <SubPageBar /> : null}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
        {layout === "tabs" ? (
          <TabBar
            activeKey={activeKey || "home"}
            placement="static"
            className="lg:hidden [[data-keyboard=open]_&]:hidden"
          />
        ) : null}
      </div>
      <CollectionSwitcher />
    </div>
  );
}
