"use client";

import { SelectInput } from "@/components/kit";
import {
  COLLECTION_LANGUAGE_OPTIONS,
  parseLanguage,
  type CollectionLanguage,
} from "@/lib/terms/languages";

type LanguageToggleProps = {
  value: CollectionLanguage;
  onChange: (language: CollectionLanguage) => void;
  isDisabled?: boolean;
};

export function LanguageToggle({ value, onChange, isDisabled }: LanguageToggleProps) {
  return (
    <SelectInput
      aria-label="Language"
      value={value}
      disabled={isDisabled}
      onChange={(event) => onChange(parseLanguage(event.target.value))}
    >
      {COLLECTION_LANGUAGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectInput>
  );
}
