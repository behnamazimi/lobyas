"use client";

import { useMountEffect } from "@/hooks/use-mount-effect";
import type { GoalDay } from "@/lib/goals/settings";
import { seedStudyDay } from "./goal-store";

export function StudyDaySeed({ day }: { day: GoalDay }) {
  useMountEffect(() => {
    seedStudyDay(day);
  });
  return null;
}
