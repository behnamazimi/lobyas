import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A lobya scene, a serif title, a line of copy and the actions: for an empty list or collection. */
export function EmptyPanel({
  illustration,
  title,
  description,
  actions,
  titleAs: Title = "h2",
  className,
}: {
  illustration?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleAs?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-sm flex-col items-center gap-3 px-5 text-center",
        className,
      )}
    >
      {illustration ? <div className="w-full max-w-[260px]">{illustration}</div> : null}
      <Title className="m-0 font-heading text-[26px] leading-tight font-extrabold [overflow-wrap:anywhere]">
        {title}
      </Title>
      {description ? (
        <p className="m-0 text-[15px] leading-snug font-semibold text-muted">{description}</p>
      ) : null}
      {actions ? (
        <div className="mt-2 flex w-full flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/** A whole-screen status (offline, not found, something went wrong). */
export function StatusScreen(props: Omit<React.ComponentProps<typeof EmptyPanel>, "titleAs">) {
  return (
    <div className="flex min-h-[60dvh] flex-1 items-center justify-center py-10">
      <EmptyPanel {...props} titleAs="h1" />
    </div>
  );
}

/** A grey placeholder while content loads. `line` is one text line, `block` a card, `circle` a ring. */
export function Skeleton({
  shape = "line",
  className,
}: {
  shape?: "line" | "block" | "circle";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "skeleton",
        shape === "line" && "h-4 w-full rounded-full",
        shape === "block" && "h-24 w-full rounded-3xl",
        shape === "circle" && "size-20 rounded-full",
        className,
      )}
    />
  );
}
