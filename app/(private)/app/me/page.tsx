import { MeMenu } from "@/components/me/me-menu";
import { toAiCreditsLoad } from "@/lib/ai-credits/menu-line";
import { getMyCreditState } from "@/lib/ai-credits/repository";
import { getSessionUser } from "@/lib/auth/require-session";
import { aiCreditsMenuMode } from "@/lib/llm/central";

export default async function MePage() {
  const mode = aiCreditsMenuMode();
  const creditsLoad = await loadCredits(mode);
  return <MeMenu aiCreditsMode={mode} creditsLoad={creditsLoad} />;
}

async function loadCredits(mode: ReturnType<typeof aiCreditsMenuMode>) {
  if (mode !== "credits") return toAiCreditsLoad(null);
  const { supabase } = await getSessionUser();
  try {
    const state = await getMyCreditState(supabase);
    return toAiCreditsLoad(
      state?.enabled ? { remaining: state.remaining, topUp: state.topUp } : null,
    );
  } catch (err) {
    console.error("Couldn't load AI credits:", err);
    return toAiCreditsLoad(null);
  }
}
