import { Skeleton } from "@/components/kit";

export default function QuizLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-[30px] w-24" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton shape="block" className="h-40 rounded-[24px]" />
      <Skeleton shape="block" className="h-28 rounded-[24px]" />
    </div>
  );
}
