"use client";

import { claimGoalCelebrationAction } from "@/app/(private)/app/goals/actions";
import { feedback } from "@/lib/feedback";
import { GOAL_TIERS, type GoalTier } from "@/lib/goals/levels";
import { goalProgress } from "@/lib/goals/progress";
import type { GoalDay } from "@/lib/goals/settings";
import { localDateKey } from "@/lib/trace/local-day";
import { fetchGoalDay } from "./fetch-goal-day";
import {
  cancelRetry,
  clearCredits,
  creditedCount,
  creditedIds,
  creditKey,
  creditTerm,
  dropCredits,
  rollOverCollections,
  queueCaughtUp,
  scheduleRetry,
  takeCaughtUp,
} from "./goal-credits";
import type { CollectionEntry, GoalCount, Seed, State } from "./goal-store-types";

/** Live daily-goal tracking for the open tab, one entry per collection. Study
 *  screens report credited terms; once a tier looks met the server confirms it
 *  (one celebration per collection and tier a day). A no-op until GoalsIsland
 *  seeds it. */

const RETRY_MS = 1500;
const MAX_RETRIES = 3;

let state: State | null = null;
const listeners = new Set<() => void>();
const claiming = new Set<string>();
/** Tiers whose celebration waits, e.g. quiz while a quiz is still running. */
const held = new Set<GoalTier>();
/** Held celebrations the server already confirmed, shown once released. */
let deferred: { collectionId: string; tier: GoalTier }[] = [];
const loading = new Set<string>();

function emit() {
  for (const listener of listeners) listener();
}

function update(next: Partial<State>) {
  if (!state) return;
  state = { ...state, ...next };
  emit();
}

function setEntry(collectionId: string, entry: CollectionEntry) {
  if (!state) return;
  update({ collections: { ...state.collections, [collectionId]: entry } });
}

export function goalCountFor(collectionId: string, tier: GoalTier): GoalCount | null {
  const entry = state?.collections[collectionId];
  if (!entry?.day.date) return null;
  return {
    goal: entry.day.goals?.[tier] ?? null,
    count: entry.day.counts[tier] + creditedCount(collectionId, tier),
  };
}

