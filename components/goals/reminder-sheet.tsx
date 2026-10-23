"use client";

import { useState } from "react";
import { BottomSheet, Chip, Pill, SelectInput } from "@/components/kit";
import {
  EVERY_DAY,
  formatNextReminder,
  formatReminderTime,
  joinTime,
  splitTime,
  WEEKDAYS,
  WEEKDAYS_ONLY,
  WEEKENDS_ONLY,
  type Reminder,
} from "@/lib/reminders/reminders";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const SHORTCUTS = [
  { label: "Every day", days: EVERY_DAY },
  { label: "Weekdays", days: WEEKDAYS_ONLY },
  { label: "Weekends", days: WEEKENDS_ONLY },
];

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
  const parts = splitTime(time);
  const next = formatNextReminder(time, days, new Date());

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
            disabled={days.length === 0 || isSaving}
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
        <div className="flex flex-col gap-3">
          <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-[24px] bg-base-200">
            <span className="text-[13px] font-extrabold tracking-wide text-muted uppercase">
              Remind me at
            </span>
            <span className="font-heading text-5xl leading-none font-extrabold tabular-nums">
              {formatReminderTime(time)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SelectInput
              aria-label="Hour"
              value={parts.hour}
              onChange={(event) =>
                setTime(joinTime({ ...parts, hour: Number(event.target.value) }))
              }
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              aria-label="Minute"
              value={parts.minute}
              onChange={(event) =>
                setTime(joinTime({ ...parts, minute: Number(event.target.value) }))
              }
            >
              {MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  {String(minute).padStart(2, "0")}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              aria-label="AM or PM"
              value={parts.pm ? "pm" : "am"}
              onChange={(event) => setTime(joinTime({ ...parts, pm: event.target.value === "pm" }))}
            >
              <option value="am">AM</option>
              <option value="pm">PM</option>
            </SelectInput>
          </div>
        </div>

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
