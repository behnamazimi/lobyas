import {
  getReadFeedBatchAction,
  getReadSetupData,
  getReadTermByIdAction,
  type ReadQueueSeed,
} from "@/app/(private)/app/read/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QuizPanel } from "@/components/quiz/quiz-ui";
import { ReadLandingSync } from "@/components/read/read-landing-sync";
import { ReadPage } from "@/components/read/read-page";
import { StudyNoActiveCollectionsState } from "@/components/read/study/study-paused-state";
import { getSessionUser } from "@/lib/auth/require-session";
import { DEFAULT_READ_OPTIONS, getReadOptions, type ReadOptions } from "@/lib/read/options";
import {
  parseReadCollectionCookie,
  READ_COLLECTION_COOKIE,
} from "@/lib/read/collection-preference";
import { RememberCollectionFromLink } from "@/components/collections/remember-collection";
import {
  parseCurrentCollectionId,
  resolveAppCollection,
  speculativeAppCollection,
  CURRENT_COLLECTION_COOKIE,
} from "@/lib/collections/current";
import { hasNoCollections } from "@/lib/study/collections";
import type { StudyCollection } from "@/lib/study/types";
import { withReveal } from "@/components/shared/view-transitions";

// Narration generation (ElevenLabs) can take longer than the platform's
// default Server Action timeout on a cache miss.
export const maxDuration = 60;

type PageProps = {
  searchParams: Promise<{
    termId?: string;
    alreadyRead?: string;
    collection?: string;
    view?: string;
    [key: string]: string | undefined;
  }>;
};

/** Falls back to the defaults, so a failure here never takes Cards down. */
async function loadReadOptions(): Promise<ReadOptions> {
  const { supabase, user } = await getSessionUser();
  if (!user) return DEFAULT_READ_OPTIONS;
  return getReadOptions(supabase, user.id).catch((err: unknown) => {
    console.error("Failed to load Read options:", err);
    return DEFAULT_READ_OPTIONS;
  });
}

function activeIdsOf(collections: StudyCollection[]): string[] {
  return collections.map((collection) => collection.id);
}

async function buildDeepLinkSeed(termId: string, alreadyRead: boolean): Promise<ReadQueueSeed> {
  const result = await getReadTermByIdAction(termId, alreadyRead);
  if (result.error) return { error: result.error, terms: [] };
  if (!result.term) return { caughtUp: true, terms: [] };
  return { terms: [result.term], revealedTermIds: result.revealed ? [result.term.id] : [] };
}

function activeCollectionsKey(collections: StudyCollection[]): string {
  return collections.map((collection) => collection.id).join(",");
}

function LoginPrompt() {
  return <p className="text-sm text-base-content/70">Log in to read terms.</p>;
}

function rememberFromLink(collectionParam: string | undefined, collectionId: string) {
  if (!collectionParam || collectionParam !== collectionId || collectionId === "all") return null;
  return <RememberCollectionFromLink collectionId={collectionId} />;
}

async function deepLinkRead(params: Awaited<PageProps["searchParams"]>, options: ReadOptions) {
  const setup = await getReadSetupData();
  if ("error" in setup) return <LoginPrompt />;

  const currentId = parseCurrentCollectionId(
    (await cookies()).get(CURRENT_COLLECTION_COOKIE)?.value,
  );
  const collectionId = resolveAppCollection({
    collectionParam: params.collection,
    currentId,
    rememberedId: null,
    activeIds: activeIdsOf(setup.collections),
  });
  const seed = await buildDeepLinkSeed(params.termId ?? "", params.alreadyRead === "true");
  if (seed.error === "Log in to continue.") return <LoginPrompt />;

  return (
    <>
      <ReadPage
        key={activeCollectionsKey(setup.collections)}
        seed={seed}
        collections={setup.collections}
        collectionId={collectionId}
        narrationAccess={setup.narrationAccess}
        options={options}
      />
      {rememberFromLink(params.collection, collectionId)}
    </>
  );
}

async function collectionRead(params: Awaited<PageProps["searchParams"]>, options: ReadOptions) {
  // The collection is already resolvable from the URL (or defaults to "all"),
  // so the feed batch starts next to setup. An unknown collection id yields
  // an empty pick, and that batch is discarded when the resolved collection
  // turns out different.
  const cookieStore = await cookies();
  const currentId = parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value);
  const rememberedId = parseReadCollectionCookie(cookieStore.get(READ_COLLECTION_COOKIE)?.value);
  const speculativeCollectionId = speculativeAppCollection(
    params.collection,
    currentId,
    rememberedId,
  );
  const [setup, speculativeSeed] = await Promise.all([
    getReadSetupData(),
    getReadFeedBatchAction(speculativeCollectionId, []),
  ]);
  if ("error" in setup) return <LoginPrompt />;
  if (hasNoCollections({ active: setup.collections, paused: setup.paused }))
    redirect("/app/library");
  if (setup.collections.length === 0) {
    return (
      <QuizPanel className="flex max-h-full min-h-0 w-full flex-col">
        <StudyNoActiveCollectionsState paused={setup.paused} activity="reading" />
      </QuizPanel>
    );
  }

  const collectionId = resolveAppCollection({
    collectionParam: params.collection,
    currentId,
    rememberedId,
    activeIds: activeIdsOf(setup.collections),
  });
  const seed =
    collectionId === speculativeCollectionId
      ? speculativeSeed
      : await getReadFeedBatchAction(collectionId, []);
  if (seed.error === "Log in to continue.") return <LoginPrompt />;

  return (
    <>
      <ReadLandingSync storiesDefault={options.storiesDefault} redirectToStories />
      <ReadPage
        key={activeCollectionsKey(setup.collections)}
        seed={seed}
        collections={setup.collections}
        collectionId={collectionId}
        narrationAccess={setup.narrationAccess}
        options={options}
      />
      {rememberFromLink(params.collection, collectionId)}
    </>
  );
}

async function ReadRoute({ searchParams }: PageProps) {
  const params = await searchParams;
  const options = await loadReadOptions();
  if (params.termId) return deepLinkRead(params, options);
  return collectionRead(params, options);
}

export default withReveal(ReadRoute);
