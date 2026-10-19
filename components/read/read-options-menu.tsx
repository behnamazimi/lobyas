"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { saveReadOptionAction } from "@/app/(private)/app/read/actions";
import { SlidersHorizontal } from "lucide-react";
import { BottomSheet, Divider, IconButton, ToggleRow } from "@/components/kit";
import { ShadowingOptionRows } from "@/components/read/shadowing-option-rows";
import { isStoriesPath } from "@/components/read/read-mode-tabs";
import { useToast } from "@/components/ui/toast";
import { useKeepAwakeAvailable } from "@/hooks/use-wake-lock";
import type { ReadOptionKey, ReadOptions } from "@/lib/read/options";

type SwitchOptionKey =
  | "storiesDefault"
  | "keepAwake"
  | "revealedDefault"
  | "hideQuestion"
  | "narrationHighlight"
  | "tapToPlay";

const OPTION_ROWS: { key: SwitchOptionKey; label: string; description: string }[] = [
  {
    key: "revealedDefault",
    label: "Show definitions right away",
    description: "Cards open revealed. A card counts as read when it's shown.",
  },
  {
    key: "hideQuestion",
    label: "Hide “What is …?”",
    description: "The hidden card shows just the term.",
  },
  {
    key: "storiesDefault",
    label: "Open Stories by default",
    description: "Read starts on the Stories tab instead of Cards.",
  },
  {
    key: "keepAwake",
    label: "Keep screen awake",
    description: "Stops the screen sleeping while you study, until you’ve been idle for 2 minutes.",
  },
  {
    key: "narrationHighlight",
    label: "Highlight text while listening",
    description: "Stories follow the narration sentence by sentence.",
  },
  {
    key: "tapToPlay",
    label: "Tap a sentence to play it",
    description: "Plays that sentence, then pauses unless the narration is already playing.",
  },
];

const STORIES_ONLY_KEYS = new Set<SwitchOptionKey>(["narrationHighlight", "tapToPlay"]);

function disabledNoteFor(key: SwitchOptionKey, options: ReadOptions): string | undefined {
  if (key === "hideQuestion" && options.revealedDefault) {
    return "Not used while definitions show right away.";
  }
  if (key === "narrationHighlight" && options.shadowing) {
    return "Always on while Shadowing is on.";
  }
  return undefined;
}

function OptionsList({
  options,
  onStories,
  keepAwakeAvailable,
  onChange,
}: {
  options: ReadOptions;
  onStories: boolean;
  keepAwakeAvailable: boolean;
  onChange: (key: ReadOptionKey, value: boolean | number) => void;
}) {
  const visible = OPTION_ROWS.filter((row) => keepAwakeAvailable || row.key !== "keepAwake");
  const general = visible.filter((row) => !STORIES_ONLY_KEYS.has(row.key));
  const listening = visible.filter((row) => STORIES_ONLY_KEYS.has(row.key));

  function renderRows(rows: typeof OPTION_ROWS) {
    return rows.map((row, index) => {
      const note = disabledNoteFor(row.key, options);
      return (
        <div key={row.key}>
          {index > 0 ? <Divider /> : null}
          <ToggleRow
            label={row.label}
            description={note ?? row.description}
            disabled={Boolean(note)}
            className={note ? "opacity-50" : undefined}
            checked={options[row.key] || (row.key === "narrationHighlight" && options.shadowing)}
            onChange={(checked) => onChange(row.key, checked)}
          />
        </div>
      );
    });
  }

  return (
    <div>
      {renderRows(general)}
      {onStories ? (
        <>
          <h3 className="mt-4 mb-0 px-1 text-[13px] font-extrabold text-muted">
            Listening (AI voice)
          </h3>
          {renderRows(listening)}
          <Divider />
          <ShadowingOptionRows options={options} onChange={onChange} />
        </>
      ) : null}
    </div>
  );
}

function sameOptions(a: ReadOptions, b: ReadOptions): boolean {
  return (Object.keys(a) as ReadOptionKey[]).every((key) => a[key] === b[key]);
}

/** The options button next to the Cards/Stories switch. Saves each toggle as it changes. */
export function ReadOptionsMenu({ initialOptions }: { initialOptions: ReadOptions }) {
  const [options, setOptions] = useState(initialOptions);
  // An option can also be changed elsewhere (the Shadowing chip on a story), so
  // follow the saved values when they change.
  const [saved, setSaved] = useState(initialOptions);
  if (!sameOptions(saved, initialOptions)) {
    setSaved(initialOptions);
    setOptions(initialOptions);
  }
  const router = useRouter();
  const onStories = isStoriesPath(usePathname());
  const { toast } = useToast();
  const keepAwakeAvailable = useKeepAwakeAvailable();

  async function update(key: ReadOptionKey, value: boolean | number) {
    const previous = options[key];
    setOptions((current) => ({ ...current, [key]: value }));
    const result = await saveReadOptionAction(key, value);
    if (result.error) {
      setOptions((current) => ({ ...current, [key]: previous }));
      toast(result.error, "destructive");
      return;
    }
    // The Stories default only matters the next time Read opens; refreshing
    // now would move the user off the page they're on.
    if (key !== "storiesDefault") router.refresh();
  }

  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        label="Read options"
        data-tour="read-options"
        onClick={() => setOpen(true)}
        className="transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        <SlidersHorizontal className="size-[22px]" strokeWidth={2.2} aria-hidden />
      </IconButton>
      <BottomSheet isOpen={open} onOpenChange={setOpen} title="Read options">
        <OptionsList
          options={options}
          onStories={onStories}
          keepAwakeAvailable={keepAwakeAvailable}
          onChange={(key, value) => void update(key, value)}
        />
      </BottomSheet>
    </>
  );
}
