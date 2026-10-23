"use client";

import { usePathname } from "next/navigation";
import { refreshAfterStudyAction } from "@/app/(private)/app/actions-study";
import { StudyTopBar } from "@/components/kit";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useMediaQuery } from "@/hooks/use-platform";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/safe-next-path";
import { collectionChip } from "./collection-switcher";
import { useShell } from "./shell-context";
import { StudyGoalPill } from "./study-goal-pill";
import type { GoalTier } from "@/lib/goals/levels";

function tierOf(pathname: string): GoalTier | null {
  if (pathname.startsWith("/app/read")) return "read";
  if (pathname.startsWith("/app/review")) return "review";
  if (pathname.startsWith("/app/quiz")) return "quiz";
  return null;
}

const DESKTOP_RAIL = "(min-width: 1024px)";

let pendingRefresh: ReturnType<typeof setTimeout> | undefined;

export function StudyBar() {
  // The timer lets Strict Mode's mount, unmount, mount in dev cancel itself, so
  // nothing is sent when a study page loads.
  useMountEffect(() => {
    clearTimeout(pendingRefresh);
    return () => {
      pendingRefresh = setTimeout(() => void refreshAfterStudyAction(), 0);
    };
  });
  const { current, degraded, setSwitcherOpen } = useShell();
  const desktop = useMediaQuery(DESKTOP_RAIL, false);
  const chip = collectionChip(current);
  const tier = tierOf(usePathname());

  return (
    <div className="px-3 pt-safe pb-2">
      <StudyTopBar
        closeHref={AUTHENTICATED_HOME_PATH}
        goalSlot={
          tier && current ? (
            <StudyGoalPill key={current.id} collectionId={current.id} tier={tier} />
          ) : undefined
        }
        collection={{
          ...chip,
          onPress: degraded || desktop ? undefined : () => setSwitcherOpen(true),
        }}
      />
    </div>
  );
}
