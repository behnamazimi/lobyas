"use client";

import { AlertBanner, CopyField, SettingsPanel } from "@/components/settings/ui";
import { WidgetInstallSteps } from "@/components/settings/widget-install-steps";
import { WidgetTokenList } from "@/components/settings/widget-token-list";
import { useWidgetPanel } from "@/components/settings/use-widget-panel";
import { Pill, SegmentedControl } from "@/components/kit";
import { cn } from "@/lib/utils";
import type { WidgetTokenRow } from "@/lib/widget/types";

type WidgetPanelProps = {
  initialTokens: WidgetTokenRow[];
  latestWidgetVersion: string;
};

export function WidgetPanel({ initialTokens, latestWidgetVersion }: WidgetPanelProps) {
  const {
    tokens,
    newToken,
    error,
    busyId,
    isGenerating,
    isRevoking,
    mode,
    setMode,
    installWithTokenCommand,
    updateCommand,
    handleGenerate,
    handleRevoke,
  } = useWidgetPanel(initialTokens);

  const hasTokens = tokens.length > 0;

  return (
    <SettingsPanel
      id="widget"
      title="Desktop widget"
      collapsibleOnPhone
      description="Show live terms on your Mac with the Übersicht widget."
      status={
        <span className="inline-flex items-center gap-2 rounded-full bg-base-200 px-2.5 py-1 text-xs font-extrabold">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              hasTokens ? "bg-mastered" : "bg-base-content/30",
            )}
            aria-hidden
          />
          {hasTokens
            ? `${tokens.length} active ${tokens.length === 1 ? "token" : "tokens"}`
            : "Not set up"}
        </span>
      }
    >
      {error ? <AlertBanner message={error} /> : null}

      <SegmentedControl
        label="Widget setup mode"
        value={mode}
        onChange={(next) => {
          if (next === "install" || next === "update") setMode(next);
        }}
        options={[
          { value: "install", label: "New install" },
          { value: "update", label: "Update" },
        ]}
      />

      {mode === "install" ? (
        <WidgetInstallSteps
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          newToken={newToken}
          installWithTokenCommand={installWithTokenCommand}
        />
      ) : hasTokens ? (
        <div className="space-y-3 rounded-2xl bg-base-200 p-4">
          <p className="m-0 text-sm font-semibold text-muted">
            Already have the widget running? This refreshes it to the latest version in place. It
            keeps your existing token, so there's nothing to generate.
          </p>
          <CopyField label="Update" value={updateCommand} />
          <p className="m-0 text-sm font-semibold text-muted">
            Refresh Übersicht (or restart it) once it finishes.
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl bg-base-200 p-4">
          <p className="m-0 text-sm font-semibold text-muted">
            You don&apos;t have a token yet, so there&apos;s nothing installed to update.
          </p>
          <Pill variant="soft" onClick={() => setMode("install")}>
            Go to New install
          </Pill>
        </div>
      )}

      {hasTokens ? (
        <WidgetTokenList
          tokens={tokens}
          latestWidgetVersion={latestWidgetVersion}
          isRevoking={isRevoking}
          busyId={busyId}
          onRevoke={handleRevoke}
        />
      ) : null}
    </SettingsPanel>
  );
}
