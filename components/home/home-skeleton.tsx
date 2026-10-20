import { Skeleton } from "@/components/kit";
import { cn } from "@/lib/utils";

/** Holds Home's place while its numbers load. */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading your day">
      <Skeleton className="h-3.5 w-16" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-11 w-[74px]" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="mt-4 flex flex-col gap-10">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn("flex items-center gap-6", index === 1 && "flex-row-reverse")}
          >
            <Skeleton shape="circle" className="size-[100px] shrink-0" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[18px] w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
