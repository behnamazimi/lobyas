import { CircleCheck, CircleX } from "lucide-react";
import { closeMissHint } from "@/lib/quiz/templates/typed";
import type { QuizResponse, QuizTextQuestion } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

type TextFeedbackProps = {
  question: QuizTextQuestion;
  passed: boolean;
  response: QuizResponse | null;
};

export function TextFeedback({ question, passed, response }: TextFeedbackProps) {
  const Icon = passed ? CircleCheck : CircleX;
  const hint = passed ? null : closeMissHint(question, response);

  return (
    <div role="status" className="mt-3 flex items-start gap-2.5 text-sm">
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", passed ? "text-success" : "text-error")}
        aria-hidden
        strokeWidth={2}
      />
      <div className="min-w-0 space-y-1">
        <p className={cn("m-0 font-medium", passed ? "text-success" : "text-error")}>
          {passed ? "Correct" : "Not quite"}
        </p>
        {passed ? null : (
          <p className="m-0 text-base-content">
            The answer is <strong className="font-semibold">{question.acceptedAnswers[0]}</strong>.
            {hint ? ` ${hint}` : null}
          </p>
        )}
        {question.dictation ? (
          <p className="m-0 text-base-content/70">Meaning: {question.dictation.meaning}</p>
        ) : null}
      </div>
    </div>
  );
}
