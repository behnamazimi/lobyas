import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ProviderSwitches, SpeechProvider } from "./provider";
import type { NarrationRoute } from "./routes";
import type { SpeechSubject } from "./types";

type Client = SupabaseClient<Database>;

/** The provider tried first for this kind of clip. */
export async function getRouteProvider(
  admin: Client,
  route: NarrationRoute,
): Promise<SpeechProvider> {
  const { data, error } = await admin
    .from("narration_routes")
    .select("provider")
    .eq("route", route)
    .single();
  if (error) throw error;
  return data.provider as SpeechProvider;
}

/** The providers the admin has switched off for this kind of clip, and which one is tried first. */
export async function getProviderSettings(
  admin: Client,
  subject: Pick<SpeechSubject, "type" | "route">,
): Promise<{ switches: ProviderSwitches; primary: SpeechProvider }> {
  const [features, primary] = await Promise.all([
    admin
      .from("ai_feature_settings")
      .select("murf_enabled, elevenlabs_enabled")
      .eq("feature", subject.type === "term" ? "narration_term" : "narration_story")
      .single(),
    getRouteProvider(admin, subject.route),
  ]);
  if (features.error) throw features.error;
  return {
    switches: { murf: features.data.murf_enabled, elevenlabs: features.data.elevenlabs_enabled },
    primary,
  };
}
