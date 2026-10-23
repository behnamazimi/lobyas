import { GOAL_TIERS, type GoalTier } from "@/lib/goals/levels";
import { EMPTY_GOAL_COUNTS } from "@/lib/goals/progress";
import type { State } from "./goal-store-types";

/** Terms this tab credited today, per collection and tier. `seen` makes a term
 *  count once here; `credited` holds the ones the server hadn't counted at its
 *  last answer. */
const seen = new Map<string, Set<string>>();
const credited = new Map<string, Set<string>>();

export function creditKey(collectionId: string, tier: GoalTier) {
  return `${collectionId}:${tier}`;
}

function bucket(map: Map<string, Set<string>>, key: string) {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  return set;
}

export function creditedCount(collectionId: string, tier: GoalTier) {
  return bucket(credited, creditKey(collectionId, tier)).size;
}

export function creditedIds(collectionId: string) {
  return GOAL_TIERS.map(
    (tier) => [tier, [...bucket(credited, creditKey(collectionId, tier))]] as const,
  );
}

/** Credits a term unless this tab already did; true when it was new. */
export function creditTerm(collectionId: string, tier: GoalTier, termId: string) {
  const key = creditKey(collectionId, tier);
  if (bucket(seen, key).has(termId)) return false;
  bucket(seen, key).add(termId);
  bucket(credited, key).add(termId);
  return true;
}

export function dropCredits(collectionId: string, tier: GoalTier, termIds: readonly string[]) {
  const set = bucket(credited, creditKey(collectionId, tier));
  for (const id of termIds) set.delete(id);
}

const retryTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function cancelRetry(collectionId: string, tier: GoalTier) {
  clearTimeout(retryTimers.get(creditKey(collectionId, tier)));
}

export function scheduleRetry(collectionId: string, tier: GoalTier, run: () => void, ms: number) {
  cancelRetry(collectionId, tier);
  retryTimers.set(creditKey(collectionId, tier), setTimeout(run, ms));
}

/** Forgets one collection's credits and pending retries, or everyone's. */
export function clearCredits(collectionId?: string) {
  const mine = (key: string) => !collectionId || key.startsWith(`${collectionId}:`);
  for (const map of [seen, credited]) {
    for (const key of map.keys()) if (mine(key)) map.delete(key);
  }
  for (const [key, timer] of retryTimers) {
    if (!mine(key)) continue;
    clearTimeout(timer);
    retryTimers.delete(key);
  }
}

/** Starts a new day from zero for every collection still on an earlier one.
 *  Returns the same object when nothing rolled over. */
export function rollOverCollections(collections: State["collections"], today: string) {
  let next = collections;
  for (const [id, entry] of Object.entries(collections)) {
    // No day was loaded (nothing can celebrate), so there is nothing to roll over.
    if (entry.day.date === null || entry.day.date === today) continue;
    clearCredits(id);
    const day = { date: today, goals: entry.day.goals, counts: EMPTY_GOAL_COUNTS, celebrated: [] };
    next = { ...next, [id]: { ...entry, day } };
  }
  return next;
}
