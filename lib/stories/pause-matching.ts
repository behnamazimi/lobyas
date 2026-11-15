import type { Pause } from "./silence";

/** The estimate can be off by seconds, so a pause further than this from where a
 *  sentence is expected to end is not that sentence's pause. */
const MATCH_WINDOW_SECONDS = 2;
/** A pause this long or longer counts fully as a sentence-end pause. */
export const FULL_PAUSE_SECONDS = 0.5;
const SHORTEST_COUNTED_SECONDS = 0.1;
// A match must score above zero. Longer pauses count most, so a short comma
// pause is only taken when it sits right on the estimate.
const NEARNESS_WEIGHT = 0.35;
const LENGTH_WEIGHT = 0.65;
const MATCH_THRESHOLD = 0.3;

function matchScore(estimate: number, pause: Pause): number {
  const distance = Math.abs((pause.start + pause.end) / 2 - estimate);
  if (distance > MATCH_WINDOW_SECONDS) return 0;
  const nearness = 1 - distance / MATCH_WINDOW_SECONDS;
  const length = Math.min(
    Math.max(
      (pause.end - pause.start - SHORTEST_COUNTED_SECONDS) /
        (FULL_PAUSE_SECONDS - SHORTEST_COUNTED_SECONDS),
      0,
    ),
    1,
  );
  return NEARNESS_WEIGHT * nearness + LENGTH_WEIGHT * length - MATCH_THRESHOLD;
}

/** Pairs each expected boundary (in seconds, in order) with a pause, or with
 *  nothing. The pairing is done for all of them at once and keeps the order,
 *  so two boundaries never take the same pause and a pause is never skipped
 *  backwards. A boundary with a lower weight counts for less, so it only takes
 *  a pause that a heavier one has no better use for. Returns the index of the
 *  chosen pause for each boundary. */
export function matchBoundariesToPauses(
  estimates: number[],
  pauses: Pause[],
  weights: number[] = [],
): (number | null)[] {
  const rows = estimates.length + 1;
  const columns = pauses.length + 1;
  const best = new Float64Array(rows * columns);
  const at = (i: number, j: number) => i * columns + j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < columns; j += 1) {
      const score = matchScore(estimates[i - 1]!, pauses[j - 1]!) * (weights[i - 1] ?? 1);
      let value = Math.max(best[at(i - 1, j)]!, best[at(i, j - 1)]!);
      if (score > 0) value = Math.max(value, best[at(i - 1, j - 1)]! + score);
      best[at(i, j)] = value;
    }
  }

  const matches: (number | null)[] = estimates.map(() => null);
  let i = rows - 1;
  let j = columns - 1;
  while (i > 0 && j > 0) {
    const score = matchScore(estimates[i - 1]!, pauses[j - 1]!) * (weights[i - 1] ?? 1);
    if (score > 0 && best[at(i, j)] === best[at(i - 1, j - 1)]! + score) {
      matches[i - 1] = j - 1;
      i -= 1;
      j -= 1;
    } else if (best[at(i, j)] === best[at(i - 1, j)]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  return matches;
}
