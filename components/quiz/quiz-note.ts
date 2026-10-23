import type { FeedbackKind } from "@/components/kit/study/feedback-note";
import { booleanLabelsFor, quizFeedbackLine } from "@/lib/quiz/templates/registry";
import type { QuizQuestion, QuizResponse } from "@/lib/quiz/types";

/** `answer` is the text of the right answer, set when the detail names it. */
export type QuizNote = {
  kind: FeedbackKind;
  title: string;
  detail: string;
  answer: string | null;
};

function answerText(question: QuizQuestion): string | null {
  switch (question.interaction) {
    case "choice":
      return (
        question.options.find((option) => question.correctOptionIds.includes(option.id))?.text ??
        null
      );
    case "boolean": {
      const labels = booleanLabelsFor(question);
      return (question.correctAnswer ? labels.yes : labels.no).toLowerCase();
    }
    case "text":
      return question.acceptedAnswers[0] ?? null;
  }
}

/** What the note under a checked question says. The template's own line often
 *  names the answer already; when it doesn't, a miss gets "The answer is …". */
export function quizNote(
  question: QuizQuestion,
  result: { passed: boolean; skipped: boolean; response: QuizResponse | null },
): QuizNote {
  const { passed, skipped, response } = result;
  const line = quizFeedbackLine(question, passed && !skipped, skipped ? null : response);
  const answer = answerText(question);
  const needsAnswer = !passed && answer !== null && !line?.includes(answer);
  const detail = [needsAnswer ? `The answer is “${answer}”.` : null, line]
    .filter(Boolean)
    .join(" ");

  const named = answer !== null && detail.includes(answer) ? answer : null;

  if (skipped) return { kind: "skipped", title: "Skipped, no problem", detail, answer: named };
  return passed
    ? { kind: "correct", title: "Correct", detail, answer: null }
    : { kind: "wrong", title: "Not quite", detail, answer: named };
}
