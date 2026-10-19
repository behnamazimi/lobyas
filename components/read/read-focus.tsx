"use client";

import { Maximize } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { isStoriesPath } from "@/components/read/read-mode-tabs";
import { IconButton } from "@/components/kit";
import { requestFullscreenOnDocument } from "@/hooks/use-fullscreen-exit";
import { useReadFullscreenPreference } from "@/hooks/use-read-fullscreen-preference";
import { cn } from "@/lib/utils";

type ReadFocus = {
  active: boolean;
  preferenceOn: boolean;
  enter: () => void;
  exit: () => void;
};

const ReadFocusContext = createContext<ReadFocus | null>(null);

/** Focus mode is switched on from the Read header and shown by the Cards
 *  view, so both share this state. */
export function ReadFocusProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const { preferenceOn, setPreference } = useReadFullscreenPreference();

  const value: ReadFocus = {
    active,
    preferenceOn,
    // Must run synchronously in the click handler: deferring it loses the
    // user gesture and silently falls back to the CSS overlay.
    enter: () => {
      requestFullscreenOnDocument();
      setActive(true);
      setPreference(true);
    },
    exit: () => {
      setActive(false);
      setPreference(false);
    },
  };

  return <ReadFocusContext.Provider value={value}>{children}</ReadFocusContext.Provider>;
}

export function useReadFocus(): ReadFocus {
  const value = useContext(ReadFocusContext);
  if (!value) throw new Error("useReadFocus needs a ReadFocusProvider");
  return value;
}

/** Cards only; Stories has no focus mode. */
export function ReadFocusButton() {
  const { enter, preferenceOn } = useReadFocus();
  if (isStoriesPath(usePathname())) return null;

  return (
    <IconButton
      label="Enter focus mode"
      onClick={enter}
      className={cn(
        "transition-transform duration-150 ease-out active:scale-[0.96]",
        preferenceOn && "text-read-text",
      )}
    >
      <Maximize className="size-[22px]" strokeWidth={2.2} aria-hidden />
    </IconButton>
  );
}
