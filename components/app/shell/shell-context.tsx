"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { setCurrentCollection } from "@/lib/collections/current";
import { shellLayout } from "@/lib/chrome";
import type { StreakSummary } from "@/lib/streak/status";
import type { CollectionKind } from "@/lib/terms/kinds";

export type ShellCollection = {
  id: string;
  name: string;
  kind: CollectionKind;
  termCount: number;
  termsLearnedCount: number;
  queues: { read: number; review: number; quiz: number };
  description: string | null;
  language: string;
  isActiveForReview: boolean;
};

type ShellValue = {
  email: string;
  isAdmin: boolean;
  initialIsDark: boolean;
  streak: StreakSummary;
  collections: ShellCollection[];
  current: ShellCollection | null;
  degraded: boolean;
  switcherOpen: boolean;
  setSwitcherOpen: (open: boolean) => void;
  setCollection: (id: string) => void;
  /** True from picking a collection until the new page is on screen. */
  switching: boolean;
  hasInAppHistory: boolean;
};

const ShellContext = createContext<ShellValue | null>(null);

export function useShell(): ShellValue {
  const value = useContext(ShellContext);
  if (!value) throw new Error("App shell is missing");
  return value;
}

/** Only the Library may sit on a paused collection; everywhere else studies an active one. */
function activeCurrent(
  collections: ShellCollection[],
  currentId: string | null,
  allowPaused: boolean,
): ShellCollection | null {
  const picked = collections.find((collection) => collection.id === currentId);
  if (allowPaused && picked) return picked;
  const active = collections.filter((collection) => collection.isActiveForReview);
  return active.find((collection) => collection.id === currentId) ?? active[0] ?? null;
}

export function ShellProvider({
  email,
  isAdmin,
  initialIsDark,
  streak,
  collections,
  currentId: initialCurrentId,
  degraded,
  children,
}: {
  email: string;
  isAdmin: boolean;
  initialIsDark: boolean;
  streak: StreakSummary;
  collections: ShellCollection[];
  currentId: string | null;
  degraded: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [switching, startSwitch] = useTransition();
  const [seenPath, setSeenPath] = useState(pathname);
  const [hasInAppHistory, setHasInAppHistory] = useState(false);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setHasInAppHistory(true);
  }
  if (overrideId && overrideId === initialCurrentId) setOverrideId(null);

  const currentId = overrideId ?? initialCurrentId;
  const setCollection = useCallback(
    (id: string) => {
      if (switching) return;
      setCurrentCollection(id);
      setOverrideId(id);
      setSwitcherOpen(false);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      const paused = collections.some(
        (collection) => collection.id === id && !collection.isActiveForReview,
      );
      if (pathname === "/app/library" || paused) {
        startSwitch(() => router.push(`/app/library?collection=${id}`));
        return;
      }
      if (shellLayout(pathname) === "study") {
        const params = new URLSearchParams(window.location.search);
        params.set("collection", id);
        startSwitch(() => router.replace(`${pathname}?${params.toString()}`));
        return;
      }
      startSwitch(() => router.refresh());
    },
    [collections, pathname, router, switching],
  );

  const value = useMemo<ShellValue>(
    () => ({
      email,
      isAdmin,
      initialIsDark,
      streak,
      collections,
      current: activeCurrent(collections, currentId, pathname === "/app/library"),
      degraded,
      switcherOpen,
      setSwitcherOpen,
      setCollection,
      switching,
      hasInAppHistory,
    }),
    [
      email,
      isAdmin,
      initialIsDark,
      streak,
      collections,
      currentId,
      pathname,
      degraded,
      switcherOpen,
      setCollection,
      switching,
      hasInAppHistory,
    ],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}
