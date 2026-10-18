import type { QuizAnswer, QuizQuestion } from "./types";

/** Answers are recorded one per question, in order, so answers[i] belongs
 *  to questions[i]. Only first attempts count: retries, unanswered and skipped
 *  questions aren't counted as missed. */
export function missedQuestions(questions: QuizQuestion[], answers: QuizAnswer[]): QuizQuestion[] {
  return questions.filter((question, index) => {
    const answer = answers[index];
    return !question.retry && answer?.passed === false && !answer.skipped;
  });
}

/** Right first attempts: retries never add to the score. */
export function scoreOf(answers: QuizAnswer[]): number {
  return answers.filter((answer) => answer.passed && !answer.retry).length;
}

/** How many of the quiz's own questions (not retries) count toward its score. */
export function scoredTotal(questions: QuizQuestion[], answers: QuizAnswer[]): number {
  const own = questions.filter((question) => !question.retry).length;
  return own - answers.filter((answer) => answer.skipped && !answer.retry).length;
}

/** Each missed term once, in the order it was first missed. */
export function missedTermIds(questions: QuizQuestion[], answers: QuizAnswer[]): string[] {
  return [...new Set(missedQuestions(questions, answers).map((question) => question.termId))];
}
