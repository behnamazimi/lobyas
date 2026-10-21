"use client";

import { useEffect, useState } from "react";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/button";
import { useShell } from "@/hooks/use-shell";
import { UPDATE_POLICY, storeUrl } from "@/lib/native/update-policy";
import { updateState } from "@/lib/native/version";

const DISMISS_KEY_PREFIX = "lb_update_dismissed:";

function readDismissed(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** In the native app, asks an old version to update, and blocks one below the required version. */
export function NativeUpdateGate() {
  const shell = useShell();
  const dismissKey = `${DISMISS_KEY_PREFIX}${UPDATE_POLICY.recommended}`;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(readDismissed(dismissKey));
  }, [dismissKey]);

  if (!shell.native) return null;

  const state = updateState(shell.version, UPDATE_POLICY);
  if (state === "ok") return null;

  const url = storeUrl(shell.os, navigator.userAgent);
  const updateLink = url ? (
    <LinkButton href={url} size="sm">
      Update
    </LinkButton>
  ) : null;

  if (state === "required") {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="update-required-title"
        className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-4 bg-base-100 p-6 text-center"
      >
        <h1 id="update-required-title" className="text-xl font-medium">
          Update Lobyas to keep going
        </h1>
        <p className="max-w-sm text-sm text-base-content/70">
          This version of the app is too old to work with Lobyas anymore. Update it from the store
          to continue.
        </p>
        {updateLink}
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[900] mx-auto max-w-md pb-[env(safe-area-inset-bottom)]">
      <Alert
        variant="info"
        onDismiss={() => {
          setDismissed(true);
          try {
            window.localStorage.setItem(dismissKey, "1");
          } catch {
            // The banner returns on the next launch.
          }
        }}
      >
        <AlertDescription>A new version of Lobyas is available.</AlertDescription>
        {updateLink ? <AlertAction>{updateLink}</AlertAction> : null}
      </Alert>
    </div>
  );
}
