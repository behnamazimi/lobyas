import { RETRIES_PER_TERM, RETRY_MAX_GAP, RETRY_MIN_GAP } from "./mix";
import { shuffle, type Rng } from "./random";
import type { QuizQuestion, QuizRetry } from "./types";

type AnswerInput = {
  questions: QuizQuestion[];
  currentIndex: number;
  passed: boolean;
  /** Practice rounds and skipped questions never come back. */
  scored: boolean;
  rng?: Rng;
};

function gapFor(originalCount: number): number {
  return Math.min(RETRY_MAX_GAP, Math.max(RETRY_MIN_GAP, Math.round(originalCount / 4)));
}

function nextRetry(question: QuizQuestion, passed: boolean): QuizRetry | null {
  if (!question.retry) return passed ? null : 1;
  if (!passed || question.retry >= RETRIES_PER_TERM) return null;
  return (question.retry + 1) as QuizRetry;
}

function shuffledCopy(question: QuizQuestion, retry: QuizRetry, rng?: Rng): QuizQuestion {
  if (question.interaction !== "choice") return { ...question, retry };
  return { ...question, retry, options: shuffle(question.options, rng) };
}

/** Where a retry goes: after the gap, never next to another retry while
 *  ordinary questions remain, and at the end when the quiz is nearly over. */
function insertionIndex(questions: QuizQuestion[], currentIndex: number, gap: number): number {
  let index = Math.min(currentIndex + 1 + gap, questions.length);
  while (index < questions.length && (questions[index - 1]?.retry || questions[index]?.retry)) {
    index += 1;
  }
  return index;
}

/**
 * The quiz after one answer. A miss queues retry 1; a right retry 1 queues
 * retry 2; a wrong retry, a right retry 2, or a full session budget (as many
 * retries as the quiz has questions) queues nothing. Only the first attempt
 * of a term is scored.
 */
export function questionsAfterAnswer({
  questions,
  currentIndex,
  passed,
  scored,
  rng,
}: AnswerInput): QuizQuestion[] {
  const question = questions[currentIndex];
  if (!question || !scored) return questions;

  const retry = nextRetry(question, passed);
  if (!retry) return questions;

  const retries = questions.filter((q) => q.retry).length;
  const originals = questions.length - retries;
  if (retries >= originals) return questions;

  const gap = gapFor(originals) * retry;
  const index = insertionIndex(questions, currentIndex, gap);
  return [
    ...questions.slice(0, index),
    shuffledCopy(question, retry, rng),
    ...questions.slice(index),
  ];
}
