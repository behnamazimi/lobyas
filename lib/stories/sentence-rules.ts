import type { CollectionLanguage } from "@/lib/terms/languages";

// The sentence splitter cuts after any full stop followed by a capital, so
// these stops are skipped: titles and initials ("Mr. Smith", "J. K. Rowling"),
// list numbers ("1. First") and, where dates are written that way, ordinals
// ("am 3. Mai").
const TITLE_OR_INITIAL =
  /(?:^|[\s(])(?:\p{Lu}|Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|Sra|Srta|Mme|Mlle|Hr|vs|bijv)\.$/u;
const LIST_NUMBER = /(?:^|\n)\s*\d{1,2}[.)]$/;
const ORDINAL = /\d{1,2}\.$/;
const ORDINAL_LANGUAGES: CollectionLanguage[] = ["de", "tr"];

const DASH_DIALOGUE = /(?:^|[\s.!?…])[—–]\s/;
const DIALOGUE_DASH_AFTER_STOP = /[.!?…]["»”]?\s+(?=[—–]\s)/g;
const ENDS_IN_QUESTION = /[?!]["»”]?\s*$/;
const STARTS_LOWERCASE = /^\p{Ll}/u;

/** True when the text before a cut ends in a full stop that doesn't end a sentence. */
export function isFalseStop(before: string, language: CollectionLanguage): boolean {
  const text = before.trimEnd();
  return (
    TITLE_OR_INITIAL.test(text) ||
    LIST_NUMBER.test(text) ||
    (ORDINAL_LANGUAGES.includes(language) && ORDINAL.test(text))
  );
}

/** Where a dash opens a new line of dialogue ("— Vienes? — Sí."); the splitter
 *  leaves these in one sentence. */
export function dialogueCuts(text: string): number[] {
  return [...text.matchAll(DIALOGUE_DASH_AFTER_STOP)].map((match) => match.index + match[0].length);
}

/** In dash dialogue a lowercase word after "?" or "!" is a speech tag ("— Vieni?
 *  disse."), which stays with its quote. */
export function isDialogueTag(text: string, cut: number): boolean {
  return (
    DASH_DIALOGUE.test(text) &&
    ENDS_IN_QUESTION.test(text.slice(0, cut)) &&
    STARTS_LOWERCASE.test(text.slice(cut))
  );
}
