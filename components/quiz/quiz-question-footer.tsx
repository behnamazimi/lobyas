import { ArrowRight, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { FeedbackNote, Pill } from "@/components/kit";
import { QuizKeyboardHint } from "@/components/quiz/quiz-ui";
import type { QuizNote } from "@/components/quiz/quiz-note";
import { cn } from "@/lib/utils";

/** The note's detail, with the right answer in bold. */
function NoteDetail({ note }: { note: QuizNote }) {
  const at = note.answer ? note.detail.indexOf(note.answer) : -1;
  if (!note.answer || at < 0) return note.detail;
  return (
    <>
      {note.detail.slice(0, at)}
      <strong className="font-extrabold">{note.answer}</strong>
      {note.detail.slice(at + note.answer.length)}
    </>
  );
}

/** The line under the progress segments: where you are, and the practice round note. */
export function QuestionStepCaption({
  progressLabel,
  practice,
}: {
  progressLabel: string;
  practice: boolean;
}) {
  return (
    <div className="mt-2 flex items-baseline justify-between gap-3 text-[13px] font-bold text-muted tabular-nums">
      <span>{progressLabel}</span>
      {practice ? (
        <span className="text-right">Practice round: not counted toward mastery</span>
      ) : null}
    </div>
  );
}

type QuizQuestionFooterProps = {
  note: QuizNote | null;
  /** Shown above Check, for a dictation question the learner can't listen to. */
  skipSlot: ReactNode;
  submitted: boolean;
  isLast: boolean;
  canSubmit: boolean;
  canAdvance: boolean;
  justUnlocked: boolean;
  onSubmit: () => void;
  onAdvance: () => void;
};

export function QuizQuestionFooter({
  note,
  skipSlot,
  submitted,
  isLast,
  canSubmit,
  canAdvance,
  justUnlocked,
  onSubmit,
  onAdvance,
}: QuizQuestionFooterProps) {
  return (
    <footer className="flex shrink-0 flex-col gap-2 pt-1">
      {note ? (
        <FeedbackNote
          kind={note.kind}
          title={note.title}
          className="max-h-[132px] overflow-y-auto py-3"
        >
          <NoteDetail note={note} />
        </FeedbackNote>
      ) : null}
      {!submitted ? skipSlot : null}
      <p className="m-0 hidden text-center text-xs font-semibold text-muted md:block coarse:hidden [[data-keyboard=open]_&]:max-md:hidden">
        <QuizKeyboardHint action={!submitted ? "check" : isLast ? "see results" : "continue"} />
      </p>
      {!submitted ? (
        <Pill
          size="lg"
          onClick={onSubmit}
          disabled={!canSubmit}
          onMouseDown={(event) => event.preventDefault()}
          className="transition-transform active:scale-[0.97]"
        >
          Check
        </Pill>
      ) : (
        <Pill
          size="lg"
          onClick={onAdvance}
          disabled={!canAdvance}
          className={cn(
            "gap-2 transition-transform active:scale-[0.97]",
            justUnlocked && "study-pop",
          )}
        >
          <span
            key={isLast ? "results" : "next"}
            className="study-enter inline-flex items-center gap-2"
          >
            {isLast ? "See results" : "Next"}
            {isLast ? (
              <Trophy className="size-[18px] shrink-0" aria-hidden strokeWidth={2.4} />
            ) : (
              <ArrowRight className="size-[18px] shrink-0" aria-hidden strokeWidth={2.4} />
            )}
          </span>
        </Pill>
      )}
    </footer>
  );
}
