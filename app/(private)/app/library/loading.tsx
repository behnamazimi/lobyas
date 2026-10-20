import { Skeleton } from "@/components/kit";

/** Title row, collection row, collection card, search and term rows, and the desktop term panel. */
export default function LibraryLoading() {
  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8"
      aria-busy="true"
      aria-label="Loading collection"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-2.5">
          <Skeleton className="h-[33px] w-32" />
          <Skeleton className="h-11 w-32" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 rounded-2xl lg:hidden" />
          <Skeleton shape="block" className="h-[300px]" />
          <Skeleton className="h-12 rounded-2xl" />
          <div className="flex flex-col gap-px overflow-hidden rounded-3xl">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} shape="block" className="h-[68px] rounded-none" />
            ))}
          </div>
        </div>
      </div>
      <Skeleton shape="block" className="hidden h-[420px] w-[420px] shrink-0 lg:block" />
    </div>
  );
}
