import { Skeleton } from "@/components/kit";
import { cn } from "@/lib/utils";
import { PHONE_PATH, WIDE_PATH, type PathGeometry } from "./path-geometry";

const percent = (geo: PathGeometry, x: number) => (x / geo.width) * 100;

/** The trail on `HomePath`'s own geometry, so nothing moves when Home loads. */
function PathSkeleton({ geo, wide }: { geo: PathGeometry; wide: boolean }) {
  const stops = geo.stops.map((stop) => ({
    ...stop,
    size: wide ? "size-[104px]" : "size-[100px]",
  }));
  const trophy = {
    cx: geo.trophy.cx,
    cy: geo.trophy.cy,
    side: "left" as const,
    size: wide ? "size-[104px]" : "size-20",
  };
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: geo.width, height: geo.height }}>
      {[...stops, trophy].map((point, index) => (
        <div key={index}>
          <Skeleton
            shape="circle"
            className={cn("absolute -translate-x-1/2 -translate-y-1/2", point.size)}
            style={{ left: `${percent(geo, point.cx)}%`, top: point.cy }}
          />
          <div
            className={cn(
              "absolute flex -translate-y-1/2 flex-col gap-2",
              point.side === "left" ? "items-end" : "items-start",
            )}
            style={{
              top: point.cy,
              ...(point.side === "right"
                ? { left: `calc(${percent(geo, point.cx)}% + ${geo.textOffset}px)` }
                : { right: `calc(${100 - percent(geo, point.cx)}% + ${geo.textOffset}px)` }),
            }}
          >
            <Skeleton className={cn("h-5", wide ? "w-28" : "w-24")} />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MasteryLineSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Skeleton className="h-2.5 w-24 lg:w-40" />
      <Skeleton className="h-3.5 w-28" />
    </div>
  );
}

/** Holds Home's place while its numbers load: the same header, trail and desktop cards. */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:gap-7" aria-busy="true" aria-label="Loading your day">
      <header className="flex items-start justify-between gap-3 lg:hidden">
        <div className="min-w-0">
          <Skeleton className="ml-0.5 h-3.5 w-16" />
          <Skeleton className="my-2.5 h-8 w-52 rounded-xl" />
          <MasteryLineSkeleton className="pl-0.5" />
        </div>
        <Skeleton className="mt-5 h-11 w-16 shrink-0" />
      </header>
      <header className="hidden items-end justify-between gap-6 lg:flex">
        <div className="min-w-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2.5 h-9 w-72 rounded-xl" />
          <MasteryLineSkeleton className="mt-3.5" />
        </div>
        <div className="flex shrink-0 gap-2.5">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-40" />
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start">
        <section className="min-w-0 lg:flex-[999_1_560px]">
          <div className="mb-3 flex items-baseline justify-between lg:hidden">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="lg:hidden">
            <PathSkeleton geo={PHONE_PATH} wide={false} />
          </div>
          <div className="hidden lg:block">
            <PathSkeleton geo={WIDE_PATH} wide />
          </div>
        </section>
        <div className="hidden min-w-0 flex-[1_0_340px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-4 lg:grid">
          <Skeleton shape="block" className="h-[290px]" />
          <Skeleton shape="block" className="h-[340px]" />
        </div>
      </div>
    </div>
  );
}
