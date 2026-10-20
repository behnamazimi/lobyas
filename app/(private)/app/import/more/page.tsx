import { Braces } from "lucide-react";
import { CopyIconButton } from "@/components/import/copy-icon-button";
import { ImportCodePanel, ImportCard } from "@/components/import/import-ui";
import { ImportLlmPrompt } from "@/components/import/import-llm-prompt";
import { PageHeader, SECTION_TITLE } from "@/components/kit";
import { requireAuthenticatedClient } from "@/lib/auth/require-session";
import { listImportDestinations } from "@/lib/import/import-collections";
import { IMPORT_SAMPLE_PAYLOAD, stringifyImportPayload } from "@/lib/import/sample-payload";
import { withDirection } from "@/components/shared/view-transitions";

async function MoreImportOptionsPage() {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) {
    return <p className="text-sm font-semibold text-muted">Log in to add terms.</p>;
  }
  // The page is mostly documentation, so it still opens if the list can't load.
  const collections = await listImportDestinations(auth.supabase, auth.user.id)
    .then((result) => result.collections)
    .catch(() => []);

  const sampleJson = stringifyImportPayload(IMPORT_SAMPLE_PAYLOAD);

  return (
    <>
      <PageHeader title="More ways to add" backHref="/app/import" />
      <ImportCard
        icon={<Braces className="size-5" aria-hidden strokeWidth={2.4} />}
        title="Choose a JSON file"
        description="JSON works in the same place as any list. Paste it or choose the file there. Term is the only required field. Definition, category, example, mental model, in practice, anti-example, debated, note and links to other terms are optional."
      >
        <h3 className={SECTION_TITLE}>The JSON format</h3>
        <ImportCodePanel actions={<CopyIconButton value={sampleJson} label="Copy JSON" />}>
          {sampleJson}
        </ImportCodePanel>
      </ImportCard>
      <ImportLlmPrompt collections={collections} />
    </>
  );
}

export default withDirection(MoreImportOptionsPage);
