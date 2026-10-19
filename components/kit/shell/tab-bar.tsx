import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "./nav-items";

/** The phone and tablet tab bar (a DaisyUI dock). The shell hides it from `lg` up
 *  and on study routes. `placement="static"` keeps it in the flow, for stories. */
export function TabBar({
  activeKey,
  items = NAV_ITEMS,
  placement = "fixed",
  className,
}: {
  activeKey: string;
  items?: NavItem[];
  placement?: "fixed" | "static";
  className?: string;
}) {
  return (
    <nav
      aria-label="Main"
      className={cn(
        "dock dock-safe bg-base-100 shadow-[0_-10px_30px_-18px_rgb(var(--shadow-rgb)/0.22)]",
        placement === "static" && "static!",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("min-h-14 gap-0.5", active ? "text-success-text" : "text-muted")}
          >
            <span
              className={cn(
                "flex h-[34px] w-14 items-center justify-center rounded-full",
                active && "bg-success-tint",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={2.3} aria-hidden />
            </span>
            <span className={cn("text-xs", active ? "font-extrabold" : "font-bold")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
