import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RememberCollectionFromLink } from "@/components/collections/remember-collection";
import { QuizPage } from "@/components/quiz/quiz-page";
import { CURRENT_COLLECTION_COOKIE, parseCurrentCollectionId } from "@/lib/collections/current";
import { getQuizSetupData } from "@/app/(private)/app/quiz/actions";
import {
  parseQuizSetupCookie,
  QUIZ_SETUP_COOKIE,
  resolveInitialQuizSetup,
} from "@/lib/quiz/setup-preference";
import { aiAvailable } from "@/lib/llm/types";
import { hasNoCollections } from "@/lib/study/collections";
import { withReveal } from "@/components/shared/view-transitions";

type PageProps = {
  searchParams: Promise<{ collection?: string }>;
};

/** Every study screen works on one collection, so a mixed `all` link follows the current one. */
function singleCollectionParam(param: string | undefined): string | undefined {
  return param === "all" ? undefined : param;
}

async function QuizRoute({ searchParams }: PageProps) {
  const [params, setup, cookieStore] = await Promise.all([
    searchParams,
    getQuizSetupData(),
    cookies(),
  ]);
  const collectionParam = singleCollectionParam(params.collection);

  if ("error" in setup) {
    return <p className="text-sm text-base-content/70">{setup.error}</p>;
  }
  if (hasNoCollections({ active: setup.collections, paused: setup.paused }))
    redirect("/app/library");

  const activeIds = setup.collections.map((collection) => collection.id);
  const initialSetup = resolveInitialQuizSetup({
    saved: parseQuizSetupCookie(cookieStore.get(QUIZ_SETUP_COOKIE)?.value),
    collectionParam,
    currentId: parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value),
    activeIds,
    aiAvailable: aiAvailable(setup.ai),
  });

  return (
    <>
      <QuizPage
        // A new collection or active set remounts the page so the setup picks
        // it up; a quiz in progress stays in storage and offers Resume.
        key={`${initialSetup.collectionId}:${activeIds.join(",")}`}
        ai={setup.ai}
        collections={setup.collections}
        paused={setup.paused}
        initialSetup={initialSetup}
      />
      {collectionParam && collectionParam === initialSetup.collectionId ? (
        <RememberCollectionFromLink collectionId={initialSetup.collectionId} />
      ) : null}
    </>
  );
}

export default withReveal(QuizRoute);
