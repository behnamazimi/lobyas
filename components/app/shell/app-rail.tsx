"use client";

import Link from "next/link";
import { emailInitials } from "@/components/app/account-nav";
import { BrandIcon } from "@/components/brand-icon";
import { Rail } from "@/components/kit";
import { StreakBadge } from "@/components/streak-badge";
import { CLAMP_ONE_LINE } from "@/lib/kit/text";
import { cn } from "@/lib/utils";
import { collectionChip, CollectionList } from "./collection-switcher";
import { useShell } from "./shell-context";

export function AppRail({ activeKey }: { activeKey: string }) {
  const { current, email, streak, degraded } = useShell();
  const chip = collectionChip(current);

  return (
    <Rail
      activeKey={activeKey}
      className="hidden h-dvh shrink-0 lg:flex"
      brand={
        <Link href="/app" className="flex items-center gap-2">
          <BrandIcon />
          <span className="font-heading text-2xl font-extrabold">Lobyas</span>
        </Link>
      }
      switcher={
        degraded ? null : (
          <div className="dropdown dropdown-bottom w-full">
            <button
              type="button"
              tabIndex={0}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-2 text-start hover:bg-base-200"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-base-200 font-heading text-lg font-extrabold">
                {chip.letter}
              </span>
              <span className={cn("min-w-0 flex-1 text-base font-extrabold", CLAMP_ONE_LINE)}>
                {chip.name}
              </span>
            </button>
            <div
              tabIndex={0}
              className="dropdown-content z-20 mt-1 w-72 rounded-3xl bg-base-100 p-2 shadow-sheet"
            >
              <CollectionList />
            </div>
          </div>
        )
      }
      streak={<StreakBadge streak={streak} variant="card" />}
      account={
        email ? (
          <Link
            href="/app/me"
            className="flex min-h-14 items-center gap-3 rounded-2xl px-2 hover:bg-base-200"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-200 font-heading text-sm font-extrabold">
              {emailInitials(email)}
            </span>
            <span className={cn("min-w-0 flex-1 text-sm font-bold", CLAMP_ONE_LINE)}>{email}</span>
          </Link>
        ) : null
      }
    />
  );
}
