"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import { isNativeShell } from "@/lib/native/shell";
import { setSystemBarsDark } from "@/lib/native/system-bars";
import { DARK_THEME } from "@/lib/theme";

/** In the native app, matches the status bar icons to the page theme, which can differ from the phone's. */
export function NativeSystemBars() {
  useMountEffect(() => {
    if (!isNativeShell()) return;

    const root = document.documentElement;
    const apply = () => setSystemBarsDark(root.getAttribute("data-theme") === DARK_THEME);

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  });

  return null;
}
