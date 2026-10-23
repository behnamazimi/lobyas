import type { GoalTier } from "@/lib/goals/levels";
import type { GoalProgress } from "@/lib/goals/progress";
import type { GoalDay } from "@/lib/goals/settings";

type GoalCelebration = {
  collectionId: string;
  collectionName: string;
  tier: GoalTier;
  progress: GoalProgress;
};

export type CollectionEntry = { name: string; day: GoalDay };

export type State = {
  celebrate: boolean;
  timeZone: string;
  collections: Record<string, CollectionEntry>;
  /** Waiting celebrations; the first one is on screen. */
  celebrations: GoalCelebration[];
};

export type Seed = {
  celebrate: boolean;
  timeZone: string;
  collection: { id: string; name: string; day: GoalDay } | null;
};

/** What the pill shows for a tier, or null until the collection's counts are known. */
export type GoalCount = { goal: number | null; count: number };
