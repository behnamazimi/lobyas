import { MeMenu } from "@/components/me/me-menu";
import type { CreditsSummary } from "@/components/ai-credits/top-up-sheet";
import { storyCost } from "@/lib/ai-credits/costs";
import { getMyCreditSchedule, getMyCreditState } from "@/lib/ai-credits/repository";
import { getSessionUser } from "@/lib/auth/require-session";
import { aiCreditsMenuMode } from "@/lib/llm/central";
import { termsForLength } from "@/lib/stories/length";
import { DEFAULT_PIECE_LENGTH } from "@/lib/stories/types";

export default async function MePage() {
  return <MeMenu credits={await loadCredits()} />;
}

/** Null hides the credits strip: credits are off, or the lookup failed. */
async function loadCredits(): Promise<CreditsSummary | null> {
  if (aiCreditsMenuMode() !== "credits") return null;
  const { supabase } = await getSessionUser();
  try {
    const state = await getMyCreditState(supabase);
    if (!state?.enabled) return null;
    const schedule = await getMyCreditSchedule(supabase).catch(() => null);
    return {
      remaining: state.remaining,
      storyCredits: storyCost(termsForLength(DEFAULT_PIECE_LENGTH), state.costs),
      schedule,
      topUp: state.topUp,
    };
  } catch (err) {
    console.error("Couldn't load AI credits:", err);
    return null;
  }
}
