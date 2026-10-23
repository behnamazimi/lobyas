import { Card } from "@/components/kit";
import { GoalLobyaHead } from "@/components/illustrations/scenes/goal-team";
import { GOAL_TIERS } from "@/lib/goals/levels";

export function IntroPanel() {
  return (
    <Card radius="md" className="flex items-center gap-4 p-4">
      <div className="flex shrink-0 -space-x-3" aria-hidden>
        {GOAL_TIERS.map((tier) => (
          <GoalLobyaHead key={tier} tier={tier} className="size-12" />
        ))}
      </div>
      <p className="m-0 text-sm font-semibold text-muted">
        Set a pace for each mode below, for this collection. When you reach a goal, the lobyas
        celebrate with you.
      </p>
    </Card>
  );
}
