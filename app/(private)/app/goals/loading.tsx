import { Skeleton } from "@/components/kit";

/** The title is in the layout; this is the three pace cards, the forecast and the save button. */
export default function GoalsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-3" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} shape="block" className="h-[140px]" />
      ))}
      <Skeleton shape="block" className="h-[190px]" />
      <Skeleton shape="block" className="h-[76px]" />
      <Skeleton className="mt-auto h-14" />
    </div>
  );
}
