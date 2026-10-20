import { Skeleton } from "@/components/kit";

/** The title is in the layout; this is the tabs, the summary and a card per collection. */
export default function MasteryLoading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-11 rounded-full" />
      <Skeleton shape="block" className="h-[320px]" />
      <Skeleton shape="block" className="h-[130px]" />
      <Skeleton shape="block" className="h-[130px]" />
    </div>
  );
}
