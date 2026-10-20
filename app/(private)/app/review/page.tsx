import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RememberCollectionFromLink } from "@/components/collections/remember-collection";
import { ReviewPage } from "@/components/review/review-page";
import {
  parseReviewCollectionCookie,
  REVIEW_COLLECTION_COOKIE,
} from "@/lib/review/collection-preference";
import { getSessionUser } from "@/lib/auth/require-session";
import { DEFAULT_REVIEW_OPTIONS, getReviewOptions } from "@/lib/review/options";
import { loadReviewFeed, loadReviewSetup } from "@/lib/review/feed";
import {
  CURRENT_COLLECTION_COOKIE,
  parseCurrentCollectionId,
  resolveAppCollection,
  speculativeAppCollection,
} from "@/lib/collections/current";
import { hasNoCollections } from "@/lib/study/collections";
import { withReveal } from "@/components/shared/view-transitions";

type PageProps = {
  searchParams: Promise<{ collection?: string }>;
};

/** Every study screen works on one collection, so a mixed `all` link follows the current one. */
function singleCollectionParam(param: string | undefined): string | undefined {
  return param === "all" ? undefined : param;
}

function LoginPrompt({ message }: { message: string }) {
  return <p className="text-sm text-base-content/70">{message}</p>;
}

async function loadReviewOptions() {
  const { supabase, user } = await getSessionUser();
  if (!user) return DEFAULT_REVIEW_OPTIONS;
  return getReviewOptions(supabase, user.id).catch(() => DEFAULT_REVIEW_OPTIONS);
}

async function ReviewRoute({ searchParams }: PageProps) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const rememberedId = parseReviewCollectionCookie(
    cookieStore.get(REVIEW_COLLECTION_COOKIE)?.value,
  );
  const currentId = parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value);
  const collectionParam = singleCollectionParam(params.collection);
  const speculativeCollectionId = speculativeAppCollection(
    collectionParam,
    currentId,
    rememberedId,
  );

  const [setup, speculativeSeed, options] = await Promise.all([
    loadReviewSetup(),
    loadReviewFeed(speculativeCollectionId, []),
    loadReviewOptions(),
  ]);

  if ("error" in setup) {
    return <LoginPrompt message={setup.error ?? "Log in to review terms."} />;
  }
  if (hasNoCollections({ active: setup.collections, paused: setup.paused }))
    redirect("/app/library");

  const collectionId = resolveAppCollection({
    collectionParam,
    currentId,
    rememberedId,
    activeIds: setup.collections.map((collection) => collection.id),
  });
  const seed =
    collectionId === speculativeCollectionId
      ? speculativeSeed
      : await loadReviewFeed(collectionId, []);

  if (seed.error === "Log in to continue.") {
    return <LoginPrompt message={seed.error} />;
  }

  return (
    <>
      <ReviewPage
        // A new collection or active set remounts the page so the queue
        // rebuilds from the fresh seed.
        key={`${collectionId}:${setup.collections.map((collection) => collection.id).join(",")}`}
        seed={seed}
        collections={setup.collections}
        paused={setup.paused}
        collectionId={collectionId}
        narrationAccess={setup.narrationAccess}
        initialOptions={options}
      />
      {collectionParam && collectionParam === collectionId ? (
        <RememberCollectionFromLink collectionId={collectionId} />
      ) : null}
    </>
  );
}

export default withReveal(ReviewRoute);
