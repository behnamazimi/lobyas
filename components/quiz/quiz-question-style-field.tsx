import { ChoiceCards } from "@/components/kit";
import type { QuizQuestionStyle } from "@/lib/quiz/types";

type QuizQuestionStyleFieldProps = {
  value: QuizQuestionStyle;
  onChange: (style: QuizQuestionStyle) => void;
};

export function QuizQuestionStyleField({ value, onChange }: QuizQuestionStyleFieldProps) {
  return (
    <section data-tour="quiz-style" aria-labelledby="quiz-style-heading">
      <h2 id="quiz-style-heading" className="m-0 mb-2.5 text-[15px] font-extrabold">
        Question style
      </h2>
      <ChoiceCards
        label="Question style"
        value={value}
        onChange={(style) => onChange(style as QuizQuestionStyle)}
        options={[
          {
            value: "simple",
            label: "Simple",
            note: "Built from your definitions and examples.",
          },
          {
            value: "ai",
            label: "AI",
            note: "Fresh questions written for you. Uses credits.",
          },
        ]}
      />
    </section>
  );
}
