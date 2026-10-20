import { getImportSetupData } from "@/app/(private)/app/import/actions";
import { DefinitionsForm } from "@/components/requests/definitions-form";
import { RequestForm, type RecentRequest } from "@/components/requests/request-form";
import { Banner, PageHeader, PinnedAction, Pill } from "@/components/kit";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSessionUser } from "@/lib/auth/require-session";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { blockedMessage, entryFor } from "@/lib/requests/entry";
import { fetchMyRequests, fetchRequestQuota } from "@/lib/requests/repository";
import { statusSentence } from "@/lib/requests/status";
import { getStudyPhoneUserSettings } from "@/lib/streak/settings";
import { withDirection } from "@/components/shared/view-transitions";

type Client = SupabaseClient<Database>;

type PageProps = {
  searchParams: Promise<{ topic?: string; definitions?: string }>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The collection and the words waiting for a definition, read as the person who owns it. */
async function loadDefinitions(supabase: Client, userId: string, collectionId: string | undefined) {
  if (!collectionId || !UUID.test(collectionId)) return null;
  const [{ data: collection }, { data: words }] = await Promise.all([
    supabase.from("collections").select("name, owner_id").eq("id", collectionId).maybeSingle(),
    supabase
      .from("terms")
      .select("term")
      .eq("collection_id", collectionId)
      .is("definition", null)
      .order("term")
      .limit(500),
  ]);
  if (!collection || collection.owner_id !== userId) return null;
  return { name: collection.name, words: (words ?? []).map((row) => row.term) };
}

async function RequestPage({ searchParams }: PageProps) {
  const { topic = "", definitions: definitionsId } = await searchParams;
  const { supabase, user } = await getSessionUser();
  if (!user)
    return <p className="text-sm font-semibold text-muted">{REQUEST_COPY.form.signedOut}</p>;

  const header = (
    <PageHeader
      title={REQUEST_COPY.form.title}
      subline={REQUEST_COPY.form.intro}
      backHref="/app/import"
    />
  );

  try {
    const { timezone } = await getStudyPhoneUserSettings(user.id);
    const [quota, requests, setup] = await Promise.all([
      fetchRequestQuota(supabase),
      fetchMyRequests(supabase, timezone),
      getImportSetupData(),
    ]);
    const entry = entryFor(quota, timezone);
    const blocked = blockedMessage(entry);

    if (entry.state !== "available" || blocked) {
      return (
        <>
          {header}
          <Banner tone="hard">{blocked}</Banner>
          <PinnedAction className="flex flex-col gap-2">
            <Pill size="lg" href="/app/import">
              {REQUEST_COPY.form.seeRequests}
            </Pill>
            <Pill variant="ghost" href="/app/browse">
              {REQUEST_COPY.card.browse}
            </Pill>
          </PinnedAction>
        </>
      );
    }

    const recent: RecentRequest[] = requests.map((request) => ({
      key: request.topic.trim().toLowerCase(),
      topic: request.topic,
      createdDate: request.createdDate,
      sentence: statusSentence(request),
      collectionId: request.displayStatus === "ready" ? request.deliveredCollectionId : null,
    }));
    const found = await loadDefinitions(supabase, user.id, definitionsId);
    if (definitionsId && (!found || found.words.length === 0)) {
      return (
        <>
          {header}
          <p className="text-sm font-semibold text-muted">
            {found ? REQUEST_COPY.definitions.nothingToDefine : REQUEST_COPY.definitions.notYours}
          </p>
        </>
      );
    }
    if (definitionsId && found) {
      return (
        <>
          {header}
          <DefinitionsForm
            collectionId={definitionsId}
            name={found.name}
            words={found.words}
            count={found.words.length}
            estimateDays={entry.estimateDays}
            paused={entry.paused}
            used={entry.used}
          />
        </>
      );
    }
    const ownedNames = "error" in setup ? [] : setup.collections.map((c) => c.name);

    return (
      <>
        {header}
        <RequestForm
          initialTopic={topic.slice(0, 120)}
          estimateDays={entry.estimateDays}
          paused={entry.paused}
          used={entry.used}
          recent={recent}
          ownedNames={ownedNames}
        />
      </>
    );
  } catch (error) {
    console.error("Couldn't load the request form:", error);
    return (
      <>
        {header}
        <p className="text-sm font-semibold text-muted">{REQUEST_COPY.form.sendFailed}</p>
      </>
    );
  }
}

export default withDirection(RequestPage);
