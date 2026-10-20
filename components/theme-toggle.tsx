"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { applyTheme, DARK_THEME, LIGHT_THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** `<html data-theme>` is the one source of truth, so the header toggle and
 *  the phone menu toggle always agree. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function readIsDark() {
  return document.documentElement.getAttribute("data-theme") === DARK_THEME;
}

export function ThemeToggle({
  initialIsDark,
  className,
}: {
  initialIsDark: boolean;
  className?: string;
}) {
  const isDark = useSyncExternalStore(subscribeToTheme, readIsDark, () => initialIsDark);

  return (
    <label
      className={cn("swap swap-rotate btn btn-ghost btn-square", className)}
      aria-label="Toggle dark mode"
    >
      <input
        type="checkbox"
        checked={isDark}
        onChange={(event) => {
          applyTheme(event.target.checked ? DARK_THEME : LIGHT_THEME);
        }}
      />
      <SunIcon className="swap-off size-4" />
      <MoonIcon className="swap-on size-4" />
    </label>
  );
}
