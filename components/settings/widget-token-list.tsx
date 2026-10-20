import { Trash2 } from "lucide-react";
import { TokenRow } from "@/components/settings/ui";
import { Pill } from "@/components/kit";
import { cn, formatDateTime } from "@/lib/utils";
import type { WidgetTokenRow } from "@/lib/widget/types";

function VersionBadge({
  widgetVersion,
  latestWidgetVersion,
}: {
  widgetVersion: string | null;
  latestWidgetVersion: string;
}) {
  if (!widgetVersion) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-extrabold">
        <span className="size-1.5 shrink-0 rounded-full bg-base-content/30" aria-hidden />
        Not reporting a version yet
      </span>
    );
  }

  const isUpToDate = widgetVersion === latestWidgetVersion;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-base-200 px-2.5 py-0.5 text-xs font-extrabold">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", isUpToDate ? "bg-mastered" : "bg-warning")}
        aria-hidden
      />
      {isUpToDate
        ? `Up to date (v${widgetVersion})`
        : `Update available (v${widgetVersion} → v${latestWidgetVersion})`}
    </span>
  );
}

type WidgetTokenListProps = {
  tokens: WidgetTokenRow[];
  latestWidgetVersion: string;
  isRevoking: boolean;
  busyId: string | null;
  onRevoke: (tokenId: string) => void;
};

export function WidgetTokenList({
  tokens,
  latestWidgetVersion,
  isRevoking,
  busyId,
  onRevoke,
}: WidgetTokenListProps) {
  return (
    <div className="space-y-2 border-t border-base-300 pt-4">
      <h3 className="m-0 font-sans text-[15px] font-extrabold">Active tokens</h3>
      <ul className="m-0 divide-y divide-base-300 p-0">
        {tokens.map((token) => (
          <TokenRow
            key={token.id}
            label={token.label}
            meta={`Created ${formatDateTime(token.created_at, "Never")} · Last used ${formatDateTime(token.last_used_at, "Never")}`}
            badge={
              <VersionBadge
                widgetVersion={token.widget_version}
                latestWidgetVersion={latestWidgetVersion}
              />
            }
            action={
              <Pill
                variant="danger"
                onClick={() => onRevoke(token.id)}
                disabled={isRevoking && busyId === token.id}
              >
                <Trash2 className="size-3.5" strokeWidth={2.3} aria-hidden />
                Revoke
              </Pill>
            }
          />
        ))}
      </ul>
    </div>
  );
}
