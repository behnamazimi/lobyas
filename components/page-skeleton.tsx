import { Skeleton } from "@/components/kit";
import { pageContainerClass } from "@/components/page-container";
import { cn } from "@/lib/utils";

export function SkeletonBar({ className }: { className: string }) {
  return <div aria-hidden className={cn("skeleton bg-base-200", className)} />;
}

/** Chrome-sized fallback matching `SiteHeaderChrome`'s exact shape — avoids layout shift. */
export function HeaderSkeleton({ hasLikelySession }: { hasLikelySession: boolean }) {
  return (
    <header
      className="border-b border-base-300 bg-base-100/80 pt-safe backdrop-blur-sm"
      style={{ viewTransitionName: "site-header" }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className={cn(pageContainerClass, "flex items-center justify-between gap-4 py-4")}>
        <div className="flex items-center gap-4">
          <SkeletonBar className="h-7 w-7 rounded-full md:hidden" />
          <SkeletonBar className="hidden h-6 w-28 md:block" />
          {hasLikelySession ? (
            <div className="hidden items-center gap-1 md:flex">
              <SkeletonBar className="h-10 w-16 rounded-field" />
              <SkeletonBar className="h-10 w-16 rounded-field" />
              <SkeletonBar className="h-10 w-16 rounded-field" />
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {hasLikelySession ? <SkeletonBar className="h-10 w-14 rounded-field" /> : null}
          <SkeletonBar className="h-10 w-10 rounded-field" />
          <SkeletonBar className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </header>
  );
}

/** A page title and two cards, in the column the app's pages use. */
export function PageSkeleton() {
  return (
    <div className="flex flex-1 flex-col bg-base-200" aria-busy="true" aria-label="Loading">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3 px-5 py-4 lg:py-9">
        <Skeleton className="h-9 w-40" />
        <Skeleton shape="block" className="h-36" />
        <Skeleton shape="block" className="h-48" />
      </div>
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <SkeletonBar className="h-7 w-48" />
      <div className="overflow-hidden rounded-field border border-base-300">
        <div className="divide-y divide-base-300">
          <SkeletonBar className="h-11 w-full rounded-none" />
          <SkeletonBar className="h-11 w-full rounded-none" />
          <SkeletonBar className="h-11 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function PanelSkeleton() {
  return <Skeleton shape="block" className="h-40" />;
}
