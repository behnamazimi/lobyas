import { getImportSetupData } from "@/app/(private)/app/import/actions";
import { ImportChooser } from "@/components/import/import-chooser";
import { PageHeader } from "@/components/kit";
import { RequestsSection } from "@/components/requests/requests-section";
import { getSessionUser } from "@/lib/auth/require-session";
import { fetchMyRequests, loadRequestEntryFor } from "@/lib/requests/repository";
import { getStudyPhoneUserSettings } from "@/lib/streak/settings";
import { withDirection } from "@/components/shared/view-transitions";

async function loadRequests() {
  const { supabase, user } = await getSessionUser();
  if (!user) return { requests: [], requestEntry: { state: "closed" as const } };
  try {
    const { timezone } = await getStudyPhoneUserSettings(user.id);
    const [requests, requestEntry] = await Promise.all([
      fetchMyRequests(supabase, timezone),
      loadRequestEntryFor(supabase, user.id),
    ]);
    return { requests, requestEntry };
  } catch (error) {
    console.error("Couldn't load collection requests:", error);
    return { requests: [], requestEntry: { state: "closed" as const } };
  }
}

async function ImportPage() {
  const [setup, { requests, requestEntry }] = await Promise.all([
    getImportSetupData(),
    loadRequests(),
  ]);

  if ("error" in setup) {
    return <p className="text-sm font-semibold text-muted">{setup.error}</p>;
  }

  return (
    <>
      <PageHeader title="Add a collection" backHref="/app/library" />
      <RequestsSection requests={requests} />
      <ImportChooser collections={setup.collections} requestEntry={requestEntry} />
    </>
  );
}

export default withDirection(ImportPage);
