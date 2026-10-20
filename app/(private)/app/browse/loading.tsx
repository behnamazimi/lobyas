import { Skeleton } from "@/components/kit";

export default function BrowseLoading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading collections">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full rounded-full" />
      <Skeleton shape="block" className="h-36" />
      <Skeleton shape="block" className="h-36" />
      <Skeleton shape="block" className="h-36" />
    </div>
  );
}
