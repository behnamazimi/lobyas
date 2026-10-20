import { PageShell, pageContainerClass } from "@/components/page-container";
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

export function PageSkeleton() {
  return (
    <PageShell innerClassName="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-4">
        <SkeletonBar className="h-20 max-w-full" />
      </div>

      <div className="flex flex-wrap gap-4">
        <SkeletonBar className="h-10 w-full max-w-xs" />
        <SkeletonBar className="h-10 w-28 max-w-full" />
        <SkeletonBar className="h-10 w-28 max-w-full" />
      </div>
    </PageShell>
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
  return (
    <div
      className="shadow-surface overflow-hidden rounded-box bg-base-100 ring-1 ring-base-content/5"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="space-y-3 px-5 py-5 sm:px-6">
        <SkeletonBar className="h-4 w-40" />
        <SkeletonBar className="h-16 w-full" />
        <SkeletonBar className="h-16 w-full" />
        <SkeletonBar className="mt-4 h-10 w-full max-w-md" />
      </div>
    </div>
  );
}

/** Title, collection card, search and term rows of the Library, while a collection loads. */
export function LibraryListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading collection">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-9 w-32" />
        <SkeletonBar className="h-11 w-32 rounded-full" />
      </div>
      <SkeletonBar className="h-48 w-full rounded-3xl" />
      <SkeletonBar className="h-12 w-full rounded-2xl" />
      <div className="flex flex-col gap-px overflow-hidden rounded-3xl">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonBar key={index} className="h-[68px] w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}
