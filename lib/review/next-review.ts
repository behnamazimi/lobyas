import type { KitGrade } from "@/components/kit/study/grade-tiles";
import { AGAIN, EASY, GOOD, HARD, daysUntilNextReview, type ReviewGrade } from "@/lib/trace";
import type { ReviewRecallState } from "@/lib/terms/term-card";

/** Days until the term comes back after each grade, if graded at `now`. */
export function nextReviewDays(recall: ReviewRecallState, now: Date): Record<ReviewGrade, number> {
  return daysUntilNextReview(
    {
      readCount: recall.readCount,
      lastReadAt: recall.lastReadAt ? new Date(recall.lastReadAt) : null,
      recallStability: recall.stability,
      recallDifficulty: recall.difficulty,
      lastReviewRecallAt: recall.lastReviewAt ? new Date(recall.lastReviewAt) : null,
    },
    now,
  );
}

type Unit = { short: string; word: string; days: number; until: number };

const UNITS: Unit[] = [
  { short: "m", word: "minute", days: 1 / (24 * 60), until: 60 },
  { short: "h", word: "hour", days: 1 / 24, until: 24 },
  { short: "d", word: "day", days: 1, until: 60 },
  { short: "mo", word: "month", days: 30, until: 12 },
];
const YEAR: Unit = { short: "y", word: "year", days: 365, until: Infinity };

/** The largest unit the rounded value still fits under, so 23.6 hours reads
 *  as 1 day, not 24 hours. Years keep one decimal. */
function measure(days: number): { count: number; unit: Unit } {
  for (const unit of UNITS) {
    const count = Math.round(days / unit.days);
    if (count < unit.until) return { count: Math.max(1, count), unit };
  }
  return { count: Math.round((days / YEAR.days) * 10) / 10, unit: YEAR };
}

/** Short label for how long until a term comes back, e.g. "45m", "5h", "3d",
 *  "2mo", "1.5y". Rounded, since it's an estimate. */
export function formatNextReview(days: number): string {
  const { count, unit } = measure(days);
  return `${count}${unit.short}`;
}

/** What the Again button says while a missed term will be asked again this session. */
const RETRY_LABEL = "~2m";
const RETRY_DESCRIPTION = "asked again in about 2 minutes";

/** The same estimate in words, for screen readers. */
export function describeNextReview(days: number): string {
  const { count, unit } = measure(days);
  return `back in about ${count} ${unit.word}${count === 1 ? "" : "s"}`;
}

export const REVIEW_GRADE_OF: Record<KitGrade, ReviewGrade> = {
  again: AGAIN,
  hard: HARD,
  good: GOOD,
  easy: EASY,
};

export const KIT_GRADE_OF: Record<ReviewGrade, KitGrade> = {
  [AGAIN]: "again",
  [HARD]: "hard",
  [GOOD]: "good",
  [EASY]: "easy",
};

/** What each grade tile says under its label and to a screen reader. A miss
 *  that will be asked again this session says so instead of an interval. */
export function gradeTileLabels(
  nextReview: Record<ReviewGrade, number>,
  willRetry: boolean,
): {
  intervals: Record<KitGrade, string>;
  ariaLabels: Record<KitGrade, string>;
} {
  const intervals = {} as Record<KitGrade, string>;
  const ariaLabels = {} as Record<KitGrade, string>;
  for (const [kit, grade] of Object.entries(REVIEW_GRADE_OF) as [KitGrade, ReviewGrade][]) {
    const retrying = grade === AGAIN && willRetry;
    const name = kit.charAt(0).toUpperCase() + kit.slice(1);
    intervals[kit] = retrying ? RETRY_LABEL : formatNextReview(nextReview[grade]);
    ariaLabels[kit] = `${name}, ${
      retrying ? RETRY_DESCRIPTION : describeNextReview(nextReview[grade])
    }`;
  }
  return { intervals, ariaLabels };
}
