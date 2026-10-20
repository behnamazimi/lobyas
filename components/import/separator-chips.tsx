"use client";

import { useState } from "react";
import { Chip, ChoiceCards, FormField, TextInput } from "@/components/kit";
import type { ParseOptions, ParsedList, SeparatorChoice } from "@/lib/import/parse/types";

const CHOICES: { id: SeparatorChoice; label: string }[] = [
  { id: "tab", label: "Tab" },
  { id: "dash", label: "–" },
  { id: "colon", label: ":" },
  { id: "equals", label: "=" },
  { id: "comma", label: "," },
  { id: "custom", label: "Other…" },
];

type SeparatorChipsProps = {
  parsed: ParsedList;
  options: ParseOptions;
  onOptionsChange: (patch: Partial<ParseOptions>) => void;
};

export function SeparatorChips({ parsed, options, onOptionsChange }: SeparatorChipsProps) {
  const [otherOpen, setOtherOpen] = useState(options.separator === "custom");
  const selected = options.separator ?? parsed.separator;
  const showSeparators = parsed.format === "lines" || parsed.format === "tsv";

  return (
    <div className="flex flex-col gap-3">
      {showSeparators ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-extrabold">Split at</span>
          <div role="group" aria-label="Split at" className="flex flex-wrap gap-2">
            {CHOICES.map((choice) => (
              <Chip
                key={choice.id}
                selected={selected === choice.id}
                onPress={() => {
                  setOtherOpen(choice.id === "custom");
                  if (choice.id !== "custom") onOptionsChange({ separator: choice.id });
                }}
              >
                {choice.label}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {otherOpen && showSeparators ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Split at this text" htmlFor="custom-separator">
            <TextInput
              id="custom-separator"
              placeholder="e.g. ::"
              defaultValue={options.customSeparator ?? ""}
              onChange={(event) =>
                onOptionsChange({
                  separator: "custom",
                  customSeparator: event.target.value,
                })
              }
            />
          </FormField>
          <FormField label="Between cards (optional)" htmlFor="card-separator">
            <TextInput
              id="card-separator"
              placeholder="e.g. ##"
              defaultValue={options.cardSeparator ?? ""}
              onChange={(event) => onOptionsChange({ cardSeparator: event.target.value })}
            />
          </FormField>
        </div>
      ) : null}

      {parsed.headingDetected || options.heading ? (
        <ChoiceCards
          label="First line"
          options={[
            { value: "heading", label: "First line is a heading" },
            { value: "term", label: "First line is a term" },
          ]}
          value={(options.heading ?? parsed.headingDetected) ? "heading" : "term"}
          onChange={(key) => onOptionsChange({ heading: key === "heading" })}
        />
      ) : null}
    </div>
  );
}
