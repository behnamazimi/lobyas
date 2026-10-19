"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
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
  hasInAppHistory: boolean;
};

const ShellContext = createContext<ShellValue | null>(null);

export function useShell(): ShellValue {
  const value = useContext(ShellContext);
  if (!value) throw new Error("App shell is missing");
  return value;
}

function activeCurrent(
  collections: ShellCollection[],
  currentId: string | null,
): ShellCollection | null {
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
      setCurrentCollection(id);
      setOverrideId(id);
      setSwitcherOpen(false);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      if (pathname === "/app/library") {
        router.push(`/app/library?collection=${id}`);
        return;
      }
      if (shellLayout(pathname) === "study") {
        const params = new URLSearchParams(window.location.search);
        params.set("collection", id);
        router.replace(`${pathname}?${params.toString()}`);
        return;
      }
      router.refresh();
    },
    [pathname, router],
  );

  const value = useMemo<ShellValue>(
    () => ({
      email,
      isAdmin,
      initialIsDark,
      streak,
      collections,
      current: activeCurrent(collections, currentId),
      degraded,
      switcherOpen,
      setSwitcherOpen,
      setCollection,
      hasInAppHistory,
    }),
    [
      email,
      isAdmin,
      initialIsDark,
      streak,
      collections,
      currentId,
      degraded,
      switcherOpen,
      setCollection,
      hasInAppHistory,
    ],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}
