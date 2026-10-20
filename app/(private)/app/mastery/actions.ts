"use server";

import { requireAuthenticatedClient } from "@/lib/auth/require-session";
import { EMPTY_GOAL_DAY, loadGoalDay } from "@/lib/goals/settings";
import { fetchStatsSnapshot } from "@/lib/mastery/collection-stats";
import { loadMasteryCounts, loadMasteryTermRows } from "@/lib/mastery/mastery";

export async function getMasterySetupData() {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) {
    return { error: "Log in to view your mastery overview." as const };
  }

  const [{ collections, termsLearning, termsLearned }, stats, day] = await Promise.all([
    loadMasteryCounts(auth.supabase, auth.user.id),
    fetchStatsSnapshot(auth.supabase, auth.user.id),
    loadGoalDay(auth.supabase).catch(() => EMPTY_GOAL_DAY),
  ]);

  return { collections, termsLearning, termsLearned, stats, today: day.counts };
}

export async function getMasteryTermRowsAction() {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) {
    return { error: "Log in to view your mastery overview." as const };
  }

  try {
    const termRows = await loadMasteryTermRows(auth.supabase, auth.user.id);
    return { termRows };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't load terms.";
    return { error: message };
  }
}
