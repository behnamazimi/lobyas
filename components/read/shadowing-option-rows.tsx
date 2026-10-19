"use client";

import { Divider, SegmentedControl, ToggleRow } from "@/components/kit";
import type { ReadOptionKey, ReadOptions } from "@/lib/read/options";
import {
  SHADOWING_GAPS,
  SHADOWING_REPEATS,
  type ShadowingGap,
  type ShadowingRepeats,
} from "@/lib/stories/shadowing";

const GAP_CHOICES = SHADOWING_GAPS.map((gap) => ({ value: String(gap), label: `${gap}×` }));
const REPEAT_CHOICES = SHADOWING_REPEATS.map((repeats) => ({
  value: String(repeats),
  label: repeats === 0 ? "Endless" : String(repeats),
}));

function ChoiceRow({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 px-1 py-3">
      <div>
        <div className="text-base font-extrabold">{label}</div>
        {hint ? <div className="text-[13px] font-semibold text-muted">{hint}</div> : null}
      </div>
      <SegmentedControl label={label} options={options} value={value} onChange={onChange} />
    </div>
  );
}

/** Shadowing's switch, and its settings once it is on. */
export function ShadowingOptionRows({
  options,
  onChange,
}: {
  options: ReadOptions;
  onChange: (key: ReadOptionKey, value: boolean | number) => void;
}) {
  return (
    <>
      <ToggleRow
        label="Shadowing"
        description="Replay and pause sentence by sentence so you can repeat after the voice."
        checked={options.shadowing}
        onChange={(checked) => onChange("shadowing", checked)}
      />
      {options.shadowing ? (
        <>
          <Divider />
          <ToggleRow
            label="Pause after each sentence"
            description="Gives you a moment to say it back before the next one."
            checked={options.shadowingPause}
            onChange={(checked) => onChange("shadowingPause", checked)}
          />
          {options.shadowingPause ? (
            <ChoiceRow
              label="Pause length"
              hint="Used while shadowing"
              options={GAP_CHOICES}
              value={String(options.shadowingGap)}
              onChange={(value) => onChange("shadowingGap", Number(value) as ShadowingGap)}
            />
          ) : null}
          <ChoiceRow
            label="Plays when repeating a sentence"
            options={REPEAT_CHOICES}
            value={String(options.shadowingRepeats)}
            onChange={(value) => onChange("shadowingRepeats", Number(value) as ShadowingRepeats)}
          />
        </>
      ) : null}
    </>
  );
}
