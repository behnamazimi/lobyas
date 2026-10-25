"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pill } from "@/components/kit";

/** A link to the current page would be answered from the router's cache of
 *  the failed render; a refresh always asks the server again. */
export function HomeRetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Pill disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      {pending ? "Trying…" : "Try again"}
    </Pill>
  );
}
