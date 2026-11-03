"use client";

import { usePathname } from "next/navigation";
import { refreshAfterStudyAction } from "@/app/(private)/app/actions-study";
import { StudyTopBar } from "@/components/kit";
import type { Tone } from "@/components/kit/tones";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useMediaQuery } from "@/hooks/use-platform";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/safe-next-path";
import { useShell } from "./shell-context";
import { useStudyBarSlots } from "./study-bar-slots";
import { StudyGoalText } from "./study-goal-text";
import type { GoalTier } from "@/lib/goals/levels";

type StudyMode = { label: string; tone: Tone; tier: GoalTier | null };

function modeOf(pathname: string): StudyMode {
  if (pathname.startsWith("/app/review"))
    return { label: "Review", tone: "review", tier: "review" };
  if (pathname.startsWith("/app/quiz")) return { label: "Quiz", tone: "quiz", tier: "quiz" };
  if (pathname.startsWith("/app/triage")) return { label: "Triage", tone: "success", tier: null };
  return { label: "Read", tone: "read", tier: "read" };
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
  const slots = useStudyBarSlots();
  const desktop = useMediaQuery(DESKTOP_RAIL, false);
  const { tier, ...mode } = modeOf(usePathname());

  return (
    <div className="px-4 pt-safe pb-1">
      <StudyTopBar
        closeHref={AUTHENTICATED_HOME_PATH}
        mode={mode}
        collection={
          current
            ? {
                name: current.name,
                onPress: degraded || desktop ? undefined : () => setSwitcherOpen(true),
              }
            : null
        }
        goal={
          tier && current ? (
            <StudyGoalText key={current.id} collectionId={current.id} tier={tier} />
          ) : undefined
        }
        center={<div ref={slots?.setCenter} className="contents" />}
        end={<div ref={slots?.setEnd} className="contents" />}
      />
    </div>
  );
}
