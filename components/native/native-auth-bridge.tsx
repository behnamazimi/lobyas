"use client";

import { useEffect, useState } from "react";
import { parseAuthDeepLink } from "@/lib/native/auth-deep-link";
import { isNativeShell } from "@/lib/native/shell";

/** In the native app, finishes Google sign-in when the system browser hands control back. */
export function NativeAuthBridge() {
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!isNativeShell()) return;

    let cancelled = false;
    let removeListener: (() => Promise<void>) | undefined;

    void (async () => {
      const [{ App }, { Browser }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/browser"),
      ]);
      const handle = await App.addListener("appUrlOpen", ({ url }) => {
        const path = parseAuthDeepLink(url);
        if (!path) return;
        setFinishing(true);
        void Browser.close().catch(() => {});
        window.location.assign(path);
      });
      if (cancelled) {
        await handle.remove();
        return;
      }
      removeListener = handle.remove;
    })();

    return () => {
      cancelled = true;
      void removeListener?.();
    };
  }, []);

  if (!finishing) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-base-100/90 backdrop-blur-sm"
    >
      <span className="loading loading-spinner loading-lg" />
      <p className="text-sm text-base-content/70">Signing you in…</p>
    </div>
  );
}
