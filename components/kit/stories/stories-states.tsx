import { EmptyBoxScene } from "@/components/illustrations/scenes/empty-box";
import { NotFoundScene } from "@/components/illustrations/scenes/not-found";
import { EmptyPanel, Pill, Skeleton, StatusScreen } from "@/components/kit";
import { Story } from "./story";

export function StateStories() {
  return (
    <>
      <Story
        title="Empty state"
        note="A lobya scene appears only in empty, first-time and status states."
      >
        <EmptyPanel
          illustration={<EmptyBoxScene />}
          title="Nothing here yet"
          description="Add your first terms to start studying this collection."
          actions={<Pill>Add terms</Pill>}
        />
      </Story>
      <Story title="Status screen">
        <StatusScreen
          illustration={<NotFoundScene />}
          title="We couldn’t find that page"
          description="The link may be old, or the page was moved."
          actions={<Pill href="/admin/kit">Go home</Pill>}
        />
      </Story>
      <Story title="Skeleton" note="A path stop and two list rows while Home loads.">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton shape="circle" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="w-24" />
              <Skeleton className="w-40" />
            </div>
          </div>
          <Skeleton shape="block" />
        </div>
      </Story>
    </>
  );
}
