import { getImportSetupData } from "@/app/(private)/app/import/actions";
import { ImportFlow } from "@/components/import/import-flow";
import { withDirection } from "@/components/shared/view-transitions";

type PageProps = {
  searchParams: Promise<{ to?: string; from?: string }>;
};

async function PasteListPage({ searchParams }: PageProps) {
  const { to, from } = await searchParams;
  const setup = await getImportSetupData();

  if ("error" in setup) {
    return <p className="text-sm font-semibold text-muted">{setup.error}</p>;
  }

  const preset = setup.collections.some((collection) => collection.id === to) ? to : undefined;

  return (
    <>
      <ImportFlow
        collections={setup.collections}
        addedNames={setup.addedNames}
        presetCollectionId={preset}
        entry={preset ? "collection" : "chooser"}
        autoCheck={from === "term"}
        backHref={preset ? `/app/library?collection=${preset}` : "/app/import"}
      />
    </>
  );
}

export default withDirection(PasteListPage);
