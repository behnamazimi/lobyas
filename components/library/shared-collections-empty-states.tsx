import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { EmptyPanel, Pill } from "@/components/kit";
import { RequestRow } from "@/components/requests/request-row";
import type { BrowseGroup } from "@/lib/library/browse";
import type { RequestEntry } from "@/lib/requests/entry";

export function SharedCollectionsEmptyCatalog({ bannerError }: { bannerError: string | null }) {
  return (
    <div className="flex flex-col gap-4">
      {bannerError ? (
        <p
          role="alert"
          className="m-0 rounded-2xl bg-wrong-tint px-3.5 py-3 text-sm font-bold text-wrong-text"
        >
          {bannerError}
        </p>
      ) : null}
      <EmptyPanel
        className="py-6"
        illustration={<EmptyBoxScene />}
        title="No collections yet"
        description="Collections show up here once they are built or shared. Add your own terms in the meantime, or head back to your library."
        actions={
          <>
            <Pill href="/app/import">Add your own terms</Pill>
            <Pill href="/app/library" variant="secondary">
              Back to library
            </Pill>
          </>
        }
      />
    </div>
  );
}

const GROUP_LABEL: Record<BrowseGroup, string> = {
  builtin: "built-in",
  community: "community",
};

export function SharedCollectionsEmptyGroup({
  group,
  requestEntry,
}: {
  group: BrowseGroup;
  requestEntry: RequestEntry;
}) {
  return (
    <div className="flex flex-col gap-3">
      <EmptyPanel
        className="py-6"
        illustration={<EmptyBoxScene />}
        title={`No ${GROUP_LABEL[group]} collections yet`}
        description={
          group === "builtin"
            ? "Collections we build will show up here."
            : "When a member shares a collection, it shows up here."
        }
      />
      <RequestRow entry={requestEntry} query="" />
    </div>
  );
}

export function SharedCollectionsNoMatches({
  group,
  allAdded,
  hasActiveFilters,
  onClearFilters,
  onRetry,
  requestEntry,
  search,
}: {
  group: BrowseGroup;
  allAdded: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onRetry: () => void;
  requestEntry: RequestEntry;
  search: string;
}) {
  if (allAdded) {
    return (
      <EmptyPanel
        className="py-6"
        illustration={<EmptyBoxScene />}
        title={`You've added every ${GROUP_LABEL[group]} collection`}
        description="Open your library to start studying them."
        actions={<Pill href="/app/library">Go to library</Pill>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <EmptyPanel
        className="py-6"
        title="No collections match"
        description={
          hasActiveFilters
            ? "Clear your search or try a different filter."
            : "Nothing to show right now."
        }
        actions={
          <Pill variant="secondary" onClick={hasActiveFilters ? onClearFilters : onRetry}>
            {hasActiveFilters ? "Clear filters" : "Try again"}
          </Pill>
        }
      />
      <RequestRow entry={requestEntry} query={search} />
    </div>
  );
}
