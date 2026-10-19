/** Width of a term in "letters": CJK characters are drawn twice as wide. */
export function termWeight(text: string): number {
  let weight = 0;
  for (const char of text) weight += (char.codePointAt(0) ?? 0) > 0x2e80 ? 2 : 1;
  return weight;
}

type TermTitleVariant = "front" | "back";

/** Tailwind size classes for a term title, shrinking as the term gets longer.
 *  Written out in full so Tailwind sees every class. */
export function termTitleClass(text: string, variant: TermTitleVariant = "front"): string {
  const weight = termWeight(text);
  if (variant === "back") return weight <= 20 ? "text-[26px]" : "text-[22px]";
  if (weight <= 12) return "text-[46px]";
  if (weight <= 20) return "text-4xl";
  if (weight <= 30) return "text-[30px]";
  return "text-[26px]";
}

/** Same idea for a collection name in a page title. */
export function collectionTitleClass(name: string): string {
  const length = Array.from(name).length;
  if (length <= 12) return "text-[34px]";
  if (length <= 20) return "text-[28px]";
  return "text-2xl";
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
