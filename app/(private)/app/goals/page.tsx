import { getGoalsPageData } from "@/app/(private)/app/goals/actions";
import { EmptyPanel, Pill } from "@/components/kit";
import { RemindersCard } from "@/components/goals/reminders-card";
import { GoalsPage } from "@/components/goals/goals-page";
import { PageCenter } from "@/components/page-container";
import { withReveal } from "@/components/shared/view-transitions";

async function GoalsRoute() {
  const data = await getGoalsPageData();

  if ("error" in data) {
    return (
      <PageCenter>
        <p className="text-sm text-base-content/70">{data.error}</p>
      </PageCenter>
    );
  }

  if (!data.collection) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        <EmptyPanel
          title="Pick a collection first"
          description="Goals are set per collection. Add one, or turn a paused collection back on in your Library."
          actions={<Pill href="/app/library">Open Library</Pill>}
        />
        <RemindersCard initial={data.settings.reminders} />
      </div>
    );
  }

  return (
    <GoalsPage
      key={data.collection.id}
      collection={data.collection}
      settings={data.settings}
      day={data.day}
    />
  );
}

export default withReveal(GoalsRoute);
