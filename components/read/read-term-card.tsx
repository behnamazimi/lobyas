import { ArrowRight, Eye } from "lucide-react";
import { memo } from "react";
import { Pill, StudyCard } from "@/components/kit";
import { QuizKeyboardHint } from "@/components/quiz/quiz-ui";
import { ReadCardHead } from "@/components/read/read-card-head";
import { FirstExposureKnownPrompt } from "@/components/shared/first-exposure-known-prompt";
import { StudyTermBody } from "@/components/terms/study-term-body";
import { TermNarrationPlayer } from "@/components/terms/term-narration-player";
import { termTitleClass } from "@/lib/kit/text";
import type { ReviewTerm } from "@/lib/review/types";
import { cn } from "@/lib/utils";

const PRESS_CLASS = "transition-transform duration-150 ease-out active:scale-[0.96]";
const ACTION_CLASS = `h-[58px] text-[17px] ${PRESS_CLASS}`;

function ReadCardMasked({
  term,
  hideQuestion,
  narrationAccess,
  onReveal,
}: {
  term: ReviewTerm;
  hideQuestion: boolean;
  narrationAccess: boolean;
  onReveal: () => void;
}) {
  return (
    <>
      <StudyCard
        centered
        onPress={onReveal}
        pressLabel={`${hideQuestion ? `${term.term}.` : `What is ${term.term}?`} Tap to reveal the definition.`}
        className="lg:max-h-[760px]"
      >
        <span
          lang={term.collectionLanguage}
          className={cn(
            "block max-w-full font-heading leading-[1.08] font-extrabold [overflow-wrap:anywhere]",
            termTitleClass(hideQuestion ? term.term : `What is ${term.term}?`),
          )}
        >
          {hideQuestion ? term.term : `What is ${term.term}?`}
        </span>
        {term.category ? (
          <span className="mt-2.5 block text-sm font-bold text-muted">{term.category}</span>
        ) : null}
      </StudyCard>
      {narrationAccess ? (
        <div className="invisible pointer-events-none h-0 overflow-hidden" aria-hidden>
          <TermNarrationPlayer
            termId={term.id}
            clipVersion={term.narrationVersion}
            preload
            showButton={false}
          />
        </div>
      ) : null}
    </>
  );
}

export const ReadTermCard = memo(function ReadTermCard({
  term,
  revealed,
  canGoBack,
  isPending,
  narrationAccess,
  hideQuestion,
  onReveal,
  onPrevious,
  onNext,
}: {
  term: ReviewTerm;
  revealed: boolean;
  canGoBack: boolean;
  isPending: boolean;
  narrationAccess: boolean;
  hideQuestion: boolean;
  onReveal: (termId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div data-tour="read-card" className="flex min-h-0 flex-1 flex-col gap-2">
      {revealed ? (
        <StudyCard className="lg:max-h-[760px]">
          <div lang={term.collectionLanguage}>
            <ReadCardHead term={term} narrationAccess={narrationAccess} narrationPreload />
            <StudyTermBody key={term.id} term={term} />
          </div>
        </StudyCard>
      ) : (
        <ReadCardMasked
          term={term}
          hideQuestion={hideQuestion}
          narrationAccess={narrationAccess}
          onReveal={() => onReveal(term.id)}
        />
      )}
      {revealed && term.isNewToUser ? (
        <FirstExposureKnownPrompt
          termId={term.id}
          term={term.term}
          onMarkedKnown={onNext}
          placement="foot"
        />
      ) : null}
      <div className="flex gap-2">
        {canGoBack ? (
          <Pill
            variant="soft"
            onClick={onPrevious}
            disabled={isPending}
            className={cn(ACTION_CLASS, "px-6")}
          >
            Previous
          </Pill>
        ) : null}
        {revealed ? (
          <Pill
            size="lg"
            onClick={onNext}
            disabled={isPending}
            className={cn(ACTION_CLASS, "min-w-0 flex-1")}
          >
            {isPending ? "Loading…" : "Next term"}
            <ArrowRight className="size-[18px]" strokeWidth={3} aria-hidden />
          </Pill>
        ) : (
          <Pill
            size="lg"
            onClick={() => onReveal(term.id)}
            className={cn(ACTION_CLASS, "min-w-0 flex-1")}
          >
            Show definition
            <Eye className="size-[18px]" strokeWidth={2.6} aria-hidden />
          </Pill>
        )}
      </div>
      <div className="hidden text-center text-xs font-semibold text-muted md:block coarse:hidden">
        <QuizKeyboardHint action={revealed ? "go to the next term" : "reveal the answer"} />
      </div>
    </div>
  );
});
