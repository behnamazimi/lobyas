import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { EmptyPanel, Pill } from "@/components/kit";
import { StudyNoActiveCollectionsState } from "@/components/read/study/study-paused-state";
import {
  QuizPickerSetupPanel,
  type QuizPickerStepProps,
} from "@/components/quiz/quiz-picker-setup-panel";

function QuizPickerNoTerms() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-6">
      <EmptyPanel
        illustration={<EmptyBoxScene className="w-full" />}
        title="No terms yet"
        description="Add some terms to a collection, then come back to quiz yourself."
        actions={
          <Pill variant="secondary" href="/app/library">
            Go to library
          </Pill>
        }
      />
    </div>
  );
}

export function QuizPickerStep(props: QuizPickerStepProps) {
  const { collections, paused, savedSession, availableTermCount } = props;

  if (collections.length === 0) {
    return <StudyNoActiveCollectionsState paused={paused} activity="taking quizzes" />;
  }
  if (availableTermCount === 0 && !savedSession) return <QuizPickerNoTerms />;
  return <QuizPickerSetupPanel {...props} />;
}
