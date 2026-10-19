import { useState } from "react";
import { AnswerInput, ChoiceCards } from "@/components/kit";

type QuizCountFieldProps = {
  presets: number[];
  value: number;
  input: string;
  error: string | null;
  disabled: boolean;
  onPreset: (value: number) => void;
  onInput: (raw: string) => void;
};

/** Preset counts as pills, plus Custom, which opens a number field. A saved count
 *  that isn't a preset opens on Custom. */
export function QuizCountField({
  presets,
  value,
  input,
  error,
  disabled,
  onPreset,
  onInput,
}: QuizCountFieldProps) {
  const [customChosen, setCustomChosen] = useState(false);
  const custom = customChosen || error !== null || !presets.includes(value);
  const options = [
    ...presets.map((count) => ({ value: String(count), label: String(count) })),
    { value: "custom", label: "Custom" },
  ];

  return (
    <section aria-labelledby="quiz-count-heading">
      <h2 id="quiz-count-heading" className="m-0 mb-2.5 text-[15px] font-extrabold">
        How many questions
      </h2>
      <fieldset disabled={disabled} className="m-0 min-w-0 border-0 p-0">
        <ChoiceCards
          label="How many questions"
          columns={Math.min(4, Math.max(2, options.length)) as 2 | 3 | 4}
          value={custom ? "custom" : String(value)}
          onChange={(next) => {
            if (next === "custom") {
              setCustomChosen(true);
              return;
            }
            setCustomChosen(false);
            onPreset(Number(next));
          }}
          options={options}
        />
        {custom ? (
          <AnswerInput
            aria-label="Number of questions"
            inputMode="numeric"
            value={input}
            onChange={(event) => onInput(event.target.value)}
            aria-invalid={error !== null}
            className="mt-2.5 h-12 text-[17px]"
          />
        ) : null}
      </fieldset>
      {error ? (
        <p role="alert" className="m-0 mt-2 text-[13px] font-bold text-wrong-text">
          {error}
        </p>
      ) : (
        <p className="m-0 mt-2.5 text-[13px] font-semibold text-muted">
          Each answered question counts toward your Quiz goal.
        </p>
      )}
    </section>
  );
}
