import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "./nav-items";

/** The desktop rail: brand, collection switcher, the four destinations, the
 *  streak card and the account row. The shell pins it to the window. */
export function Rail({
  activeKey,
  items = NAV_ITEMS,
  brand,
  switcher,
  streak,
  account,
  className,
}: {
  activeKey: string;
  items?: NavItem[];
  brand?: ReactNode;
  switcher?: ReactNode;
  streak?: ReactNode;
  account?: ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("flex w-60 flex-col gap-4 bg-base-100 p-4", className)}>
      {brand ? <div className="px-2 pt-1">{brand}</div> : null}
      {switcher}
      <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const active = item.key === activeKey;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              data-tour={`nav-${item.key}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-3 rounded-full px-4 text-[15px]",
                active
                  ? "bg-success-tint font-extrabold text-success-text"
                  : "font-bold text-muted hover:bg-base-200",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={2.3} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {streak || account ? (
        <div className="flex flex-col gap-2">
          {streak}
          {account}
        </div>
      ) : null}
    </aside>
  );
}
