import { Zap } from "lucide-react";
import { Card, FeedbackNote, Pill } from "@/components/kit";
import { QuizCountField } from "@/components/quiz/quiz-count-field";
import { QuizQuestionStyleField } from "@/components/quiz/quiz-question-style-field";
import {
  QuizPickerAiNotices,
  QuizPickerCreditGate,
  QuizPickerFooterHint,
} from "@/components/quiz/quiz-picker-notices";
import { TopUpButton } from "@/components/ai-credits/top-up-button";
import { creditGate, isExhausted } from "@/lib/ai-credits/gate";
import { formatCount } from "@/lib/kit/text";
import { quizCreditUse } from "@/lib/quiz/credit-use";
import type { AiAccessView } from "@/lib/llm/types";
import { type PausedStudyCollection, type StudyCollection } from "@/lib/study/types";
import type { QuizQuestionStyle } from "@/lib/quiz/types";
import type { QuizSessionState } from "@/lib/quiz/session-storage";

export type QuizPickerStepProps = {
  collections: StudyCollection[];
  paused: PausedStudyCollection[];
  collectionName: string;
  ai: AiAccessView;
  aiFellBack: boolean;
  savedSession: QuizSessionState | null;
  onResumeSession: () => void;
  questionStyle: QuizQuestionStyle;
  onQuestionStyleChange: (style: QuizQuestionStyle) => void;
  aiRequiresSetup: boolean;
  errorMessage: string | null;
  availableTermCount: number;
  questionCount: number;
  questionCountInput: string;
  questionCountError: string | null;
  questionCountPresets: number[];
  onApplyQuestionCount: (value: number) => void;
  onQuestionCountInputChange: (value: string) => void;
  onStartQuiz: () => void;
};

function QuizPickerResumeBanner({
  savedSession,
  onResumeSession,
}: {
  savedSession: QuizSessionState;
  onResumeSession: () => void;
}) {
  return (
    <Card radius="md" className="flex items-center gap-3 p-4">
      <p className="m-0 min-w-0 flex-1 text-sm leading-snug font-bold">
        Quiz in progress: question{" "}
        <span className="tabular-nums">{savedSession.currentIndex + 1}</span> of{" "}
        <span className="tabular-nums">{savedSession.setup.questionCount}</span>. Starting a new
        quiz replaces it.
      </p>
      <Pill variant="soft" onClick={onResumeSession}>
        Resume
      </Pill>
    </Card>
  );
}

export function QuizPickerSetupPanel(props: QuizPickerStepProps) {
  const {
    ai,
    aiFellBack,
    collectionName,
    savedSession,
    onResumeSession,
    questionStyle,
    onQuestionStyleChange,
    aiRequiresSetup,
    errorMessage,
    availableTermCount,
    questionCount,
    questionCountInput,
    questionCountError,
    questionCountPresets,
    onApplyQuestionCount,
    onQuestionCountInputChange,
    onStartQuiz,
  } = props;

  const use = quizCreditUse(questionStyle, ai, questionCount);
  const startDisabled =
    availableTermCount === 0 || questionCountError !== null || aiRequiresSetup || use.overBalance;
  const creditsBlock = (questionStyle === "ai" && isExhausted(ai)) || use.overBalance;
  const gate = creditsBlock ? creditGate(ai.topUp) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="-mx-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-1">
        <div>
          <div className="flex h-[30px] w-fit items-center gap-1.5 rounded-full bg-quiz-tint pr-3 pl-2.5 text-[13px] font-extrabold text-quiz-text">
            <Zap className="size-4" strokeWidth={2.6} aria-hidden />
            Quiz
          </div>
          <h1 className="m-0 mt-2.5 font-heading text-[32px] leading-[1.1] font-extrabold">
            Set up your quiz
          </h1>
          <p className="m-0 mt-1.5 text-[15px] font-semibold [overflow-wrap:anywhere] text-muted">
            {formatCount(availableTermCount)} {availableTermCount === 1 ? "term" : "terms"} in{" "}
            {collectionName} can be quizzed.
          </p>
        </div>

        {savedSession ? (
          <QuizPickerResumeBanner savedSession={savedSession} onResumeSession={onResumeSession} />
        ) : null}

        <Card radius="md" className="p-4">
          <QuizQuestionStyleField value={questionStyle} onChange={onQuestionStyleChange} />
          <QuizPickerAiNotices
            ai={ai}
            aiFellBack={aiFellBack}
            aiRequiresSetup={aiRequiresSetup}
            questionStyle={questionStyle}
          />
        </Card>

        {errorMessage ? (
          <FeedbackNote kind="wrong" title="Couldn't start the quiz">
            {errorMessage}
          </FeedbackNote>
        ) : null}

        <Card radius="md" className="p-4">
          <QuizCountField
            presets={questionCountPresets}
            value={questionCount}
            input={questionCountInput}
            error={questionCountError}
            disabled={availableTermCount === 0}
            onPreset={onApplyQuestionCount}
            onInput={onQuestionCountInputChange}
          />
        </Card>

        {creditsBlock ? (
          <QuizPickerCreditGate
            ai={ai}
            use={use}
            questionCount={questionCount}
            onFit={onApplyQuestionCount}
            onUseSimple={() => onQuestionStyleChange("simple")}
          />
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <p className="m-0 text-center text-[13px] font-bold text-quiz-text">
          <QuizPickerFooterHint questionStyle={questionStyle} ai={ai} cost={use.cost} />
        </p>
        {gate?.kind === "top-up" ? (
          <TopUpButton
            amount={gate.amount}
            className="h-[60px] w-full rounded-full text-[17px] font-extrabold"
          />
        ) : (
          <Pill size="lg" onClick={onStartQuiz} disabled={startDisabled}>
            Start quiz
          </Pill>
        )}
      </div>
    </div>
  );
}
