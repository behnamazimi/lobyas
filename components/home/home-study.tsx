"use client";

import { SECTION_TITLE } from "@/components/kit";
import { useLiveGoalCounts } from "@/components/goals/use-goal-count";
import type { ShellCollection } from "@/components/app/shell/shell-context";
import type { DailyGoals, GoalTier } from "@/lib/goals/levels";
import type { GoalDayCounts } from "@/lib/goals/progress";
import { buildHomePath } from "@/lib/home/path";
import { GoalPrompt } from "./goal-prompt";
import { HomeHeader } from "./home-header";
import { HomePath } from "./home-path";
import { HomeSide } from "./home-side";

export function HomeStudy({
  goals,
  counts,
  celebrated,
  collection,
}: {
  goals: DailyGoals | null;
  counts: GoalDayCounts;
  celebrated: readonly GoalTier[];
  collection: ShellCollection;
}) {
  const live = useLiveGoalCounts(collection.id, counts);
  const path = buildHomePath({
    goals,
    counts: live,
    celebrated,
    queues: collection.queues,
  });

  return (
    <div className="flex flex-col gap-6 lg:gap-7">
      <HomeHeader
        name={collection.name}
        mastered={collection.termsLearnedCount}
        total={collection.termCount}
        note={path.note}
        cta={path.cta}
        addTermsHref={`/app/import/paste?to=${collection.id}`}
      />
      <div className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start">
        <section aria-label="Today’s path" className="min-w-0 lg:flex-[999_1_560px]">
          <div className="mb-3 flex items-baseline justify-between lg:hidden">
            <h2 className={SECTION_TITLE}>Today</h2>
            <div className="text-[13px] font-bold text-muted">{path.note}</div>
          </div>
          <div className="lg:hidden">
            <HomePath data={path} prompt={<PhonePrompt />} />
          </div>
          <div className="hidden lg:block">
            <HomePath data={path} wide />
          </div>
        </section>
        <HomeSide data={path} collection={collection} />
      </div>
    </div>
  );
}

function PhonePrompt() {
  return <GoalPrompt className="absolute top-[426px] right-0 left-0" />;
}
