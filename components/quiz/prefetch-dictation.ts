import type { QuizQuestion } from "@/lib/quiz/types";

const requested = new Set<string>();

/** Fetches each dictation clip once so the browser has it by the time the
 *  question opens. */
export function prefetchDictationClips(questions: QuizQuestion[]): void {
  for (const question of questions) {
    if (question.interaction !== "text" || !question.dictation) continue;
    const src = question.dictation.clipUrl;
    if (requested.has(src)) continue;
    requested.add(src);
    fetch(src, { priority: "low" })
      .then((response) => response.arrayBuffer())
      .catch(() => requested.delete(src));
  }
}
