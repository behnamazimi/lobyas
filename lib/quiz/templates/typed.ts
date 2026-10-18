import { closeMiss } from "../text/answer-match";
import { TYPED_MAX_WORDS } from "../mix";
import type { QuizResponse, QuizTerm, QuizTextQuestion } from "../types";

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Longer entries are tedious to type exactly. */
export function isShortEnoughToType(term: QuizTerm): boolean {
  return wordCount(term.term) <= TYPED_MAX_WORDS;
}

export function textQuestion(
  term: QuizTerm,
  fields: Pick<QuizTextQuestion, "template" | "prompt" | "quote" | "hint">,
): QuizTextQuestion {
  return {
    interaction: "text",
    termId: term.id,
    acceptedAnswers: [term.term],
    language: term.language,
    ...fields,
  };
}

const CLOSE_MISS_HINT = {
  accents: "Check the accents.",
  article: "Check the article.",
} as const;

/** Shared feedback for typed templates: show the answer on a miss, and say so
 *  when the miss was only accents or the article. */
export function typedFeedback(
  question: QuizTextQuestion,
  passed: boolean,
  response: QuizResponse | null,
): string | null {
  if (passed) return null;

  const answer = `The answer is ${question.acceptedAnswers[0]}.`;
  const miss =
    response?.interaction === "text" ? closeMiss(response.text, question.acceptedAnswers) : null;
  return miss ? `${answer} ${CLOSE_MISS_HINT[miss]}` : answer;
}
