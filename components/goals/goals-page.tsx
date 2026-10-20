"use client";

import { useRef, useState, useTransition } from "react";
import {
  forecastGoalsAction,
  saveGoalsAction,
  setGoalCelebrateAction,
} from "@/app/(private)/app/goals/actions";
import { Card, Pill, PinnedAction, ToggleRow } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { useMountEffect } from "@/hooks/use-mount-effect";
import type { GoalForecast } from "@/lib/goals/forecast";
import { DEFAULT_GOALS, GOAL_TIERS, type DailyGoals, type GoalTier } from "@/lib/goals/levels";
import type { GoalDay, GoalSettings } from "@/lib/goals/settings";
import { useLiveGoalCounts } from "./use-goal-count";
import { setLiveCelebrate, setLiveGoals } from "./goal-store";
import { ForecastPanel } from "./goal-forecast-panel";
import { TierCard } from "./goal-tier-card";
import { IntroPanel } from "./goal-today-panel";

const FORECAST_DEBOUNCE_MS = 400;

export function GoalsPage({ settings, day }: { settings: GoalSettings; day: GoalDay }) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(settings.goals);
  const [draft, setDraft] = useState<DailyGoals>(settings.goals ?? DEFAULT_GOALS);
  const [celebrate, setCelebrate] = useState(settings.celebrate);
  const [forecast, setForecast] = useState<GoalForecast | null>(null);
  const [isForecasting, setIsForecasting] = useState(true);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequest = useRef(0);

  const dirty = saved === null || GOAL_TIERS.some((tier) => saved[tier] !== draft[tier]);
  const done = useLiveGoalCounts(day.counts);

  async function loadForecast(goals: DailyGoals) {
    const request = ++latestRequest.current;
    setIsForecasting(true);
    const result = await forecastGoalsAction(goals);
    if (request !== latestRequest.current) return;
    setIsForecasting(false);
    setForecastError(result.error ?? null);
    if (result.forecast) setForecast(result.forecast);
  }

  useMountEffect(() => {
    void loadForecast(draft);
  });

  function change(tier: GoalTier, goal: number | null) {
    const next = { ...draft, [tier]: goal };
    setDraft(next);
    setIsForecasting(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void loadForecast(next), FORECAST_DEBOUNCE_MS);
  }

  function save() {
    startSaving(async () => {
      const result = await saveGoalsAction(draft);
      if (result.error) {
        toast(result.error, "destructive");
        return;
      }
      setSaved(draft);
      setLiveGoals({ goals: draft, celebrate, day: result.day ?? day });
      toast("Goals saved");
    });
  }

  async function toggleCelebrate(next: boolean) {
    setCelebrate(next);
    const result = await setGoalCelebrateAction(next);
    if (result.error) {
      setCelebrate(!next);
      toast(result.error, "destructive");
      return;
    }
    if (saved) setLiveCelebrate(next);
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {saved ? null : <IntroPanel />}

      {GOAL_TIERS.map((tier) => (
        <TierCard
          key={tier}
          tier={tier}
          goal={draft[tier]}
          done={done[tier]}
          onChange={(g) => change(tier, g)}
        />
      ))}

      <ForecastPanel forecast={forecast} isLoading={isForecasting} error={forecastError} />

      <Card radius="md" className="px-4 py-1">
        <ToggleRow
          label="Celebrate when I hit a goal"
          description="A short celebration the moment a day's goal is done."
          checked={celebrate}
          onChange={(next) => void toggleCelebrate(next)}
        />
      </Card>

      <PinnedAction>
        <Pill size="lg" disabled={!dirty || isSaving} onClick={save}>
          {isSaving ? "Saving…" : saved ? "Save goals" : "Start these goals"}
        </Pill>
      </PinnedAction>
    </div>
  );
}
