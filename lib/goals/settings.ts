import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { parseReminders, type Reminder } from "@/lib/reminders/reminders";
import { getRequestUserSettingsRow } from "@/lib/streak/settings";
import { GOAL_TIERS, type DailyGoals, type GoalTier } from "./levels";
import { EMPTY_GOAL_COUNTS, type GoalDayCounts } from "./progress";

type Client = SupabaseClient<Database>;

export type GoalSettings = {
  celebrate: boolean;
  reminders: Reminder[];
};

/** One collection's goals and today's progress on them. */
export type GoalDay = {
  /** The user's local date these counts are for, "YYYY-MM-DD". */
  date: string | null;
  /** Null when the collection has no goals. */
  goals: DailyGoals | null;
  counts: GoalDayCounts;
  celebrated: GoalTier[];
};

export const EMPTY_GOAL_DAY: GoalDay = {
  date: null,
  goals: null,
  counts: EMPTY_GOAL_COUNTS,
  celebrated: [],
};

/** For rendering: shares the request's one settings read. */
export async function getRequestGoalSettings(userId: string): Promise<GoalSettings> {
  const row = await getRequestUserSettingsRow(userId);
  return {
    celebrate: row?.goal_celebrate ?? true,
    reminders: parseReminders(row?.reminders),
  };
}

/** Saves one collection's goals. With `applyToAll`, `tiers` are also copied to
 *  every collection in the library and become what new collections start with. */
export async function saveCollectionGoals(
  client: Client,
  input: {
    collectionId: string;
    goals: DailyGoals;
    applyToAll: boolean;
    tiers: GoalTier[];
  },
): Promise<void> {
  const { error } = await client.rpc("my_save_collection_goals", {
    p_collection_id: input.collectionId,
    p_goals: input.goals,
    p_apply_all: input.applyToAll,
    p_tiers: input.tiers,
  });
  if (error) throw error;
}

export async function saveGoalCelebrate(
  client: Client,
  userId: string,
  celebrate: boolean,
): Promise<void> {
  const { error } = await client
    .from("user_settings")
    .upsert(
      { user_id: userId, goal_celebrate: celebrate, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

/** For saving: reads the stored list directly so a change builds on it. */
export async function loadReminders(client: Client, userId: string): Promise<Reminder[]> {
  const { data, error } = await client
    .from("user_settings")
    .select("reminders")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return parseReminders(data?.reminders);
}

export async function saveReminders(
  client: Client,
  userId: string,
  reminders: Reminder[],
): Promise<void> {
  const { error } = await client
    .from("user_settings")
    .upsert(
      { user_id: userId, reminders, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

/** One collection's day, or today's counts across every collection when none is given. */
export async function loadGoalDay(client: Client, collectionId?: string): Promise<GoalDay> {
  const { data, error } = await client.rpc("my_get_goal_day", { p_collection_id: collectionId });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return EMPTY_GOAL_DAY;
  const goals: DailyGoals = {
    read: row.read_goal,
    review: row.review_goal,
    quiz: row.quiz_goal,
  };
  return {
    date: row.today,
    goals: GOAL_TIERS.some((tier) => goals[tier] !== null) ? goals : null,
    counts: { read: row.read_count, review: row.reviewed_count, quiz: row.quizzed_count },
    celebrated: row.celebrated.filter((tier): tier is GoalTier =>
      (GOAL_TIERS as readonly string[]).includes(tier),
    ),
  };
}

/** True when this call is the one that gets to celebrate the tier today. */
export async function claimGoalCelebration(
  client: Client,
  collectionId: string,
  tier: GoalTier,
  caughtUp: boolean,
): Promise<boolean> {
  const { data, error } = await client.rpc("my_claim_goal_celebration", {
    p_collection_id: collectionId,
    p_tier: tier,
    p_caught_up: caughtUp,
  });
  if (error) throw error;
  return data === true;
}
