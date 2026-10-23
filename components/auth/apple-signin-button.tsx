"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNative } from "@/hooks/use-native";
import {
  APPLE_SERVICES_ID,
  AppleSignInCancelled,
  exchangeAppleCredential,
  isNativeAppleAvailable,
  requestAppleCredential,
} from "@/lib/auth/apple-client";

type AppleSignInButtonProps = {
  next?: string;
  referenceCode?: string;
  label?: string;
};

function AppleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

/** The iOS app uses the system Apple sheet; browsers use Apple's popup. The Android app has neither. */
export function AppleSignInButton({
  next = "/complete-signup",
  referenceCode,
  label = "Continue with Apple",
}: AppleSignInButtonProps) {
  const shell = useNative();
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!shell.native) return;
    let cancelled = false;
    void isNativeAppleAvailable().then((available) => {
      if (!cancelled) setNativeAvailable(available);
    });
    return () => {
      cancelled = true;
    };
  }, [shell.native]);

  const visible = shell.native ? nativeAvailable : Boolean(APPLE_SERVICES_ID);
  if (!visible) return null;

  async function signIn() {
    setStarting(true);
    try {
      const credential = await requestAppleCredential(shell.native);
      const result = await exchangeAppleCredential(credential, { next, ref: referenceCode });
      if (result.redirectTo) {
        window.location.assign(result.redirectTo);
        return;
      }
      window.location.assign(`/login?error=${result.error ?? "oauth-failed"}`);
    } catch (error) {
      if (!(error instanceof AppleSignInCancelled)) {
        window.location.assign("/login?error=oauth-failed");
        return;
      }
    }
    setStarting(false);
  }

  return (
    <Button
      type="button"
      className="w-full border-black bg-black text-white hover:bg-black/85 in-data-[theme=dim]:border-white in-data-[theme=dim]:bg-white in-data-[theme=dim]:text-black in-data-[theme=dim]:hover:bg-white/85"
      isDisabled={starting}
      onPress={() => void signIn()}
    >
      <AppleMark className="size-4 shrink-0" />
      {starting ? "Opening Apple…" : label}
    </Button>
  );
}
