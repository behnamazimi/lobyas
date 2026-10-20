import { Skeleton } from "@/components/kit";

export default function ReadLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3" aria-busy="true" aria-label="Loading term">
      <Skeleton shape="block" className="min-h-0 flex-1 rounded-[28px]" />
      <Skeleton className="h-[60px]" />
    </div>
  );
}
