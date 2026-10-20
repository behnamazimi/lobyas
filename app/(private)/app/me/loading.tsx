import { Skeleton } from "@/components/kit";

/** The page's title is in the layout; this is the cards under it. */
export default function MeLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <Skeleton shape="block" className="h-[92px]" />
      <Skeleton shape="block" className="h-[184px]" />
      <Skeleton shape="block" className="h-[240px]" />
      <Skeleton shape="block" className="h-16" />
      <div className="flex items-center justify-center gap-5 px-2">
        {["w-14", "w-16", "w-24"].map((width) => (
          <div key={width} className="flex min-h-11 items-center">
            <Skeleton className={`h-3.5 ${width}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
