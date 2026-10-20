import { SECTION_TITLE, StatTile } from "@/components/kit";
import type { GradeDistributionSummary, WebStatsSnapshot } from "@/lib/mastery/collection-stats";
import type { GoalDayCounts } from "@/lib/goals/progress";
import { AGAIN, EASY, GOOD, HARD, type ReviewGrade } from "@/lib/trace";
import { cn, pluralize } from "@/lib/utils";

/** TRACE has no backlog to clear — a term with no history is simply served
 *  when this tier has room for it. This is a snapshot of current exposure,
 *  not a queue count. */
function formatUnseenLine(unseen: number): string {
  return unseen === 0 ? "Everything started" : `${pluralize(unseen, "term")} not started`;
}

function RollupRow({
  label,
  verb,
  unseen,
  today,
}: {
  label: string;
  verb: string;
  unseen: number;
  today: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 text-sm font-bold">
      <span>{label}</span>
      <span className="flex flex-col items-end text-right text-muted">
        <span className="tabular-nums">{formatUnseenLine(unseen)}</span>
        <span className="tabular-nums">
          {today} {verb} today
        </span>
      </span>
    </div>
  );
}

const GRADES: { grade: ReviewGrade; label: string; className?: string }[] = [
  { grade: AGAIN, label: "Again" },
  { grade: HARD, label: "Hard" },
  { grade: GOOD, label: "Good" },
  { grade: EASY, label: "Easy", className: "bg-success text-success-content" },
];
const GRADE_TONE = {
  [AGAIN]: "wrong",
  [HARD]: "hard",
  [GOOD]: "success",
  [EASY]: "success",
} as const;

/** Plain distribution, no verdict — what's "too generous" is subjective,
 *  this just shows the grading habit itself. */
function GradeDistribution({ summary }: { summary: GradeDistributionSummary }) {
  return (
    <>
      <h3 className={cn(SECTION_TITLE, "mt-2")}>Grading</h3>
      <dl className="m-0 mt-2 grid grid-cols-4 gap-2">
        {GRADES.map(({ grade, label, className }) => (
          <div key={grade} className="flex flex-col-reverse">
            <dt className="sr-only">{label}</dt>
            <dd className="m-0">
              <StatTile
                tone={GRADE_TONE[grade]}
                value={`${Math.round((summary.counts[grade] / summary.total) * 100)}%`}
                label={label}
                className={cn("[&>div:first-child]:text-lg", className)}
              />
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/** Queue and grading diagnostics, secondary to the per-collection cards. */
export function MasteryPracticeActivity({
  stats,
  today,
}: {
  stats: WebStatsSnapshot;
  today: GoalDayCounts;
}) {
  if (stats.activeCollections.length === 0) return null;

  return (
    <section role="group" aria-label="Practice activity">
      <h3 className={SECTION_TITLE}>Practice activity</h3>
      <RollupRow label="Read" verb="read" unseen={stats.rollup.read.unseen} today={today.read} />
      <RollupRow
        label="Review"
        verb="reviewed"
        unseen={stats.rollup.review.unseen}
        today={today.review}
      />
      <RollupRow label="Quiz" verb="quizzed" unseen={stats.rollup.quiz.unseen} today={today.quiz} />
      {stats.gradeDistribution ? <GradeDistribution summary={stats.gradeDistribution} /> : null}
    </section>
  );
}
