import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function QuizPanel({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "shadow-surface overflow-hidden rounded-box bg-base-100 ring-1 ring-base-content/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function QuizKeyboardHint({ action }: { action: string }) {
  return (
    <span className="hidden md:inline coarse:hidden">
      Press <kbd className="kbd kbd-xs">Enter</kbd> to {action}
    </span>
  );
}
