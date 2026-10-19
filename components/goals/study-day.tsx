import { getSessionUser } from "@/lib/auth/require-session";
import { loadGoalDay } from "@/lib/goals/settings";
import { StudyDaySeed } from "./study-day-seed";

/** Gives a study screen's goal pill today's counts. Put it in a Suspense
 *  boundary so the page doesn't wait for it; a failed read just means no pill. */
export async function StudyDay() {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;
  const day = await loadGoalDay(supabase).catch(() => null);
  return day ? <StudyDaySeed day={day} /> : null;
}
