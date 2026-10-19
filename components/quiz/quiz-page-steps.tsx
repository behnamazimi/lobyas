"use client";

import { PreparingScene } from "@/components/illustrations/scenes/preparing";
import { QuestionStepCaption } from "@/components/quiz/quiz-question-footer";
import { QuizQuestionView } from "@/components/quiz/quiz-question";
import { QuizPickerStep } from "@/components/quiz/quiz-picker-step";
import { EmptyPanel, FeedbackNote, Pill, QuizSegments, StatusScreen } from "@/components/kit";
import type { AiAccessView } from "@/lib/llm/types";
import { type PausedStudyCollection, type StudyCollection } from "@/lib/study/types";
import { type useQuizSession } from "@/components/quiz/use-quiz-session";
import { SomethingWentWrongScene } from "@/components/illustrations/scenes/something-went-wrong";

export type UseQuizSessionResult = ReturnType<typeof useQuizSession>;

export function QuizGeneratingStep({ quiz }: { quiz: UseQuizSessionResult }) {
  const isSimple = quiz.questionStyle === "simple";
  const questions = `${quiz.questionCount} question${quiz.questionCount === 1 ? "" : "s"}`;
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
      <EmptyPanel
        illustration={<PreparingScene className="w-full" />}
        title={isSimple ? "Preparing your quiz" : "Building your quiz"}
        description={
          isSimple
            ? `Setting up ${questions}…`
            : `Writing ${questions}… This usually takes a few seconds.`
        }
      />
    </div>
  );
}

function QuizActiveQuestionStep({ quiz }: { quiz: UseQuizSessionResult }) {
  const question = quiz.questions[quiz.currentIndex];
  if (!question) return null;

  const unitLabel = quiz.practice ? "Practice" : question.retry ? "Retry" : "Question";
  const progressLabel = `${unitLabel} ${quiz.currentIndex + 1} of ${quiz.questions.length}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <QuizSegments total={quiz.questions.length} current={quiz.currentIndex} />
        <QuestionStepCaption progressLabel={progressLabel} practice={quiz.practice} />
      </div>
      {quiz.errorMessage ? (
        <FeedbackNote kind="wrong" title="Something went wrong" className="shrink-0">
          {quiz.errorMessage}
        </FeedbackNote>
      ) : null}
      <QuizQuestionView
        key={`${question.termId}-${quiz.currentIndex}`}
        question={question}
        isLast={quiz.isLastAfter}
        onAnswer={quiz.handleQuestionAnswer}
        onSkip={quiz.handleQuestionSkip}
      />
    </div>
  );
}

export function QuizPlayingStep({ quiz }: { quiz: UseQuizSessionResult }) {
  return <QuizActiveQuestionStep quiz={quiz} />;
}

export function QuizPickerStepSection({
  quiz,
  ai,
  aiFellBack,
  canUseAi,
  collectionName,
  collections,
  paused,
  aiRequiresSetup,
}: {
  quiz: UseQuizSessionResult;
  ai: AiAccessView;
  aiFellBack: boolean;
  canUseAi: boolean;
  collectionName: string;
  collections: StudyCollection[];
  paused: PausedStudyCollection[];
  aiRequiresSetup: boolean;
}) {
  return (
    <QuizPickerStep
      collections={collections}
      paused={paused}
      collectionName={collectionName}
      ai={ai}
      aiFellBack={aiFellBack}
      savedSession={quiz.savedSession}
      onResumeSession={quiz.handleResumeSession}
      questionStyle={quiz.questionStyle}
      onQuestionStyleChange={(style) => {
        quiz.setQuestionStyle(style);
        quiz.setErrorMessage(null);
      }}
      aiRequiresSetup={aiRequiresSetup}
      errorMessage={quiz.errorMessage}
      availableTermCount={quiz.availableTermCount}
      questionCount={quiz.questionCount}
      questionCountInput={quiz.questionCountInput}
      questionCountError={quiz.questionCountError}
      questionCountPresets={quiz.questionCountPresets}
      onApplyQuestionCount={quiz.applyQuestionCount}
      onQuestionCountInputChange={quiz.handleQuestionCountInputChange}
      onStartQuiz={() => {
        quiz.saveSetup();
        void quiz.handleStartQuiz(canUseAi);
      }}
    />
  );
}

export function QuizErrorStep({ quiz }: { quiz: UseQuizSessionResult }) {
  return (
    <StatusScreen
      illustration={<SomethingWentWrongScene className="w-full" />}
      title="Quiz didn’t finish"
      description={
        <span role="alert">{quiz.errorMessage ?? "Couldn't complete the quiz. Try again."}</span>
      }
      actions={
        <Pill variant="secondary" onClick={quiz.resetQuizState}>
          Try again
        </Pill>
      }
    />
  );
}
