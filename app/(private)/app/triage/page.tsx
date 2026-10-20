import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CURRENT_COLLECTION_COOKIE, parseCurrentCollectionId } from "@/lib/collections/current";
import { getLibrarySetupData } from "@/lib/library/setup";
import { TriagePage } from "@/components/triage/triage-page";
import { createClient } from "@/lib/supabase/server";
import { fetchNotYetTermIds } from "@/lib/triage/repository";
import { withReveal } from "@/components/shared/view-transitions";

type PageProps = {
  searchParams: Promise<{ collection?: string }>;
};

async function TriageRoute({ searchParams }: PageProps) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  // A link's collection wins; otherwise Triage follows the app's current collection.
  const selectedCollectionId =
    params.collection && params.collection !== "all"
      ? params.collection
      : (parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value) ?? undefined);
  const setup = await getLibrarySetupData(selectedCollectionId);

  if ("emptyCollection" in setup) redirect("/app/library");
  if ("error" in setup) {
    return <p className="text-sm text-base-content/70">{setup.error}</p>;
  }

  const { data, narrationAccess } = setup;
  const notYetTermIds = await fetchNotYetTermIds(await createClient(), data.collection.id);

  return (
    <TriagePage
      key={data.collection.id}
      collection={data.collection}
      terms={data.terms}
      knownTermIds={data.knownTermIds}
      markedKnownTermIds={data.markedKnownTermIds}
      notYetTermIds={notYetTermIds}
      narrationAccess={narrationAccess}
    />
  );
}

export default withReveal(TriageRoute);
