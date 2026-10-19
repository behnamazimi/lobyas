import { Skeleton } from "@/components/kit";

export default function ReviewLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3" aria-busy="true" aria-label="Loading">
      <div className="flex h-11 items-center justify-between">
        <Skeleton className="h-[30px] w-24" />
        <Skeleton shape="circle" className="size-9" />
      </div>
      <Skeleton shape="block" className="min-h-0 flex-1 rounded-[28px]" />
      <Skeleton className="h-[60px]" />
    </div>
  );
}
