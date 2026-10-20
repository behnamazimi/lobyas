import { Skeleton } from "@/components/kit";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton shape="block" />
      <Skeleton shape="block" />
    </div>
  );
}
