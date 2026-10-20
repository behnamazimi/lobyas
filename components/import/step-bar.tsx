import { cn } from "@/lib/utils";

const STEPS = ["Paste", "Check", "Add"] as const;

/** Where the list is: pasting it, checking it, or adding it. */
export function StepBar({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol aria-label="Steps" className="m-0 grid list-none grid-cols-3 gap-1.5 p-0">
      {STEPS.map((label, index) => (
        <li
          key={label}
          aria-current={index === current ? "step" : undefined}
          className="flex flex-col gap-1"
        >
          <span
            className={cn("h-1.5 rounded-full", index <= current ? "bg-quiz-ring" : "bg-base-300")}
          />
          <span
            className={cn(
              "text-xs font-extrabold",
              index === current ? "text-base-content" : "text-muted",
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
