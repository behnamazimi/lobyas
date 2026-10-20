import { PanelSkeleton } from "@/components/page-skeleton";

/** The title is in the layout; this is the three panels the page streams in. */
export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      <PanelSkeleton />
      <PanelSkeleton />
      <PanelSkeleton />
    </div>
  );
}
