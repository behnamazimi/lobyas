import { MAX_IMPORT_TERMS } from "./commit-schema";
import { readJsonImport, type JsonImport } from "./json-input";
import { buildTerms } from "./parse/build-terms";
import { looksLikeJson, parseList } from "./parse/detect";
import type { BuiltTerms, ParseOptions, ParsedList } from "./parse/types";
import type { ImportFailure } from "./types";

export type PasteProblem = {
  message: string;
  /** Offer to read JSON-looking text as a plain list. */
  canTreatAsText?: boolean;
  failure?: ImportFailure;
};

export type ReadInputResult =
  | { ok: false; problem: PasteProblem }
  | { ok: true; kind: "json"; json: JsonImport; built: BuiltTerms }
  | { ok: true; kind: "list"; parsed: ParsedList; built: BuiltTerms };

/** Past this, the browser would be parsing megabytes of text in one go. */
export const MAX_INPUT_CHARS = 1_000_000;

export const TOO_MUCH_TEXT_MESSAGE =
  "That's too much to check at once. Split your list and add it in parts.";

export const PASTE_EXAMPLE = "API – a way for programs to talk to each other";

/** The separators the parser auto-detects. Custom split is chosen later, on Check. */
export const PASTE_SEPARATOR_RULE =
  "One term per line. Put a dash, colon, tab, equals sign or comma between the term and its definition.";

export const NO_TERMS_MESSAGE = `Couldn't find any terms. ${PASTE_SEPARATOR_RULE} For example: ${PASTE_EXAMPLE}.`;

export function overLimitMessage(count: number): string {
  return `That's ${count} terms. One import adds up to ${MAX_IMPORT_TERMS}, so split your list and add it in parts.`;
}

function readJson(text: string): ReadInputResult {
  const result = readJsonImport(text);
  if (!result.ok) {
    return {
      ok: false,
      problem:
        result.reason === "syntax"
          ? { message: "This looks like JSON, but we couldn't read it.", canTreatAsText: true }
          : { message: result.failure.message, failure: result.failure },
    };
  }
  return { ok: true, kind: "json", json: result.data, built: result.data.built };
}

/** Reads pasted or uploaded text into terms, or says what's wrong with it. */
export function readImportInput(text: string, options: ParseOptions): ReadInputResult {
  if (!text.trim()) {
    return {
      ok: false,
      problem: { message: "Nothing to check yet. Paste a list or choose a file." },
    };
  }

  if (text.length > MAX_INPUT_CHARS)
    return { ok: false, problem: { message: TOO_MUCH_TEXT_MESSAGE } };

  const result =
    looksLikeJson(text) && !options.treatAsText
      ? readJson(text)
      : (() => {
          const parsed = parseList(text, options);
          return { ok: true, kind: "list", parsed, built: buildTerms(parsed) } as const;
        })();
  if (!result.ok) return result;

  if (result.built.terms.length === 0) return { ok: false, problem: { message: NO_TERMS_MESSAGE } };
  if (result.built.terms.length > MAX_IMPORT_TERMS) {
    return { ok: false, problem: { message: overLimitMessage(result.built.terms.length) } };
  }
  return result;
}
