"use client";

import { useState, type MouseEvent } from "react";
import { BottomSheet, Chip, Pill } from "@/components/kit";
import {
  EVERY_DAY,
  formatNextReminder,
  formatReminderTime,
  WEEKDAYS,
  WEEKDAYS_ONLY,
  WEEKENDS_ONLY,
  type Reminder,
} from "@/lib/reminders/reminders";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { label: "Every day", days: EVERY_DAY },
  { label: "Weekdays", days: WEEKDAYS_ONLY },
  { label: "Weekends", days: WEEKENDS_ONLY },
];

function openPicker(event: MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker();
  } catch {
    // No showPicker here, or the picker is already open: the browser's own handling applies.
  }
}

function sameDays(a: number[], b: number[]) {
  return a.length === b.length && a.every((day) => b.includes(day));
}

export function ReminderSheet({
  reminder,
  isNew,
  isSaving,
  onSave,
  onDelete,
  onClose,
}: {
  reminder: Reminder;
  isNew: boolean;
  isSaving: boolean;
  onSave: (reminder: Reminder) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [time, setTime] = useState(reminder.time);
  const [days, setDays] = useState(reminder.days);
  const next = time ? formatNextReminder(time, days, new Date()) : null;

  function toggleDay(day: number) {
    setDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort(),
    );
  }

  return (
    <BottomSheet
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={isNew ? "New reminder" : "Edit reminder"}
      footer={
        <div className="flex flex-col gap-1 pt-3">
          <Pill
            size="lg"
            disabled={days.length === 0 || time === "" || isSaving}
            onClick={() => onSave({ ...reminder, time, days, enabled: true })}
          >
            {isSaving ? "Saving…" : "Save reminder"}
          </Pill>
          {isNew ? null : (
            <Pill variant="ghost" disabled={isSaving} onClick={onDelete}>
              Delete reminder
            </Pill>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-2 pb-2">
        <label className="relative flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-[24px] bg-base-200">
          <span className="text-[13px] font-extrabold tracking-wide text-muted uppercase">
            Remind me at
          </span>
          <span className="font-heading text-5xl leading-none font-extrabold tabular-nums">
            {time ? formatReminderTime(time) : "Pick a time"}
          </span>
          <input
            type="time"
            aria-label="Reminder time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            // Some Android WebViews get the click but don't open the picker for an invisible input.
            onClick={openPicker}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-extrabold" id="reminder-days-label">
            On these days
          </span>
          <div
            role="group"
            aria-labelledby="reminder-days-label"
            className="grid grid-cols-7 gap-1.5"
          >
            {WEEKDAYS.map(({ day, short, letter }) => {
              const selected = days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  aria-label={short}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "hit-area flex aspect-square w-full items-center justify-center rounded-full text-[15px] font-extrabold transition-colors",
                    selected
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-muted hover:bg-base-300",
                  )}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {SHORTCUTS.map(({ label, days: preset }) => (
              <Chip key={label} selected={sameDays(days, preset)} onPress={() => setDays(preset)}>
                {label}
              </Chip>
            ))}
          </div>
        </div>

        <p className="m-0 min-h-5 text-center text-sm font-bold text-muted">
          {next ? `Next reminder: ${next}` : "Pick at least one day."}
        </p>
      </div>
    </BottomSheet>
  );
}
