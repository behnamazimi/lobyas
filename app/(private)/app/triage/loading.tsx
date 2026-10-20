import { Skeleton } from "@/components/kit";

export default function TriageLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3" aria-busy="true" aria-label="Loading">
      <div className="flex h-11 items-center justify-between">
        <Skeleton className="h-[30px] w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton shape="block" className="min-h-0 flex-1 rounded-[28px]" />
      <Skeleton className="h-[60px]" />
    </div>
  );
}
