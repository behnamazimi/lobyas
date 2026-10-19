import { resolveAppCollection } from "@/lib/collections/current";
import { isCollectionPreference, writePreferenceCookie } from "@/lib/study/collection-preference";
import { MAX_STUDY_TERMS } from "@/lib/study/types";
import type { QuizQuestionStyle } from "./types";

export const QUIZ_SETUP_COOKIE = "lb-quiz-setup";

export const DEFAULT_QUIZ_QUESTION_COUNT = 10;

/** `count` is only stored once the user picks one; until then every
 *  collection opens on the default. */
export type SavedQuizSetup = {
  style: QuizQuestionStyle;
  count?: number;
  collectionId?: string;
};

export type InitialQuizSetup = {
  style: QuizQuestionStyle;
  collectionId: string;
  count: number | null;
  /** They last used AI quizzes but AI isn't available now, so we opened on Simple. */
  aiFellBack: boolean;
};

function isValidCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_STUDY_TERMS;
}

export function parseQuizSetupCookie(value: string | undefined): SavedQuizSetup | null {
  if (!value) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;

  const record = parsed as Record<string, unknown>;
  if (record.style !== "simple" && record.style !== "ai") return null;

  const setup: SavedQuizSetup = { style: record.style };
  if (isValidCount(record.count)) setup.count = record.count;
  if (isCollectionPreference(record.collectionId)) setup.collectionId = record.collectionId;
  return setup;
}

export function saveQuizSetupPreference(setup: SavedQuizSetup): void {
  writePreferenceCookie(QUIZ_SETUP_COOKIE, JSON.stringify(setup));
}

export function resolveInitialQuizSetup(input: {
  saved: SavedQuizSetup | null;
  collectionParam: string | undefined;
  currentId: string | null;
  activeIds: string[];
  aiAvailable: boolean;
}): InitialQuizSetup {
  const { saved, collectionParam, currentId, activeIds, aiAvailable } = input;
  const wantedAi = saved?.style === "ai";

  return {
    // An AI quiz can't start without a key or credits, so don't open on it.
    style: wantedAi && aiAvailable ? "ai" : "simple",
    aiFellBack: wantedAi && !aiAvailable,
    collectionId: resolveAppCollection({
      collectionParam,
      currentId,
      rememberedId: saved?.collectionId ?? null,
      activeIds,
    }),
    count: saved?.count ?? null,
  };
}

/** The user's count capped to what the collection has, else the default
 *  (also capped). Never below 1 so the field always shows a number. */
export function questionCountFor(preferred: number | null, max: number): number {
  if (max <= 0) return 1;
  return Math.min(preferred ?? DEFAULT_QUIZ_QUESTION_COUNT, max);
}

/** What to remember when a quiz starts. The collection is the app's current
 *  one, so it isn't stored here (an old cookie may still carry one). */
export function quizSetupToSave(input: {
  style: QuizQuestionStyle;
  preferredCount: number | null;
}): SavedQuizSetup {
  const setup: SavedQuizSetup = { style: input.style };
  if (input.preferredCount !== null) setup.count = input.preferredCount;
  return setup;
}