export function subscribeGoals(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGoalsSnapshot(): State | null {
  return state;
}

export function seedGoals(seed: Seed) {
  if (state) return;
  const { collection } = seed;
  const collections = collection
    ? { [collection.id]: { name: collection.name, day: collection.day } }
    : {};
  state = { celebrate: seed.celebrate, timeZone: seed.timeZone, collections, celebrations: [] };
  emit();
}

/** Forgets everything, so the next account to sign in on this tab starts clean. */
export function resetGoals() {
  state = null;
  clearCredits();
  claiming.clear();
  held.clear();
  deferred = [];
  loading.clear();
  emit();
}

/** The Goals page calls this so a change applies without a reload. Its
 *  day is fresh from the server, so this tab's own credits start over. */
export function setLiveGoals(next: { collectionId: string; name: string; day: GoalDay }) {
  clearCredits(next.collectionId);
  setEntry(next.collectionId, { name: next.name, day: next.day });
}

/** After a change that reaches other collections, theirs load again on next use. */
export function forgetOtherGoalCollections(keepId: string) {
  if (!state) return;
  const { [keepId]: kept, ...others } = state.collections;
  for (const id of Object.keys(others)) clearCredits(id);
  update({ collections: kept ? { [keepId]: kept } : {} });
}

/** The celebrate switch. Leaves today's counts alone. */
export function setLiveCelebrate(celebrate: boolean) {
  update({ celebrate });
}

export function closeGoalCelebration() {
  update({ celebrations: state?.celebrations.slice(1) ?? [] });
}

/** Today's goal for the tier is met and no celebration for it is open or on its way. */
export function goalMetSettled(collectionId: string, tier: GoalTier): boolean {
  const today = goalCountFor(collectionId, tier);
  const entry = state?.collections[collectionId];
  if (!state || !entry || !today || today.goal === null || today.count < today.goal) return false;
  const coming = state.celebrate && !entry.day.celebrated.includes(tier);
  const showing = state.celebrations.some(
    (c) => c.collectionId === collectionId && c.tier === tier,
  );
  const waiting = deferred.some((d) => d.collectionId === collectionId && d.tier === tier);
  return !coming && !claiming.has(creditKey(collectionId, tier)) && !waiting && !showing;
}

/** Holds a tier's celebration until released, so it doesn't interrupt the
 *  session that earned it. */
export function holdGoalCelebration(tier: GoalTier) {
  held.add(tier);
  return () => {
    held.delete(tier);
    const released = deferred.filter((d) => d.tier === tier);
    deferred = deferred.filter((d) => d.tier !== tier);
    for (const d of released) openCelebration(d.collectionId, d.tier);
  };
}

function openCelebration(collectionId: string, tier: GoalTier) {
  const entry = state?.collections[collectionId];
  if (!state || !entry?.day.goals) return;
  const progress = goalProgress(entry.day.goals, entry.day.counts, entry.day.celebrated);
  feedback("goal-met");
  update({
    celebrations: [
      ...state.celebrations,
      { collectionId, collectionName: entry.name, tier, progress },
    ],
  });
}

/** Loads a collection's goals when a study screen reports a term from one the
 *  page didn't seed, e.g. after a switch. Credits wait in the meantime. */
export function ensureGoalCollection(collectionId: string) {
  if (!state || state.collections[collectionId] || loading.has(collectionId)) return;
  loading.add(collectionId);
  void fetchGoalDay(collectionId)
    .then((body) => {
      if (!body || !state || state.collections[collectionId]) return;
      setEntry(collectionId, { name: body.name, day: body.day });
      for (const tier of GOAL_TIERS) {
        if (takeCaughtUp(collectionId, tier)) goalCaughtUp(collectionId, tier);
        else if (looksMet(collectionId, tier)) void claim(collectionId, tier, false, MAX_RETRIES);
      }
    })
    .finally(() => loading.delete(collectionId));
}

export function tickGoal(
  collectionId: string,
  tier: GoalTier,
  termIds: string | readonly string[],
) {
  if (!state) return;
  rollOverIfNewDay();
  ensureGoalCollection(collectionId);
  let added = false;
  for (const id of typeof termIds === "string" ? [termIds] : termIds) {
    if (creditTerm(collectionId, tier, id)) added = true;
  }
  if (added) emit();
  if (looksMet(collectionId, tier)) void claim(collectionId, tier, false, MAX_RETRIES);
}

/** The tier has nothing left to serve today, which counts as its goal met
 *  once something was studied there today. */
export function goalCaughtUp(collectionId: string, tier: GoalTier) {
  if (!state) return;
  rollOverIfNewDay();
  if (!state.collections[collectionId]) {
    queueCaughtUp(collectionId, tier);
    return ensureGoalCollection(collectionId);
  }
  if (isOpen(collectionId, tier) && localTotal(collectionId, tier) > 0) {
    void claim(collectionId, tier, true, 0);
  }
}

function isOpen(collectionId: string, tier: GoalTier): boolean {
  const entry = state?.collections[collectionId];
  const goals = entry?.day.goals;
  if (!state?.celebrate || !entry || !goals) return false;
  return (
    goals[tier] !== null &&
    !entry.day.celebrated.includes(tier) &&
    !claiming.has(creditKey(collectionId, tier))
  );
}

function localTotal(collectionId: string, tier: GoalTier): number {
  const counts = state?.collections[collectionId]?.day.counts;
  return (counts?.[tier] ?? 0) + creditedCount(collectionId, tier);
}

function looksMet(collectionId: string, tier: GoalTier): boolean {
  const goal = state?.collections[collectionId]?.day.goals?.[tier];
  if (goal == null || !isOpen(collectionId, tier)) return false;
  return localTotal(collectionId, tier) >= goal;
}

function rollOverIfNewDay() {
  if (!state) return;
  const collections = rollOverCollections(
    state.collections,
    localDateKey(new Date(), state.timeZone),
  );
  if (collections !== state.collections) state = { ...state, collections };
}

async function claim(collectionId: string, tier: GoalTier, caughtUp: boolean, retriesLeft: number) {
  const key = creditKey(collectionId, tier);
  claiming.add(key);
  cancelRetry(collectionId, tier);
  const sent = creditedIds(collectionId);
  const result = await claimGoalCelebrationAction(collectionId, tier, caughtUp).catch(() => ({
    claimed: false,
    day: undefined,
  }));
  claiming.delete(key);
  const entry = state?.collections[collectionId];
  if (!state || !entry) return;

  if (result.day) {
    // The server's count is the truth from here on. Credits sent with this
    // claim are dropped (they're counted, or were already counted before
    // this tab saw them); only terms credited while it was in flight stay.
    for (const [t, ids] of sent) dropCredits(collectionId, t, ids);
    setEntry(collectionId, { ...entry, day: result.day });
  }

  if (result.claimed) {
    if (held.has(tier)) {
      deferred.push({ collectionId, tier });
      emit();
    } else {
      openCelebration(collectionId, tier);
    }
    return;
  }
  emit();

  // A read is written just after its response, so the server may simply be
  // behind: ask again a few times, then wait for the next credit.
  if (retriesLeft > 0 && isOpen(collectionId, tier)) {
    scheduleRetry(
      collectionId,
      tier,
      () => {
        if (isOpen(collectionId, tier)) void claim(collectionId, tier, false, retriesLeft - 1);
      },
      RETRY_MS,
    );
  }
}
