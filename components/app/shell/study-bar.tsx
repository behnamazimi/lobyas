"use client";

import { usePathname } from "next/navigation";
import { StudyTopBar } from "@/components/kit";
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

export function StudyBar() {
  const { current, degraded, setSwitcherOpen } = useShell();
  const desktop = useMediaQuery(DESKTOP_RAIL, false);
  const chip = collectionChip(current);
  const tier = tierOf(usePathname());

  return (
    <div className="px-3 pt-safe pb-2">
      <StudyTopBar
        closeHref={AUTHENTICATED_HOME_PATH}
        goalSlot={tier ? <StudyGoalPill tier={tier} /> : undefined}
        collection={{
          ...chip,
          onPress: degraded || desktop ? undefined : () => setSwitcherOpen(true),
        }}
      />
    </div>
  );
}
