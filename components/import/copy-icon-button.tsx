"use client";

import { useState } from "react";
import { CopyIconSwap } from "@/components/settings/ui";
import { IconButton } from "@/components/kit";

export function CopyIconButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <IconButton
      tone="soft"
      label={copied ? "Copied" : label}
      onClick={handleCopy}
      className="bg-base-100/90"
    >
      <CopyIconSwap copied={copied} />
    </IconButton>
  );
}
