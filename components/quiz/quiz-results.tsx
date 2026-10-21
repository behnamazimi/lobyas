"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { KeepTrainingScene, QuizCheerScene } from "@/components/illustrations/scenes/quiz-results";
import { Card, Divider, Pill, ProgressRing, StatTile } from "@/components/kit";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGoalCount } from "@/components/goals/use-goal-count";
import { feedback } from "@/lib/feedback";
import { formatCount } from "@/lib/kit/text";
import type { QuizTerm } from "@/lib/quiz/types";

type QuizResultsProps = {
  score: number;
  total: number;
  practice: boolean;
  missedTerms: QuizTerm[];
  onQuizAgain: () => void;
  onPractice: () => void;
  onChangeSetup: () => void;
};

function scoreMessage(score: number, total: number, missed: number) {
  if (total === 0) return "No questions answered.";
  if (score === total) return "All correct.";
  if (score / total >= 0.8) return "Strong round.";
  if (missed === 0) return "Keep at it.";
  return `${missed === 1 ? "One term" : `${missed} terms`} could use another look.`;
}

function GoalRow() {
  const today = useGoalCount("quiz");
  if (!today || today.goal === null) return null;
  return (
    <Card radius="md" className="flex items-center gap-3 px-3.5 py-2.5">
      <ProgressRing value={today.count / today.goal} tone="quiz" size={30} strokeWidth={14} />
      <div className="flex-1 text-sm font-bold">Quiz goal today</div>
      <div className="text-sm font-extrabold text-quiz-text tabular-nums">
        {formatCount(today.count)} of {formatCount(today.goal)}
      </div>
    </Card>
  );
}

/** Expands in place: a finished quiz can't be restored after navigating
 *  away, so the definitions live here rather than behind links. */
function MissedTerms({ terms }: { terms: QuizTerm[] }) {
  return (
    <section aria-labelledby="quiz-missed-heading">
      <h2 id="quiz-missed-heading" className="m-0 mb-2 ml-1 text-base font-extrabold">
        Terms to revisit
      </h2>
      <Card radius="md" className="overflow-hidden">
        <ul className="m-0 list-none p-0">
          {terms.map((term, index) => (
            <li key={term.id}>
              {index > 0 ? <Divider className="mx-4" /> : null}
              <Collapsible className="group">
                <CollapsibleTrigger className="flex min-h-14 w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-start">
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[19px] font-extrabold [overflow-wrap:anywhere]">
                      {term.term}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-muted">
                      {term.collectionName}
                    </span>
                  </span>
                  <span className="flex h-[26px] shrink-0 items-center rounded-full bg-wrong-tint px-2.5 text-xs font-extrabold text-wrong-text">
                    Missed
                  </span>
                  <ChevronDown
                    className="mt-0.5 size-5 shrink-0 text-muted transition-transform duration-200 group-data-[expanded]:rotate-180"
                    aria-hidden
                    strokeWidth={2.4}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 px-4 pb-4 text-[15px] leading-snug font-semibold">
                    <p className="m-0">{term.definition}</p>
                    {term.example ? <p className="m-0 text-muted italic">{term.example}</p> : null}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

export function QuizResults({
  score,
  total,
  practice,
  missedTerms,
  onQuizAgain,
  onPractice,
  onChangeSetup,
}: QuizResultsProps) {
  const hasMisses = missedTerms.length > 0;
  const strongRound = !practice && total > 0 && score / total >= 0.8;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (strongRound) feedback("quiz-finish");
  }, [strongRound]);

  return (
    <div className="study-enter flex min-h-0 flex-1 flex-col gap-3">
      <div className="-mx-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-1">
        <div className="flex items-center gap-3.5">
          {strongRound ? (
            <QuizCheerScene className="w-[132px] shrink-0" />
          ) : (
            <KeepTrainingScene className="w-[132px] shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="m-0 font-heading text-4xl leading-[1.02] font-extrabold">
              {total === 0 ? "Nothing scored" : `${score} of ${total} right`}
            </h1>
            <p className="m-0 mt-2 text-[15px] leading-snug font-semibold text-muted">
              {practice
                ? "Practice round: not counted toward mastery."
                : scoreMessage(score, total, missedTerms.length)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatTile tone="success" value={String(score)} label="Correct" />
          <StatTile tone="wrong" value={String(Math.max(total - score, 0))} label="Missed" />
          <StatTile tone="read" value={`${percent}%`} label="Score" />
        </div>

        {practice ? null : <GoalRow />}
        {hasMisses ? <MissedTerms terms={missedTerms} /> : null}
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2">
        {practice ? (
          <>
            {hasMisses ? (
              <Pill size="lg" onClick={onPractice}>
                Practice again
              </Pill>
            ) : null}
            <Pill
              size="lg"
              variant={hasMisses ? "secondary" : "primary"}
              onClick={onQuizAgain}
              className={hasMisses ? "h-[52px] text-base" : undefined}
            >
              Start a real quiz
            </Pill>
          </>
        ) : (
          <>
            <Pill size="lg" onClick={onQuizAgain}>
              Quiz again
            </Pill>
            {hasMisses ? (
              <Pill
                variant="secondary"
                size="lg"
                onClick={onPractice}
                className="h-[52px] text-base"
              >
                Practice missed
                <span className="font-semibold text-muted">(not scored)</span>
              </Pill>
            ) : null}
          </>
        )}
        <Pill variant="ghost" onClick={onChangeSetup} className="self-center text-read-text">
          Change setup
        </Pill>
      </div>
    </div>
  );
}
