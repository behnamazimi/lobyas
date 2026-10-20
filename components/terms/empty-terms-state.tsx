import { EmptyPanel, Pill } from "@/components/kit";
import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";

export function EmptyTermsState({ collectionId }: { collectionId: string }) {
  return (
    <EmptyPanel
      className="py-8"
      illustration={<EmptyBoxScene />}
      title="No terms yet"
      description="Add your first term, or paste a list."
      actions={
        <>
          <Pill href={`/app/capture?to=${collectionId}`}>Add a term</Pill>
          <Pill href="/app/import" variant="secondary">
            Import terms
          </Pill>
        </>
      }
    />
  );
}
