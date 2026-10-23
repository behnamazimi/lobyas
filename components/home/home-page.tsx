import { SwitchingFallback } from "@/components/app/shell/switching-fallback";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";
import { EmptyPanel, Pill } from "@/components/kit";
import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { getSessionUser } from "@/lib/auth/require-session";
import { CURRENT_COLLECTION_COOKIE, parseCurrentCollectionId } from "@/lib/collections/current";
import { EMPTY_GOAL_DAY, loadGoalDay } from "@/lib/goals/settings";
import { loadLibraryCollections } from "@/lib/library/load";
import { HomeBareHeader } from "./home-header";
import { HomeSkeleton } from "./home-skeleton";
import { HomeStudy } from "./home-study";
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

  const [library, cookieStore] = await Promise.all([
    loadLibraryCollections(supabase, user.id).catch(() => null),
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
  const day = await loadGoalDay(supabase, picked.id).catch(() => EMPTY_GOAL_DAY);

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
  return (
    <HomeStudy
      goals={day.goals}
      counts={day.counts}
      celebrated={day.celebrated}
      collection={collection}
    />
  );
}

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-base-200">
      <div className={FRAME}>
        <SwitchingFallback fallback={<HomeSkeleton />}>
          <Suspense fallback={<HomeSkeleton />}>
            <HomeContent />
          </Suspense>
        </SwitchingFallback>
      </div>
    </div>
  );
}
