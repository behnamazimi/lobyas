"use client";

import { Check, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  Chip,
  FormField,
  IconButton,
  ModeSwitch,
  Pill,
  RadioList,
  SearchField,
  TextArea,
  TextInput,
  SegmentedControl,
  Stepper,
  ToggleRow,
} from "@/components/kit";
import { Story } from "./story";

export function ControlsStories() {
  const [view, setView] = useState("overview");
  const [celebrate, setCelebrate] = useState(true);
  const [pace, setPace] = useState("daily");
  const [daily, setDaily] = useState(10);
  const [chip, setChip] = useState("all");
  const [query, setQuery] = useState("");

  return (
    <>
      <Story
        title="Mode switch"
        note="Links on a pill track, like Cards and Stories. The current one is white."
      >
        <ModeSwitch
          label="Read mode"
          items={[
            { href: "/admin/kit", label: "Cards", active: true },
            { href: "/admin/kit", label: "Stories", active: false },
          ]}
        />
      </Story>
      <Story
        title="Pills and icon buttons"
        note="Ink, white, soft and coral; 44 px, and 60 px pinned."
      >
        <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-base-100 p-3 shadow-card">
          <Pill>Primary</Pill>
          <Pill variant="secondary">Secondary</Pill>
          <Pill variant="soft">Soft</Pill>
          <Pill variant="ghost">Ghost</Pill>
          <Pill variant="danger">
            <Trash2 className="size-4" aria-hidden /> Delete…
          </Pill>
          <Pill disabled>Disabled</Pill>
          <IconButton label="Close">
            <X className="size-6" aria-hidden />
          </IconButton>
          <IconButton label="Done" tone="soft">
            <Check className="size-5" aria-hidden />
          </IconButton>
        </div>
        <Pill size="lg" className="mt-3">
          Show answer
        </Pill>
      </Story>
      <Story title="Segmented control" note="A radio group on a pill track.">
        <SegmentedControl
          label="Mastery views"
          value={view}
          onChange={setView}
          options={[
            { value: "overview", label: "Overview" },
            { value: "terms", label: "Terms" },
          ]}
        />
      </Story>
      <Story title="Toggle row and radio list">
        <div className="rounded-3xl bg-base-100 px-4 py-1 shadow-card">
          <ToggleRow
            label="Celebrate when I hit a goal"
            description="A short celebration the moment a day’s goal is done."
            checked={celebrate}
            onChange={setCelebrate}
          />
        </div>
        <RadioList
          className="mt-3 rounded-3xl bg-base-100 p-2 shadow-card"
          label="Pace"
          value={pace}
          onChange={setPace}
          options={[
            {
              value: "daily",
              label: "Every day",
              description: "Meet your goals daily.",
            },
            { value: "weekdays", label: "Weekdays only" },
          ]}
        />
      </Story>
      <Story title="Chips with counts">
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All", 186],
            ["new", "Not started", 24],
            ["mastered", "Mastered", 119],
            ["known", "Marked known", 1204],
          ].map(([value, label, count]) => (
            <Chip
              key={value}
              selected={chip === value}
              count={count}
              onPress={() => setChip(String(value))}
            >
              {label}
            </Chip>
          ))}
        </div>
      </Story>
      <Story title="Stepper">
        <Stepper
          value={daily}
          valueText={daily === 0 ? "Off" : undefined}
          unit="terms a day"
          decreaseLabel="Fewer terms a day"
          increaseLabel="More terms a day"
          onDecrease={() => setDaily((value) => Math.max(0, value - 5))}
          onIncrease={() => setDaily((value) => Math.min(200, value + 5))}
          disableDecrease={daily === 0}
        />
      </Story>
      <Story title="Search field" note="White, 48 px, with a clear button once there is text.">
        <SearchField label="Search terms" value={query} onChange={setQuery} />
      </Story>
      <Story
        title="Form fields"
        note="Cream fields with a label above, for the edit and report sheets."
      >
        <div className="flex flex-col gap-3.5 rounded-[28px] bg-base-100 p-5 shadow-card">
          <FormField label="Name" htmlFor="kit-name">
            <TextInput id="kit-name" defaultValue="Standup" />
          </FormField>
          <FormField label="Description (optional)" htmlFor="kit-desc">
            <TextArea id="kit-desc" rows={3} placeholder="What is this collection about?" />
          </FormField>
        </div>
      </Story>
    </>
  );
}
