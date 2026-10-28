"use client";

import { useState } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { closeSystemBrowser } from "@/lib/native/browser";
import { parseAuthDeepLink } from "@/lib/native/auth-deep-link";
import { onAppUrlOpen } from "@/lib/native/events";

/** In the native app, finishes Google sign-in when the system browser hands control back. */
export function NativeAuthBridge() {
  const [finishing, setFinishing] = useState(false);

  useMountEffect(() =>
    onAppUrlOpen((url) => {
      const path = parseAuthDeepLink(url);
      if (!path) return;
      setFinishing(true);
      closeSystemBrowser();
      window.location.assign(path);
    }),
  );

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
