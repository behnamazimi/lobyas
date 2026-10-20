import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";
import { EmptyPanel, Pill, SECTION_TITLE } from "@/components/kit";
import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { getSessionUser } from "@/lib/auth/require-session";
import { CURRENT_COLLECTION_COOKIE, parseCurrentCollectionId } from "@/lib/collections/current";
import { EMPTY_GOAL_DAY, getRequestGoalSettings, loadGoalDay } from "@/lib/goals/settings";
import { buildHomePath } from "@/lib/home/path";
import { loadLibraryCollections } from "@/lib/library/load";
import { HomeBareHeader, HomeHeader } from "./home-header";
import { HomePath } from "./home-path";
import { HomeSide } from "./home-side";
import { HomeSkeleton } from "./home-skeleton";
import { GoalPrompt } from "./goal-prompt";
import type { ShellCollection } from "@/components/app/shell/shell-context";

const FRAME =
  "mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 py-5 lg:max-w-[1120px] lg:px-10 lg:py-9";

function Bare({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <HomeBareHeader />
      {children}
    </div>
  );
}

function NoCollection() {
  return (
    <Bare>
      <EmptyPanel
        className="my-auto"
        illustration={<EmptyBoxScene />}
        title="Pick a collection to study"
        description="Add one, or turn a paused collection back on in your Library."
        actions={
          <>
            <Pill href="/app/import">Add a collection</Pill>
            <Pill href="/app/library" variant="secondary">
              Open Library
            </Pill>
          </>
        }
      />
    </Bare>
  );
}

async function HomeContent() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect("/login");

  const [library, settings, day, cookieStore] = await Promise.all([
    loadLibraryCollections(supabase, user.id).catch(() => null),
    getRequestGoalSettings(user.id).catch(() => ({
      goals: null,
      celebrate: true,
    })),
    loadGoalDay(supabase).catch(() => EMPTY_GOAL_DAY),
    cookies(),
  ]);

  if (!library) {
    return (
      <Bare>
        <EmptyPanel
          className="my-auto"
          title="Home couldn’t load"
          description="Your collections didn’t come through. Try again in a moment."
          actions={<Pill href="/app">Try again</Pill>}
        />
      </Bare>
    );
  }

  const active = library.collections.filter((collection) => collection.isActiveForReview);
  const currentId = parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value);
  const picked = active.find((collection) => collection.id === currentId) ?? active[0];
  if (!picked) return <NoCollection />;

  const collection: ShellCollection = {
    id: picked.id,
    name: picked.name,
    kind: picked.kind,
    termCount: picked.termCount,
    termsLearnedCount: picked.termsLearnedCount,
    queues: picked.queues,
    description: picked.description.slice(0, 200) || null,
    language: picked.language,
    isActiveForReview: true,
  };
  const path = buildHomePath({
    goals: settings.goals,
    counts: day.counts,
    celebrated: day.celebrated,
    queues: picked.queues,
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

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-base-200">
      <div className={FRAME}>
        <Suspense fallback={<HomeSkeleton />}>
          <HomeContent />
        </Suspense>
      </div>
    </div>
  );
}
