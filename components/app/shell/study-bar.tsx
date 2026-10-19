"use client";

import { StudyTopBar } from "@/components/kit";
import { useMediaQuery } from "@/hooks/use-platform";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/safe-next-path";
import { collectionChip } from "./collection-switcher";
import { useShell } from "./shell-context";

const DESKTOP_RAIL = "(min-width: 1024px)";

export function StudyBar() {
  const { current, degraded, setSwitcherOpen } = useShell();
  const desktop = useMediaQuery(DESKTOP_RAIL, false);
  const chip = collectionChip(current);

  return (
    <div className="px-3 pt-safe pb-2">
      <StudyTopBar
        closeHref={AUTHENTICATED_HOME_PATH}
        collection={{
          ...chip,
          onPress: degraded || desktop ? undefined : () => setSwitcherOpen(true),
        }}
      />
    </div>
  );
}
