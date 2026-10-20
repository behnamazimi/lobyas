"use client";

import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Pill } from "@/components/kit";
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

export function CopyField({
  label,
  value,
  hint,
  monospace = true,
}: {
  label?: string;
  value: string;
  hint?: string;
  monospace?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      {label || hint ? (
        <div className="space-y-1">
          {label ? <p className="m-0 text-sm font-extrabold">{label}</p> : null}
          {hint ? <p className="m-0 text-xs font-semibold text-muted">{hint}</p> : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        <pre
          className={cn(
            "m-0 min-w-0 flex-1 overflow-x-auto rounded-2xl bg-base-200 px-3 py-3 text-xs leading-5 break-all whitespace-pre-wrap text-base-content",
            monospace && "font-mono",
          )}
        >
          {value}
        </pre>
        <Pill variant="soft" onClick={handleCopy} className="shrink-0">
          <CopyIconSwap copied={copied} />
          {copied ? "Copied" : "Copy"}
        </Pill>
      </div>
    </div>
  );
}

export function AlertBanner({ message }: { message: string }) {
  return <ErrorAlert error={message} />;
}

export function HighlightPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl bg-base-200 px-3 py-3">
      <p className="m-0 text-sm font-extrabold">{label}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function TokenRow({
  label,
  meta,
  badge,
  action,
}: {
  label: string;
  meta: string;
  badge?: ReactNode;
  action: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="m-0 text-sm font-extrabold">{label}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          <span>{meta}</span>
          {badge}
        </p>
      </div>
      <div className="w-full shrink-0 md:w-auto">{action}</div>
    </li>
  );
}
