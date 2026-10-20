"use client";

import { Card, SECTION_TITLE } from "@/components/kit";
import type { GoalForecast } from "@/lib/goals/forecast";
import { FORECAST_SHORT_DAYS } from "@/lib/trace";
import { cn, pluralize } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayLabel(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** When a collection is done. The later end of the range, so it's a date
 *  the learner can count on rather than a best case. */
function finishLabel(lowDays: number | null, highDays: number | null): string {
  if (lowDays === 0 && highDays === 0) return "Done";
  if (lowDays === null) return "Over a year";
  if (highDays === null) return `${dayLabel(lowDays)} or later`;
  return `By ${dayLabel(highDays)}`;
}

function message(forecast: GoalForecast): string | null {
  switch (forecast.kind) {
    case "noGoals":
      return "Set a goal to see a forecast.";
    case "noCollections":
      return "Add a collection to see when you'd master it.";
    case "needsReviewAndQuiz": {
      const missing = forecast.missing.map((tier) => (tier === "review" ? "Review" : "Quiz"));
      return `Mastered takes both Review and Quiz. Turn on ${missing.join(" and ")} to see when you'll get there.`;
    }
    case "forecast":
      return null;
  }
}

export function ForecastPanel({
  forecast,
  isLoading,
  error,
}: {
  forecast: GoalForecast | null;
  isLoading: boolean;
  error: string | null;
}) {
  const note = forecast ? message(forecast) : null;

  return (
    <Card radius="md" className="p-4">
      <section aria-labelledby="goals-forecast-heading" aria-busy={isLoading}>
        <h2 id="goals-forecast-heading" className={SECTION_TITLE}>
          Where these goals take you
        </h2>
        <p className="mt-1 mb-1 text-[13px] leading-snug font-semibold text-muted">
          If you keep this pace every day, roughly when each collection is fully mastered.
        </p>

        {error && !isLoading ? (
          <p className="m-0 mt-2 text-sm text-wrong-text">{error}</p>
        ) : forecast === null ? (
          <ForecastSkeleton />
        ) : note ? (
          <p className="m-0 mt-2 text-sm font-semibold text-muted">{note}</p>
        ) : forecast.kind === "forecast" ? (
          <div className={cn("transition-opacity", isLoading && "opacity-60")}>
            <ul className="m-0 list-none p-0">
              {forecast.collections.map((collection) => (
                <li
                  key={collection.id}
                  className="flex items-center gap-2.5 border-b border-base-300 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[15px] font-extrabold">{collection.name}</p>
                    <p className="m-0 text-[13px] font-semibold text-muted tabular-nums">
                      {collection.remaining === 0
                        ? "Every term mastered"
                        : `${pluralize(collection.remaining, "term")} to go`}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold tabular-nums">
                    {finishLabel(collection.lowDays, collection.highDays)}
                  </span>
                </li>
              ))}
            </ul>
            <SummaryLine forecast={forecast} />
            <p className="m-0 mt-2.5 text-xs leading-snug font-semibold text-muted">
              An estimate from your goals and how your answers usually go. It updates as you change
              your goals.
            </p>
          </div>
        ) : null}
      </section>
    </Card>
  );
}

/** How many terms the next month brings, when that's less than all of them. */
function SummaryLine({ forecast }: { forecast: Extract<GoalForecast, { kind: "forecast" }> }) {
  const { masteredSoon, remaining } = forecast;
  if (remaining === 0 || masteredSoon >= remaining) return null;

  return (
    <p className="m-0 mt-2.5 text-sm font-semibold text-muted">
      In the next {FORECAST_SHORT_DAYS} days, about{" "}
      <span className="font-extrabold text-base-content tabular-nums">
        {pluralize(masteredSoon, "term")}
      </span>{" "}
      reach Mastered.
    </p>
  );
}

function ForecastSkeleton() {
  return (
    <div className="mt-2 space-y-2" aria-hidden>
      <div className="h-10 animate-pulse rounded-2xl bg-base-200" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-base-200" />
    </div>
  );
}
