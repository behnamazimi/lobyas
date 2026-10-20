import { Skeleton } from "@/components/kit";

/** Title row, collection card, search and term rows while a collection loads. */
export default function LibraryLoading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading collection">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-11 w-32" />
      </div>
      <Skeleton shape="block" className="h-48" />
      <Skeleton className="h-12 rounded-2xl" />
      <div className="flex flex-col gap-px overflow-hidden rounded-3xl">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} shape="block" className="h-[68px] rounded-none" />
        ))}
      </div>
    </div>
  );
}
