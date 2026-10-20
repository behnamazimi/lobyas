import { getSessionUser } from "@/lib/auth/require-session";
import { EMPTY_GOAL_DAY, getRequestGoalSettings, loadGoalDay } from "@/lib/goals/settings";
import { getStudyPhoneUserSettings } from "@/lib/streak/settings";
import { withTodayDone } from "@/lib/streak/status";
import { studyTimezone } from "@/lib/trace/local-day";
import { GoalTracker } from "./goal-tracker";

export async function GoalsIsland() {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;

  try {
    const [settings, phone] = await Promise.all([
      getRequestGoalSettings(user.id),
      getStudyPhoneUserSettings(user.id),
    ]);
    const day = settings.goals && settings.celebrate ? await loadGoalDay(supabase) : EMPTY_GOAL_DAY;
    return (
      <GoalTracker
        key={user.id}
        goals={settings.goals}
        celebrate={settings.celebrate}
        timeZone={studyTimezone(phone.timezone)}
        day={day}
        // A goal is only met once something counted today.
        streak={withTodayDone(phone.streak).current}
      />
    );
  } catch {
    // Goals are optional; a failed read just means no celebrations this load.
    return null;
  }
}
