import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The primary action of a form or flow. On the phone it sticks above the safe area.
 *  From lg up it sits in normal flow, directly under the content. */
export function PinnedAction({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-5 mt-auto bg-gradient-to-t from-base-200 from-75% to-transparent px-5 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]",
        "lg:static lg:z-auto lg:mx-0 lg:mt-0 lg:bg-none lg:px-0 lg:pt-0 lg:pb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
