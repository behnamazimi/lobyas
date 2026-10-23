"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedClient } from "@/lib/auth/require-session";
import { parseCurrentCollectionId } from "@/lib/collections/current";
import { loadGoalCollection } from "@/lib/goals/current";
import { loadGoalForecast, type GoalForecast } from "@/lib/goals/forecast";
import { GOAL_TIERS, parseDailyGoals, type DailyGoals, type GoalTier } from "@/lib/goals/levels";
import {
  applyRemindersChange,
  MAX_REMINDERS,
  parseRemindersChange,
  type Reminder,
} from "@/lib/reminders/reminders";
import {
  claimGoalCelebration,
  getRequestGoalSettings,
  loadGoalDay,
  loadReminders,
  saveCollectionGoals,
  saveGoalCelebrate,
  saveReminders,
  type GoalDay,
} from "@/lib/goals/settings";

export async function getGoalsPageData() {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return { error: "Log in to set your daily goals." as const };

  const collection = await loadGoalCollection(auth.supabase, auth.user.id);
  if (!collection) return { collection: null };

  const [settings, day] = await Promise.all([
    getRequestGoalSettings(auth.user.id),
    loadGoalDay(auth.supabase, collection.id),
  ]);
  return { collection, settings, day };
}

export async function forecastGoalsAction(
  collectionId: string,
  goals: DailyGoals,
): Promise<{ forecast?: GoalForecast; error?: string }> {
  const parsed = parseDailyGoals(goals);
  if (!parsed || !parseCurrentCollectionId(collectionId)) {
    return { error: "Those goals don't look right." };
  }
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return { error: auth.error };

  try {
    return {
      forecast: await loadGoalForecast(auth.supabase, auth.user.id, collectionId, parsed),
    };
  } catch {
    return { error: "Couldn't work out a forecast. Try again." };
  }
}

export async function saveGoalsAction(input: {
  collectionId: string;
  goals: DailyGoals;
  applyToAll: boolean;
  tiers: GoalTier[];
}): Promise<{ error?: string; day?: GoalDay }> {
  const goals = parseDailyGoals(input.goals);
  const tiers = Array.isArray(input.tiers)
    ? input.tiers.filter((tier) => GOAL_TIERS.includes(tier))
    : [];
  if (!goals || !parseCurrentCollectionId(input.collectionId)) {
    return { error: "Those goals don't look right." };
  }
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return { error: auth.error };

  try {
    await saveCollectionGoals(auth.supabase, {
      collectionId: input.collectionId,
      goals,
      applyToAll: input.applyToAll === true,
      tiers,
    });
  } catch {
    return { error: "Couldn't save your goals. Try again." };
  }
  revalidatePath("/app/goals");
  // The goals are saved by now; without a fresh day the page keeps its own.
  const day = await loadGoalDay(auth.supabase, input.collectionId).catch(() => undefined);
  return { day };
}

export async function setGoalCelebrateAction(celebrate: boolean): Promise<{ error?: string }> {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return { error: auth.error };

  try {
    await saveGoalCelebrate(auth.supabase, auth.user.id, celebrate);
    return {};
  } catch {
    return { error: "Couldn't save that. Try again." };
  }
}

export async function claimGoalCelebrationAction(
  collectionId: string,
  tier: GoalTier,
  caughtUp: boolean,
): Promise<{ claimed: boolean; day?: GoalDay }> {
  if (!GOAL_TIERS.includes(tier) || !parseCurrentCollectionId(collectionId)) {
    return { claimed: false };
  }
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return { claimed: false };

  try {
    const claimed = await claimGoalCelebration(auth.supabase, collectionId, tier, caughtUp);
    return { claimed, day: await loadGoalDay(auth.supabase, collectionId) };
  } catch {
    return { claimed: false };
  }
}

/** One change to the stored reminders; the reply is the whole list as saved, so
 *  the card also picks up what other devices changed. */
export async function saveRemindersAction(
  input: unknown,
): Promise<{ error?: string; reminders?: Reminder[] }> {
  const change = parseRemindersChange(input);
  if (!change) return { error: "That reminder doesn't look right." };
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return { error: auth.error };

  try {
    const next = applyRemindersChange(await loadReminders(auth.supabase, auth.user.id), change);
    if (!next) return { error: `You can have up to ${MAX_REMINDERS} reminders.` };
    await saveReminders(auth.supabase, auth.user.id, next);
    revalidatePath("/app/goals");
    return { reminders: next };
  } catch {
    return { error: "Couldn't save your reminders. Try again." };
  }
}
