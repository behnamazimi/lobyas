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

export const maxDuration = 60;

type PageProps = {
  searchParams: Promise<{ collection?: string }>;
};

async function QuizRoute({ searchParams }: PageProps) {
  const [params, setup, cookieStore] = await Promise.all([
    searchParams,
    getQuizSetupData(),
    cookies(),
  ]);

  if ("error" in setup) {
    return <p className="text-sm text-base-content/70">{setup.error}</p>;
  }
  if (hasNoCollections({ active: setup.collections, paused: setup.paused }))
    redirect("/app/library");

  const activeIds = setup.collections.map((collection) => collection.id);
  const initialSetup = resolveInitialQuizSetup({
    saved: parseQuizSetupCookie(cookieStore.get(QUIZ_SETUP_COOKIE)?.value),
    collectionParam: params.collection,
    currentId: parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value),
    activeIds,
    aiAvailable: aiAvailable(setup.ai),
  });

  return (
    <>
      <QuizPage
        // Resuming a paused collection refreshes the page; a new active set
        // remounts it so the setup picks up the new collections.
        key={activeIds.join(",")}
        ai={setup.ai}
        collections={setup.collections}
        paused={setup.paused}
        initialSetup={initialSetup}
      />
      {params.collection &&
      params.collection === initialSetup.collectionId &&
      initialSetup.collectionId !== "all" ? (
        <RememberCollectionFromLink collectionId={initialSetup.collectionId} />
      ) : null}
    </>
  );
}

export default withReveal(QuizRoute);
