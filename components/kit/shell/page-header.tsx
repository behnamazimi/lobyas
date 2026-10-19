import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "../controls/pill";

/** A page's top: a back button, the serif title, an optional subline and an action slot. */
export function PageHeader({
  title,
  subline,
  backHref,
  onBack,
  action,
  className,
}: {
  title: ReactNode;
  subline?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}) {
  const hasBack = Boolean(backHref || onBack);
  return (
    <header className={cn("flex flex-col", className)}>
      {hasBack || action ? (
        <div className="flex items-center gap-2">
          {hasBack ? (
            <IconButton label="Back" href={backHref} onClick={onBack} className="-ml-2">
              <ChevronLeft className="size-6" strokeWidth={2.6} aria-hidden />
            </IconButton>
          ) : null}
          <div className="flex-1" />
          {action}
        </div>
      ) : null}
      <h1 className="m-0 mt-1.5 font-heading text-[30px] leading-[1.1] font-extrabold [overflow-wrap:anywhere]">
        {title}
      </h1>
      {subline ? (
        <p className="mt-1 text-[15px] leading-snug font-semibold text-muted">{subline}</p>
      ) : null}
    </header>
  );
}
