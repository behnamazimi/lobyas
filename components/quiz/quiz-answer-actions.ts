import type { PendingQuizWrite } from "@/lib/quiz/session-storage";
import { traceQuestionType } from "@/lib/quiz/trace-type";
import { scoredTotal, scoreOf } from "@/lib/quiz/results";
import { questionsAfterAnswer } from "@/lib/quiz/retry";
import type { QuizAnswer, QuizQuestion } from "@/lib/quiz/types";
import type { QuizStep } from "@/components/quiz/use-quiz-setup";

type AnswerSetters = {
  setStep: (step: QuizStep) => void;
  setAnswers: (answers: QuizAnswer[]) => void;
  setQuestions: (questions: QuizQuestion[]) => void;
  setCurrentIndex: (updater: (index: number) => number) => void;
  setResultsScore: (score: { score: number; total: number }) => void;
  setPendingWrites: (updater: (writes: PendingQuizWrite[]) => PendingQuizWrite[]) => void;
  /** Enqueues the background TRACE write for one answer and wires up its
   *  own settle handling (retry, toast, pendingWrites cleanup, finalize
   *  check) — defined in the hook, shared with resume-replay. */
  enqueueAnswerWrite: (write: PendingQuizWrite) => void;
  /** Called once, when the last question is answered — marks the session
   *  complete and checks for an immediate finalize, in case the queue is
   *  already idle at that instant. */
  markSessionComplete: () => void;
};

export function submitQuizAnswer(
  setters: AnswerSetters,
  passed: boolean,
  args: {
    question: QuizQuestion;
    answers: QuizAnswer[];
    currentIndex: number;
    questions: QuizQuestion[];
    /** Practice rounds replay questions whose answers were just shown, so
     *  they're graded on screen but never sent to TRACE. */
    practice: boolean;
    /** The learner couldn't answer (no sound): not scored, not sent to TRACE. */
    skipped?: boolean;
  },
) {
  const { question } = args;
  const nextQuestions = questionsAfterAnswer({
    questions: args.questions,
    currentIndex: args.currentIndex,
    passed,
    scored: !args.practice && !args.skipped,
  });
  const isLastQuestion = args.currentIndex + 1 >= nextQuestions.length;
  const answer: QuizAnswer = args.skipped
    ? { termId: question.termId, passed: false, skipped: true }
    : { termId: question.termId, passed };
  if (question.retry) answer.retry = question.retry;
  const nextAnswers = [...args.answers, answer];

  setters.setAnswers(nextAnswers);
  if (nextQuestions !== args.questions) setters.setQuestions(nextQuestions);

  if (!args.practice && !args.skipped && !question.retry) {
    const write: PendingQuizWrite = {
      id: crypto.randomUUID(),
      termId: args.question.termId,
      passed,
      questionType: traceQuestionType(args.question),
    };
    setters.setPendingWrites((prev) => [...prev, write]);
    setters.enqueueAnswerWrite(write);
  }

  if (!isLastQuestion) {
    setters.setCurrentIndex((index) => index + 1);
    return;
  }

  setters.setResultsScore({
    score: scoreOf(nextAnswers),
    total: scoredTotal(nextQuestions, nextAnswers),
  });
  setters.setStep("results");
  if (!args.practice) setters.markSessionComplete();
}
