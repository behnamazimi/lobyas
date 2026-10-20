import type { ParsedList, SeparatorChoice } from "@/lib/import/parse/types";

const SEPARATOR_NAMES: Record<SeparatorChoice, string> = {
  tab: "a tab",
  dash: "a dash",
  colon: "a colon",
  equals: "an equals sign",
  comma: "a comma",
  custom: "your separator",
};

/** What Check tells the person it understood, in a few words. `null` for a JSON file. */
export function readAsLine(parsed: ParsedList | null): string {
  if (!parsed) return "a JSON file.";
  switch (parsed.format) {
    case "words":
      return "one term per line, with no definitions.";
    case "pairs":
      return "a term on one line, then its definition on the next.";
    case "html_table":
    case "anki":
    case "csv":
    case "tsv":
      return "a table, one term per row.";
    case "lines":
    case "json":
      return parsed.separator
        ? `term, then a definition after ${SEPARATOR_NAMES[parsed.separator]}.`
        : "one term per line.";
  }
}
