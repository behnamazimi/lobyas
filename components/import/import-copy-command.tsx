import { useState, type ReactNode } from "react";
import { Pill } from "@/components/kit";
import { CopyIconSwap } from "@/components/settings/ui";

export function CopyCommand({
  label,
  hint,
  value,
  prefix,
  children,
}: {
  label: string;
  hint?: string;
  value: string;
  prefix?: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <p className="m-0 text-sm font-extrabold">{label}</p>
        {hint ? <p className="m-0 text-[13px] font-semibold text-muted">{hint}</p> : null}
      </div>

      {children}

      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        <pre className="m-0 min-w-0 flex-1 overflow-x-auto rounded-2xl bg-base-200 px-3 py-3 font-mono text-xs leading-5 whitespace-pre-wrap text-base-content">
          {prefix ? (
            <span className="select-none text-base-content/40" aria-hidden>
              {prefix}{" "}
            </span>
          ) : null}
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
