import { GOAL_LOBYAS } from "@/components/illustrations/scenes/goal-team";
import { LobyaPortrait } from "@/components/illustrations/scenes/lobya-portrait";
import { Pill } from "@/components/kit";
import { cn } from "@/lib/utils";

/** Shown when no goal is set: goals are optional, and this is the only nudge. */
export function GoalPrompt({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="flex-1 rounded-[22px] bg-base-100 p-4 shadow-card">
        <div className="text-base font-extrabold">Want a daily pace?</div>
        <p className="mt-1 mb-2.5 text-[13px] leading-snug font-semibold text-muted">
          Goals are optional. Set one for any mode, or none at all.
        </p>
        <Pill href="/app/goals" variant="soft" className="bg-quiz-tint text-quiz-text">
          Set a daily goal
        </Pill>
      </div>
      <LobyaPortrait {...GOAL_LOBYAS.review} className="w-20 shrink-0" />
    </div>
  );
}
