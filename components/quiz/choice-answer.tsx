import { RadioGroup } from "react-aria-components";
import { AnswerRadio } from "@/components/kit";
import { answerResult } from "@/components/quiz/quiz-question-state";
import type { QuizChoiceQuestion, QuizResponse } from "@/lib/quiz/types";

type ChoiceAnswerProps = {
  question: QuizChoiceQuestion;
  response: QuizResponse | null;
  submitted: boolean;
  onRespond: (response: QuizResponse) => void;
};

export function ChoiceAnswer({ question, response, submitted, onRespond }: ChoiceAnswerProps) {
  const selectedIds = response?.interaction === "choice" ? response.optionIds : [];

  return (
    <RadioGroup
      aria-label="Answer choices"
      value={selectedIds[0] ?? ""}
      onChange={(optionId) => onRespond({ interaction: "choice", optionIds: [optionId] })}
      isDisabled={submitted}
      className="mt-4 flex flex-col gap-2.5"
    >
      {question.options.map((option, index) => (
        <AnswerRadio
          key={option.id}
          value={option.id}
          shortcut={index + 1}
          state={answerResult(
            question.correctOptionIds.includes(option.id),
            selectedIds.includes(option.id),
            submitted,
          )}
        >
          {option.text}
        </AnswerRadio>
      ))}
    </RadioGroup>
  );
}
