import type { ReactNode } from "react";
import { pageContainerClass } from "@/components/page-container";
import { SMALL_TITLE_CLASS } from "@/components/public/title-class";
import { cn } from "@/lib/utils";

export const contentPageLinkClass =
  "font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80";

type ContentPageShellProps = {
  children: ReactNode;
  className?: string;
};

/** The document shell: a narrow reading column for legal and contact pages. */
export function ContentPageShell({ children, className }: ContentPageShellProps) {
  return (
    <div
      className={cn(
        pageContainerClass,
        "landing-enter max-w-2xl flex-1 py-10 pb-24 sm:py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ContentPageHeaderProps = {
  badge: ReactNode;
  title: ReactNode;
  description: string;
};

export function ContentPageHeader({ badge, title, description }: ContentPageHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      {badge}
      <h1 className={SMALL_TITLE_CLASS}>{title}</h1>
      <p className="m-0 text-base text-base-content/70">{description}</p>
    </div>
  );
}
