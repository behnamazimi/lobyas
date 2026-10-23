"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { saveRemindersAction } from "@/app/(private)/app/goals/actions";
import { Banner, Pill, SectionCard } from "@/components/kit";
import { useToast } from "@/components/ui/toast";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useClock24h, useHasCapability } from "@/hooks/use-native";
import { openNotificationSettings } from "@/lib/native/app-settings";
import { onAppResume } from "@/lib/native/events";
import {
  notificationPermission,
  requestNotificationPermission,
  type NotificationPermission,
} from "@/lib/native/notifications";
import { applyReminders } from "@/lib/reminders/device";
import {
  EVERY_DAY,
  formatReminderDays,
  formatReminderTime,
  MAX_REMINDERS,
  type Reminder,
  type RemindersChange,
} from "@/lib/reminders/reminders";
import { ReminderSheet } from "./reminder-sheet";

const DEFAULT_TIME = "19:00";

function newReminder(): Reminder {
  return { id: crypto.randomUUID(), time: DEFAULT_TIME, days: EVERY_DAY, enabled: true };
}

/** Study reminders for the phone apps. Hidden on the web and in an app whose
 *  build has no notifications plugin. */
export function RemindersCard({ initial }: { initial: Reminder[] }) {
  const { toast } = useToast();
  const supported = useHasCapability("notifications");
  const is24Hour = useClock24h();
  const [permission, setPermission] = useState<NotificationPermission>("prompt");
  const [reminders, setReminders] = useState(initial);
  const [editing, setEditing] = useState<{ reminder: Reminder; isNew: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useMountEffect(() => {
    const refresh = () =>
      void notificationPermission().then((answer) => {
        if (answer !== "unavailable") setPermission(answer);
      });
    refresh();
    return onAppResume(refresh);
  });

  if (!supported) return null;

  async function persist(change: RemindersChange): Promise<boolean> {
    setIsSaving(true);
    try {
      if (change.type === "upsert" && change.reminder.enabled && permission === "prompt") {
        const answer = await requestNotificationPermission();
        if (answer !== "unavailable") setPermission(answer);
      }
      const result = await saveRemindersAction(change);
      if (result.error || !result.reminders) {
        toast(result.error ?? "Couldn't save your reminders. Try again.", "destructive");
        return false;
      }
      setReminders(result.reminders);
      if (!(await applyReminders(result.reminders))) {
        toast(
          "Saved, but this phone couldn't schedule it. Open Lobyas again to retry.",
          "destructive",
        );
      }
      return true;
    } finally {
      setIsSaving(false);
    }
  }

  async function save(reminder: Reminder) {
    if (await persist({ type: "upsert", reminder })) {
      setEditing(null);
      toast("Reminder saved");
    }
  }

  async function remove(id: string) {
    if (await persist({ type: "remove", id })) {
      setEditing(null);
      toast("Reminder deleted");
    }
  }

  const blocked = permission === "denied" && reminders.some((r) => r.enabled);

  return (
    <SectionCard title="Reminders" description="A nudge on this phone when it's time to study.">
      {blocked ? (
        <Banner
          className="mb-2"
          action={
            <Pill size="md" variant="secondary" onClick={() => void openNotificationSettings()}>
              Open settings
            </Pill>
          }
        >
          Notifications are off for Lobyas, so reminders can't reach you.
        </Banner>
      ) : null}

      <ul className="m-0 flex list-none flex-col divide-y divide-base-300 p-0">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setEditing({ reminder, isNew: false })}
              className="flex min-h-14 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 py-3 text-left"
            >
              <span className="text-base font-extrabold tabular-nums">
                {formatReminderTime(reminder.time, is24Hour)}
              </span>
              <span className="text-[13px] font-semibold text-muted">
                {formatReminderDays(reminder.days)}
              </span>
            </button>
            <input
              type="checkbox"
              role="switch"
              aria-label={`Reminder at ${formatReminderTime(reminder.time, is24Hour)}`}
              className="toggle shrink-0 border-muted/50 text-muted checked:border-mastered checked:bg-mastered checked:text-white"
              checked={reminder.enabled}
              disabled={isSaving}
              onChange={(event) =>
                void persist({
                  type: "upsert",
                  reminder: { ...reminder, enabled: event.target.checked },
                })
              }
            />
          </li>
        ))}
      </ul>

      {reminders.length < MAX_REMINDERS ? (
        <button
          type="button"
          onClick={() => setEditing({ reminder: newReminder(), isNew: true })}
          className="flex min-h-14 w-full items-center gap-2 py-3 text-base font-extrabold"
        >
          <Plus className="size-5" strokeWidth={2.6} aria-hidden />
          Add reminder
        </button>
      ) : null}

      {editing ? (
        <ReminderSheet
          key={editing.reminder.id}
          reminder={editing.reminder}
          isNew={editing.isNew}
          isSaving={isSaving}
          onSave={(reminder) => void save(reminder)}
          onDelete={() => void remove(editing.reminder.id)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </SectionCard>
  );
}
