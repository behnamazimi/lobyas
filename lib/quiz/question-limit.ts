import { getMaxStudyCount } from "@/lib/study/count";
import { AI_QUIZ_MAX_QUESTIONS } from "./mix";
import type { QuizQuestionStyle } from "./types";

/** The most questions a quiz of this style can ask from the terms available. */
export function maxQuizQuestions(style: QuizQuestionStyle, availableTermCount: number): number {
  const max = getMaxStudyCount(availableTermCount);
  return style === "ai" ? Math.min(max, AI_QUIZ_MAX_QUESTIONS) : max;
}

/** The quick count choices that fit the terms available; a custom count covers the rest. */
export function quizCountPresets(max: number): number[] {
  return [5, 10, 20].filter((count) => count <= max);
}
