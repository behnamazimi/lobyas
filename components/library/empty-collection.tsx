import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { EmptyPanel, Pill } from "@/components/kit";
import { StartCollectionButton } from "@/components/library/start-collection-button";

export function EmptyCollection() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center">
      <EmptyPanel
        titleAs="h1"
        illustration={<EmptyBoxScene />}
        title="Your library is empty"
        description="Add a built-in or community collection in one tap, or start your own."
        actions={
          <>
            <Pill href="/app/browse" data-tour="library-browse">
              Browse collections
            </Pill>
            <Pill href="/app/import" variant="secondary" data-tour="library-import">
              Add your own terms
            </Pill>
            <StartCollectionButton />
          </>
        }
      />
    </div>
  );
}
