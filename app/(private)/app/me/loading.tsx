import { Skeleton } from "@/components/kit";

export default function MeLoading() {
  return (
    <div className="flex flex-1 flex-col bg-base-200">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3 px-5 py-4 lg:py-9">
        <Skeleton className="h-9 w-16" />
        <Skeleton shape="block" className="h-36" />
        <Skeleton shape="block" className="h-48" />
      </div>
    </div>
  );
}
