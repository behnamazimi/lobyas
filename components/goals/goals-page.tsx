"use client";

import { useRef, useState, useTransition } from "react";
import {
  forecastGoalsAction,
  saveGoalsAction,
  setGoalCelebrateAction,
} from "@/app/(private)/app/goals/actions";
import { Card, Divider, Pill, PinnedAction, ToggleRow } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { useMountEffect } from "@/hooks/use-mount-effect";
import type { GoalForecast } from "@/lib/goals/forecast";
import {
  DEFAULT_GOALS,
  editedTiers,
  GOAL_TIERS,
  type DailyGoals,
  type GoalTier,
} from "@/lib/goals/levels";
import type { GoalDay, GoalSettings } from "@/lib/goals/settings";
import { useLiveGoalCounts } from "./use-goal-count";
import { forgetOtherGoalCollections, setLiveCelebrate, setLiveGoals } from "./goal-store";
import { ForecastPanel } from "./goal-forecast-panel";
import { TierCard } from "./goal-tier-card";
import { RemindersCard } from "./reminders-card";
import { IntroPanel } from "./goal-today-panel";

const FORECAST_DEBOUNCE_MS = 400;

/** Key it by collection: the goals it edits are that collection's. */
export function GoalsPage({
  collection,
  settings,
  day,
}: {
  collection: { id: string; name: string };
  settings: GoalSettings;
  day: GoalDay;
}) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(day.goals);
  const [draft, setDraft] = useState<DailyGoals>(day.goals ?? DEFAULT_GOALS);
  const [applyToAll, setApplyToAll] = useState(false);
  const [celebrate, setCelebrate] = useState(settings.celebrate);
  const [forecast, setForecast] = useState<GoalForecast | null>(null);
  const [isForecasting, setIsForecasting] = useState(true);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequest = useRef(0);

  const dirty = saved === null || GOAL_TIERS.some((tier) => saved[tier] !== draft[tier]);
  const done = useLiveGoalCounts(collection.id, day.counts);

  async function loadForecast(goals: DailyGoals) {
    const request = ++latestRequest.current;
    setIsForecasting(true);
    const result = await forecastGoalsAction(collection.id, goals);
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

  function save(applyToAll: boolean) {
    startSaving(async () => {
      const result = await saveGoalsAction({
        collectionId: collection.id,
        goals: draft,
        applyToAll,
        tiers: editedTiers(saved, draft),
      });
      if (result.error) {
        toast(result.error, "destructive");
        return;
      }
      setSaved(draft);
      setLiveGoals({
        collectionId: collection.id,
        name: collection.name,
        day: result.day ?? { ...day, goals: draft },
      });
      if (applyToAll) {
        forgetOtherGoalCollections(collection.id);
        // It was a one-time copy, so the switch is spent and Save goes quiet again.
        setApplyToAll(false);
      }
      toast(applyToAll ? "Goals saved for all collections" : "Goals saved");
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
    setLiveCelebrate(next);
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {saved ? null : <IntroPanel />}

      <h2 className="m-0 px-1 font-heading text-xl font-extrabold [overflow-wrap:anywhere]">
        Goals for {collection.name}
      </h2>

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
        <Divider className="mx-0 my-0" />
        <ToggleRow
          label="Use these goals in every collection"
          description="Saving copies them to every collection, and to ones you add later."
          checked={applyToAll}
          onChange={setApplyToAll}
        />
      </Card>

      <RemindersCard initial={settings.reminders} />

      <PinnedAction>
        <Pill
          size="lg"
          disabled={(!dirty && !applyToAll) || isSaving}
          onClick={() => save(applyToAll)}
        >
          {isSaving ? "Saving…" : saved ? "Save goals" : "Start these goals"}
        </Pill>
      </PinnedAction>
    </div>
  );
}
