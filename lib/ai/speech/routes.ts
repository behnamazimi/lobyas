import type { CollectionKind } from "@/lib/terms/kinds";

/** What is narrated decides which provider is tried first. */
export const NARRATION_ROUTES = ["vocab_term", "term", "story"] as const;
export type NarrationRoute = (typeof NARRATION_ROUTES)[number];

export const ROUTE_LABELS: Record<NarrationRoute, string> = {
  vocab_term: "Words and phrases",
  term: "Field terms",
  story: "Stories",
};

export function routeForCollection(kind: CollectionKind): NarrationRoute {
  return kind === "vocabulary" ? "vocab_term" : "term";
}
