"use client";

import { RotateCw } from "lucide-react";
import { Pill } from "@/components/kit";

export function OfflineRetryButton() {
  return (
    <Pill variant="brand" onClick={() => window.location.reload()}>
      <RotateCw className="size-4" aria-hidden />
      Try again
    </Pill>
  );
}
