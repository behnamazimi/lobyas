import { Skeleton } from "@/components/kit";

export default function SharedCollectionLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-[640px] flex-col gap-3 px-5 py-8"
      aria-busy="true"
      aria-label="Loading collection"
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-64" />
      <Skeleton shape="block" className="h-28" />
      <Skeleton shape="block" className="h-28" />
      <Skeleton shape="block" className="h-28" />
    </div>
  );
}
