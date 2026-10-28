"use client";

import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyIconSwap({ copied }: { copied: boolean }) {
  return (
    <span className="relative inline-flex size-3.5 shrink-0" aria-hidden>
      <Copy
        className={cn(
          "absolute inset-0 size-3.5 transition-[opacity,transform,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
          copied ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
        )}
      />
      <Check
        className={cn(
          "absolute inset-0 size-3.5 text-success-text transition-[opacity,transform,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
          copied ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
        )}
      />
    </span>
  );
}
