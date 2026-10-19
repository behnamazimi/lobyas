import Link from "next/link";
import { cn } from "@/lib/utils";

type ModeItem = { href: string; label: string; active: boolean };

/** Two or three links on a pill track, like the Cards and Stories switch. The current one is white. */
export function ModeSwitch({
  label,
  items,
  className,
  ...rest
}: {
  label: string;
  items: ModeItem[];
  className?: string;
} & { "data-tour"?: string }) {
  return (
    <nav
      aria-label={label}
      className={cn("flex shrink-0 rounded-full bg-base-300", className)}
      {...rest}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "flex h-11 items-center rounded-full px-3.5 text-[13px] font-extrabold no-underline",
            item.active ? "bg-base-100 text-base-content shadow-sm" : "text-ink-soft",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
