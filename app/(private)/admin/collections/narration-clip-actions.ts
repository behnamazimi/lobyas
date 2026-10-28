"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminError } from "@/lib/admin/admin-error";
import { runAdminAction } from "@/lib/admin/action";
import { writeAudit } from "@/lib/admin/audit";
import {
  canNarrateCollection,
  listAllCollectionsForAdmin,
} from "@/lib/admin/collections/list-all-collections";
import { getOrCreateAudio } from "@/lib/ai/speech/audio";
import { PROVIDER_LABELS } from "@/lib/ai/speech/labels";
import { loadTermSubject } from "@/lib/ai/speech/subjects";
import { routeForCollection } from "@/lib/ai/speech/routes";
import { getRouteProvider } from "@/lib/ai/speech/switches";
import { isNarrationEnabled } from "@/lib/narration/feature";
import { enqueueNarrationSync, kickNarrationSyncWorker } from "@/lib/narration/sync";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

const REVALIDATE = ["/admin/collections/[id]"];
const WAIT_FOR_OTHER_MS = 30_000;

type Client = SupabaseClient<Database>;

async function requireNarratableCollection(
  supabase: Client,
  adminId: string,
  collectionId: string,
) {
  const collection = (await listAllCollectionsForAdmin(supabase, adminId)).find(
    (row) => row.id === collectionId,
  );
  if (!collection || !canNarrateCollection(collection)) {
    throw new AdminError("Collection not found.");
  }
  return collection;
}

/** Remakes every clip in the collection that isn't made by the provider used first. */
export async function startProviderResync(collectionId: string) {
  return runAdminAction(
    async ({ supabase, user }) => {
      const collection = await requireNarratableCollection(supabase, user.id, collectionId);
      const admin = createAdminClient();
      const primary = await getRouteProvider(admin, routeForCollection(collection.kind));
      const job = await enqueueNarrationSync(admin, collectionId, user.id, primary);
      kickNarrationSyncWorker();
      await writeAudit(supabase, {
        action: "app.narration_resync_start",
        targetType: "collection",
        targetId: collectionId,
        details: { job: job.id, provider: primary },
      });
      return job;
    },
    { revalidate: REVALIDATE },
  );
}

/** Remakes one clip with the provider used first; the others still back it up if it fails. */
export async function regenerateClip(collectionId: string, termId: string) {
  return runAdminAction(
    async ({ supabase, user }) => {
      await requireNarratableCollection(supabase, user.id, collectionId);
      const admin = createAdminClient();
      if (!(await isNarrationEnabled(admin))) throw new AdminError("Narration is turned off.");

      const { data: term, error } = await admin
        .from("terms")
        .select("id")
        .eq("id", termId)
        .eq("collection_id", collectionId)
        .maybeSingle();
      if (error) throw error;
      if (!term) throw new AdminError("Term not found.");

      const { data: active } = await admin
        .from("narration_sync_jobs")
        .select("id")
        .in("status", ["queued", "running"])
        .maybeSingle();
      if (active) throw new AdminError("A sync is running. Wait for it to finish.");

      const subject = await loadTermSubject(admin, termId);
      if (!subject) throw new AdminError("That term has no definition to narrate.");
      const result = await getOrCreateAudio(admin, subject, {
        regenerate: true,
        waitMs: WAIT_FOR_OTHER_MS,
      });
      if (result.status !== "ready") throw new AdminError("The clip couldn't be made. Try again.");

      const provider = result.job.provider;
      await writeAudit(supabase, {
        action: "app.narration_clip_regenerate",
        targetType: "term",
        targetId: termId,
        details: { provider },
      });
      return {
        provider: provider ? PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS] : null,
      };
    },
    { revalidate: REVALIDATE },
  );
}
