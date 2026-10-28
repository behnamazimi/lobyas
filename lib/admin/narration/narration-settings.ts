import type { SupabaseClient } from "@supabase/supabase-js";
import type { SpeechProvider } from "@/lib/ai/speech/provider";
import { NARRATION_ROUTES, type NarrationRoute } from "@/lib/ai/speech/routes";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

const NARRATION_FEATURES = ["narration_term", "narration_story"] as const;

export type NarrationSettings = {
  enabled: boolean;
  /** Provider switches; on only when both narration features agree. */
  providers: { murf: boolean; elevenlabs: boolean };
  /** The provider tried first for each kind of clip; the others are fallbacks. */
  routes: Record<NarrationRoute, SpeechProvider>;
  /** Per-person daily caps; null means no cap. */
  caps: { term: number | null; story: number | null };
  /** Provider calls made in the last 24 hours, failed ones included. Null when the count couldn't be read. */
  usageLast24h: { term: number | null; story: number | null };
};

/** Only a number on the page, so a read that fails shows as unknown rather than
 *  taking the whole page down. */
async function usageCount(client: Client, feature: string, since: string): Promise<number | null> {
  const { count, error } = await client
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .eq("feature", feature)
    .gte("created_at", since);
  if (error) {
    console.error("Couldn't count narration usage:", error);
    return null;
  }
  return count ?? 0;
}

/** What the admin narration page shows. One switch drives both narration
 *  features and shows as on only when both are, so a difference made outside
 *  the page doesn't read as "on". */
export async function getNarrationSettingsForAdmin(client: Client): Promise<NarrationSettings> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [settings, routeRows, term, story] = await Promise.all([
    client
      .from("ai_feature_settings")
      .select("feature, enabled, daily_cap, murf_enabled, elevenlabs_enabled")
      .in("feature", [...NARRATION_FEATURES]),
    client.from("narration_routes").select("route, provider"),
    usageCount(client, "narration_term", since),
    usageCount(client, "narration_story", since),
  ]);
  if (settings.error) throw settings.error;
  if (routeRows.error) throw routeRows.error;

  const rows = settings.data;
  const capOf = (feature: string) => rows.find((row) => row.feature === feature)?.daily_cap ?? null;
  const routes = Object.fromEntries(
    NARRATION_ROUTES.map((route) => [
      route,
      routeRows.data.find((row) => row.route === route)?.provider,
    ]),
  ) as Record<NarrationRoute, SpeechProvider>;

  return {
    enabled: rows.length === 2 && rows.every((row) => row.enabled),
    providers: {
      murf: rows.length === 2 && rows.every((row) => row.murf_enabled),
      elevenlabs: rows.length === 2 && rows.every((row) => row.elevenlabs_enabled),
    },
    routes,
    caps: { term: capOf("narration_term"), story: capOf("narration_story") },
    usageLast24h: { term, story },
  };
}
