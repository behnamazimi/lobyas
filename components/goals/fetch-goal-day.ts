import type { GoalDay } from "@/lib/goals/settings";

/** A collection's goals and today's progress, or null when they can't be loaded. */
export async function fetchGoalDay(
  collectionId: string,
): Promise<{ day: GoalDay; name: string } | null> {
  try {
    const response = await fetch(`/api/goals/day?collection=${collectionId}`);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
