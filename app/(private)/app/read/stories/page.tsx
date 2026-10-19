import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { RememberCollectionFromLink } from "@/components/collections/remember-collection";
import { CURRENT_COLLECTION_COOKIE, parseCurrentCollectionId } from "@/lib/collections/current";
import { getSessionUser } from "@/lib/auth/require-session";
import { getReadOptions } from "@/lib/read/options";
import { getStoriesSetupData } from "@/lib/stories/setup";
import { hasNoCollections } from "@/lib/study/collections";
import { PromoVisit } from "@/components/promos/promo-visit";
import { ReadLandingSync } from "@/components/read/read-landing-sync";
import { StoriesPage } from "@/components/read/stories/stories-page";
import { withReveal } from "@/components/shared/view-transitions";

type PageProps = {
  searchParams: Promise<{ collection?: string; story?: string }>;
};

/** Already loaded by the Read layout in this request, so this costs nothing. */
async function loadStoriesDefault(): Promise<boolean | null> {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;
  const options = await getReadOptions(supabase, user.id).catch(() => null);
  return options?.storiesDefault ?? null;
}

async function ReadStoriesRoute({ searchParams }: PageProps) {
  const [{ collection: collectionId, story }, cookieStore] = await Promise.all([
    searchParams,
    cookies(),
  ]);
  const storyId = z.uuid().safeParse(story).success ? story : undefined;
  const currentId = parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value);
  const [setup, storiesDefault] = await Promise.all([
    getStoriesSetupData(collectionId, storyId, currentId),
    loadStoriesDefault(),
  ]);
  if ("error" in setup) {
    return <p className="text-sm text-base-content/70">{setup.error}</p>;
  }

  // A story already in progress still opens; only a user with nothing to
  // read from goes to the Library.
  if (
    !setup.currentStory &&
    hasNoCollections({ active: setup.collections, paused: setup.paused })
  ) {
    redirect("/app/library");
  }

  return (
    <>
      <PromoVisit target="stories" />
      {storiesDefault === null ? null : <ReadLandingSync storiesDefault={storiesDefault} />}
      <StoriesPage
        key={`${setup.collections.map((collection) => collection.id).join(",")}:${storyId ?? ""}`}
        setup={setup}
      />
      {collectionId && collectionId === setup.initialCollectionId ? (
        <RememberCollectionFromLink collectionId={collectionId} />
      ) : null}
    </>
  );
}

export default withReveal(ReadStoriesRoute);
