import { RadioGroup } from "react-aria-components";
import { AnswerTile } from "@/components/kit";
import { answerResult } from "@/components/quiz/quiz-question-state";
import { booleanLabelsFor } from "@/lib/quiz/templates/registry";
import type { QuizBooleanQuestion, QuizResponse } from "@/lib/quiz/types";

type BooleanAnswerProps = {
  question: QuizBooleanQuestion;
  response: QuizResponse | null;
  submitted: boolean;
  onRespond: (response: QuizResponse) => void;
};

export function BooleanAnswer({ question, response, submitted, onRespond }: BooleanAnswerProps) {
  const selected = response?.interaction === "boolean" ? response.value : null;
  const labels = booleanLabelsFor(question);

  return (
    <RadioGroup
      aria-label="Answer choices"
      value={selected === null ? "" : String(selected)}
      onChange={(value) => onRespond({ interaction: "boolean", value: value === "true" })}
      isDisabled={submitted}
      className="mt-4 grid grid-cols-2 gap-2.5"
    >
      {[true, false].map((value) => (
        <AnswerTile
          key={String(value)}
          value={String(value)}
          icon={value ? "yes" : "no"}
          state={answerResult(question.correctAnswer === value, selected === value, submitted)}
        >
          {value ? labels.yes : labels.no}
        </AnswerTile>
      ))}
    </RadioGroup>
  );
}
