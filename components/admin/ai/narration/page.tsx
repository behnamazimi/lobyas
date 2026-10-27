"use client";

import Link from "next/link";
import {
  setNarrationEnabled,
  setNarrationProvider,
} from "@/app/(private)/admin/ai/narration/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminSettingRow } from "@/components/admin/admin-setting-row";
import { AdminSwitch } from "@/components/admin/admin-switch";
import { AllowlistManager } from "@/components/admin/ai/narration/allowlist-manager";
import { AdminNarrationCaps } from "@/components/admin/ai/narration/caps";
import { RouteSelect } from "@/components/admin/ai/narration/route-select";
import { PROVIDER_LABELS } from "@/lib/ai/speech/labels";
import { NARRATION_ROUTES, ROUTE_LABELS } from "@/lib/ai/speech/routes";
import type { SpeechProvider } from "@/lib/ai/speech/provider";
import type { NarrationSettings } from "@/lib/admin/narration/narration-settings";
import type { AdminNarrationAllowlistRow } from "@/lib/admin/narration/list-narration-allowlist";
import {
  isActiveNarrationSyncStatus,
  type NarrationSyncJobView,
} from "@/lib/narration/sync-shared";

type AdminNarrationPageClientProps = {
  healthNote: string | null;
  cronNote: { text: string; warning: boolean } | null;
  caps: NarrationSettings["caps"];
  usageLast24h: NarrationSettings["usageLast24h"];
  enabled: boolean;
  providers: NarrationSettings["providers"];
  routes: NarrationSettings["routes"];
  providerKeys: Record<SpeechProvider, boolean>;
  allowlist: AdminNarrationAllowlistRow[];
  lastJob: NarrationSyncJobView | null;
};

export function AdminNarrationPageClient({
  healthNote,
  cronNote,
  caps,
  usageLast24h,
  enabled,
  providers,
  routes,
  providerKeys,
  allowlist,
  lastJob,
}: AdminNarrationPageClientProps) {
  return (
    <>
      <AdminPageHeader
        title="Narration"
        description="Control narration for terms and stories, which providers make it, and who can use it. Narration is never charged in AI credits."
      />

      <AdminSettingRow
        title="Narration enabled"
        description="When off, no one can play narration regardless of the allowlist below."
        notes={
          <>
            {healthNote ? <p className="m-0 mt-1 text-sm text-warning">{healthNote}</p> : null}
            {cronNote ? (
              <p
                className={`m-0 mt-1 text-sm ${cronNote.warning ? "text-warning" : "text-base-content/65"}`}
              >
                {cronNote.text}
              </p>
            ) : null}
          </>
        }
        control={
          <AdminSwitch label="Enable narration" value={enabled} save={setNarrationEnabled} />
        }
      />

      {NARRATION_ROUTES.map((route) => (
        <AdminSettingRow
          key={route}
          title={`Voice for ${ROUTE_LABELS[route].toLowerCase()}`}
          description="Makes every new clip of this kind. The other providers stay as fallbacks if it fails."
          notes={
            providerKeys[routes[route]] ? null : (
              <p className="m-0 mt-1 text-sm text-warning">
                {PROVIDER_LABELS[routes[route]]} has no API key, so it is skipped.
              </p>
            )
          }
          control={<RouteSelect route={route} provider={routes[route]} />}
        />
      ))}

      <AdminSettingRow
        title="Murf"
        description="Falcon 2 voices. Not available for Russian or Turkish."
        notes={
          providerKeys.murf ? null : (
            <p className="m-0 mt-1 text-sm text-warning">Missing MURF_API_KEY, so it is skipped.</p>
          )
        }
        control={
          <AdminSwitch
            label="Enable Murf"
            value={providers.murf}
            save={(next) => setNarrationProvider("murf", next)}
          />
        }
      />
      <AdminSettingRow
        title="ElevenLabs"
        description="One voice for every language."
        notes={
          providerKeys.elevenlabs ? null : (
            <p className="m-0 mt-1 text-sm text-warning">
              Missing ELEVENLABS_API_KEY, so it is skipped.
            </p>
          )
        }
        control={
          <AdminSwitch
            label="Enable ElevenLabs"
            value={providers.elevenlabs}
            save={(next) => setNarrationProvider("elevenlabs", next)}
          />
        }
      />

      <AdminNarrationCaps caps={caps} usageLast24h={usageLast24h} />
      <AllowlistManager allowlist={allowlist} />
      <AdminSection
        id="narration-sync"
        title="Audio sync"
        description="Each collection has its own narration mode and audio sync. Only one sync runs at a time."
      >
        {lastJob && isActiveNarrationSyncStatus(lastJob.status) ? (
          <p className="m-0 text-sm text-base-content/80">
            Running now:{" "}
            <Link href={`/admin/collections/${lastJob.collectionId}#narration`} className="link">
              {lastJob.collectionName}
            </Link>{" "}
            ({Math.min(lastJob.cursor, lastJob.total)}/{lastJob.total})
          </p>
        ) : (
          <p className="m-0 text-sm text-base-content/65">
            No sync is running. Open a{" "}
            <Link href="/admin/collections" className="link">
              collection
            </Link>{" "}
            to set its mode and make its audio.
          </p>
        )}
      </AdminSection>
    </>
  );
}
