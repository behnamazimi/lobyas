/** Width of a term in "letters": CJK characters are drawn twice as wide. */
export function termWeight(text: string): number {
  let weight = 0;
  for (const char of text) weight += (char.codePointAt(0) ?? 0) > 0x2e80 ? 2 : 1;
  return weight;
}

type TermTitleVariant = "front" | "back";

/** The longest run with no space. A title wraps on spaces, so this is what has to fit. */
function longestWordWeight(text: string): number {
  let longest = 0;
  for (const word of text.split(/\s+/)) {
    if (word) longest = Math.max(longest, termWeight(word));
  }
  return longest;
}

/** 0 is the largest. A long word steps down even when the whole term is short. */
function frontStep(text: string): number {
  const total = termWeight(text);
  const word = longestWordWeight(text);
  const fromTotal = total <= 12 ? 0 : total <= 20 ? 1 : total <= 30 ? 2 : 3;
  const fromWord = word <= 10 ? 0 : word <= 14 ? 1 : word <= 17 ? 2 : 3;
  return Math.max(fromTotal, fromWord);
}

/** Tailwind size classes for a term title, shrinking as the term gets longer.
 *  The line height is part of the size class: a separate `leading-*` before a
 *  font-size class is dropped by tailwind-merge. Written out in full so Tailwind
 *  sees every class. */
export function termTitleClass(text: string, variant: TermTitleVariant = "front"): string {
  if (variant === "back") {
    const fits = termWeight(text) <= 20 && longestWordWeight(text) <= 16;
    return fits ? "text-[26px]/[1.1]" : "text-[22px]/[1.1]";
  }
  const step = frontStep(text);
  if (step === 0) return "text-[46px]/[1.08]";
  if (step === 1) return "text-4xl/[1.08]";
  if (step === 2) return "text-[30px]/[1.08]";
  return "text-[26px]/[1.08]";
}

/** Same idea for a collection name in a page title. Leading is 1.25 on every size. */
export function collectionTitleClass(name: string): string {
  const length = Array.from(name).length;
  if (length <= 12) return "text-[34px]/[1.25]";
  if (length <= 20) return "text-[28px]/[1.25]";
  return "text-2xl/[1.25]";
}

/** Size class for the definition at the top of a term body. */
export function definitionClass(definition: string): string {
  const length = definition.length;
  if (length > 160) return "text-lg";
  if (length > 90) return "text-[19px]";
  return "text-[21px]";
}

/** 1,024 and 12,480: grouped the same on every device. */
export function formatCount(value: number): string {
  return value.toLocaleString("en");
}

export const CLAMP_ONE_LINE = "truncate";
export const CLAMP_TWO_LINES = "line-clamp-2 [overflow-wrap:anywhere]";
