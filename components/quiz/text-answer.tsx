import { useId } from "react";
import { AnswerInput } from "@/components/kit";
import { gradeAnswer } from "@/lib/quiz/grade";
import type { QuizResponse, QuizTextQuestion } from "@/lib/quiz/types";

type TextAnswerProps = {
  question: QuizTextQuestion;
  response: QuizResponse | null;
  submitted: boolean;
  skipped: boolean;
  onRespond: (response: QuizResponse) => void;
};

/** Focusing from script on a touch screen opens the keyboard before the browser
 *  applies autocapitalize (iOS starts shifted) and hides the question, so only
 *  mouse and keyboard users get autofocus. */
function hasFinePointer(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

export function TextAnswer({ question, response, submitted, skipped, onRespond }: TextAnswerProps) {
  const id = useId();
  const text = response?.interaction === "text" ? response.text : "";
  const passed = submitted && response !== null && gradeAnswer(question, response);
  const state = !submitted ? "default" : skipped ? "skipped" : passed ? "correct" : "wrong";

  return (
    <div className="mt-4 flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        Your answer
      </label>
      <AnswerInput
        id={id}
        state={state}
        value={text}
        onChange={(event) => onRespond({ interaction: "text", text: event.target.value })}
        readOnly={submitted}
        autoFocus={hasFinePointer()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        lang={question.language}
        placeholder="Your answer"
      />
    </div>
  );
}
