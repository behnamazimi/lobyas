import { getSessionUser } from "@/lib/auth/require-session";
import { loadGoalCollection } from "@/lib/goals/current";
import { getRequestGoalSettings, loadGoalDay } from "@/lib/goals/settings";
import { getStudyPhoneUserSettings } from "@/lib/streak/settings";
import { withTodayDone } from "@/lib/streak/status";
import { studyTimezone } from "@/lib/trace/local-day";
import { GoalTracker } from "./goal-tracker";

export async function GoalsIsland() {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;

  try {
    const [settings, phone, picked] = await Promise.all([
      getRequestGoalSettings(user.id),
      getStudyPhoneUserSettings(user.id),
      loadGoalCollection(supabase, user.id),
    ]);
    const collection = picked ? { ...picked, day: await loadGoalDay(supabase, picked.id) } : null;
    return (
      <GoalTracker
        key={user.id}
        collection={collection}
        celebrate={settings.celebrate}
        timeZone={studyTimezone(phone.timezone)}
        // A goal is only met once something counted today.
        streak={withTodayDone(phone.streak).current}
      />
    );
  } catch {
    // Goals are optional; a failed read just means no celebrations this load.
    return null;
  }
}
