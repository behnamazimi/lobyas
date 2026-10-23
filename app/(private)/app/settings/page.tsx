import { Suspense } from "react";
import { getAccountSettingsData, getLlmSettingsData } from "@/app/(private)/app/settings/actions";
import { requireAuthenticatedClient } from "@/lib/auth/require-session";
import { AccountPanel } from "@/components/settings/account-panel";
import { LlmPanel } from "@/components/settings/llm-panel";
import { ScrollToSettingsPanel, type SettingsTabId } from "@/components/settings/ui";
import { PanelSkeleton } from "@/components/page-skeleton";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function parseTab(value: string | undefined): SettingsTabId | null {
  if (value === "ai" || value === "account") {
    return value;
  }
  // The AI panel used to be the "quiz" tab; keep old links working.
  if (value === "quiz") return "ai";
  return null;
}

async function LlmPanelServer() {
  const setup = await getLlmSettingsData();
  if ("error" in setup) {
    return <p className="text-sm font-semibold text-muted">{setup.error}</p>;
  }
  return <LlmPanel ai={setup.ai} schedule={setup.schedule} />;
}

async function AccountPanelServer() {
  const setup = await getAccountSettingsData();
  if ("error" in setup) {
    return <p className="text-sm font-semibold text-muted">{setup.error}</p>;
  }
  return <AccountPanel {...setup.account} />;
}

export default async function SettingsRoute({ searchParams }: PageProps) {
  const [{ tab: tabParam }, auth] = await Promise.all([searchParams, requireAuthenticatedClient()]);

  if ("error" in auth) {
    return <p className="text-sm font-semibold text-muted">{auth.error}</p>;
  }

  const tab = parseTab(tabParam);

  return (
    <div className="flex flex-col gap-3">
      {tab ? <ScrollToSettingsPanel tab={tab} /> : null}
      <Suspense fallback={<PanelSkeleton />}>
        <LlmPanelServer />
      </Suspense>
      <Suspense fallback={<PanelSkeleton />}>
        <AccountPanelServer />
      </Suspense>
    </div>
  );
}
