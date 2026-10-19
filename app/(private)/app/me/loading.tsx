import { Skeleton } from "@/components/kit";

export default function MeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-5 py-6">
      <Skeleton className="h-9 w-16" />
      <Skeleton shape="block" />
      <Skeleton shape="block" className="h-64" />
    </div>
  );
}
