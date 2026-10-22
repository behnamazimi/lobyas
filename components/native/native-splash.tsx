"use client";

import { useEffect } from "react";
import { isNativeShell } from "@/lib/native/shell";
import {
  hasRetriedSplashLoad,
  markSplashDone,
  markSplashRetried,
  nextSplashStep,
  SPLASH_FADE_MS,
  SPLASH_MIN_MS,
} from "@/lib/native/splash";

function loadStatus(): number | undefined {
  const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return entry?.responseStatus;
}

/**
 * In the native app, once the page has painted its own splash frame (NativeSplashFrame, the
 * same picture as the launch screen) the native splash goes. The frame blinks until the page
 * the web view loaded is a good one, and is held for a moment so the blink is seen.
 * The app's own `launchShowDuration` hides the native splash anyway if the page never loads.
 */
export function NativeSplash() {
  useEffect(() => {
    if (!isNativeShell()) return;

    const root = document.documentElement;
    const frame = document.getElementById("native-splash");
    const timers: number[] = [];
    let cancelled = false;

    const hideNative = () =>
      void import("@capacitor/splash-screen")
        .then(({ SplashScreen }) => SplashScreen.hide({ fadeOutDuration: 0 }))
        .catch(() => {});

    const leave = () => {
      frame?.setAttribute("data-leaving", "");
      timers.push(
        window.setTimeout(() => {
          root.removeAttribute("data-splash");
          frame?.removeAttribute("data-leaving");
          markSplashDone(sessionStorage);
        }, SPLASH_FADE_MS),
      );
    };

    const painted = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (cancelled) return;
        if (!root.hasAttribute("data-splash")) return hideNative();

        const step = nextSplashStep({
          status: loadStatus(),
          retried: hasRetriedSplashLoad(sessionStorage),
        });
        if (step === "retry") {
          // The native splash stays up through the reload.
          markSplashRetried(sessionStorage);
          return location.reload();
        }

        hideNative();
        const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
        timers.push(window.setTimeout(leave, reducedMotion ? 0 : SPLASH_MIN_MS));
      }),
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(painted);
      timers.forEach(clearTimeout);
    };
  }, []);

  return null;
}
