import type { Tone } from "@/components/kit/tones";
import type { CollectionKind } from "@/lib/terms/kinds";

export function collectionLetter(name: string): string {
  const char = Array.from(name.trim())[0];
  return char ? char.toLocaleUpperCase() : "L";
}

export function collectionTone(kind: CollectionKind): Tone {
  return kind === "vocabulary" ? "read" : "neutral";
}
