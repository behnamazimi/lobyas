import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const pageContainerClass = "mx-auto w-full max-w-6xl px-5";

type PageCenterProps = {
  children: ReactNode;
  className?: string;
};

export function PageCenter({ children, className }: PageCenterProps) {
  return (
    <div className={cn("flex min-h-full flex-col items-center justify-center py-12", className)}>
      <div className={cn(pageContainerClass, "flex w-full flex-col items-center gap-3")}>
        {children}
      </div>
    </div>
  );
}
