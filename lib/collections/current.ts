import type { Collection } from "@/lib/terms/types";

/** Cookie holding the app's current collection. Existing Library visits already
 *  stored it under this name, so those users keep their collection. */
export const CURRENT_COLLECTION_COOKIE = "lb_lib_collection";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The collection the Library shows: the one asked for, else the one last
 *  viewed, else the first active one, else the first. A paused id is kept. */
export function pickLibraryCollectionId(
  collections: Pick<Collection, "id" | "isActiveForReview">[],
  options: { requestedCollectionId?: string | null; lastCollectionId?: string | null },
): string | undefined {
  const has = (id: string | null | undefined): id is string =>
    Boolean(id) && collections.some((collection) => collection.id === id);
  if (has(options.requestedCollectionId)) return options.requestedCollectionId;
  if (has(options.lastCollectionId)) return options.lastCollectionId;
  return (collections.find((collection) => collection.isActiveForReview) ?? collections[0])?.id;
}

/** A collection id from the cookie, or null when it is missing or not an id.
 *  `"all"` is not a current collection. */
export function parseCurrentCollectionId(value: string | undefined): string | null {
  if (!value) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  return UUID_RE.test(decoded) ? decoded : null;
}

/** Writes the current collection in the browser. No network, so it is not a
 *  Server Action. `"all"` and anything that is not an id are ignored. */
export function setCurrentCollection(collectionId: string): void {
  if (typeof document === "undefined" || !UUID_RE.test(collectionId)) return;
  document.cookie = `${CURRENT_COLLECTION_COOKIE}=${collectionId}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/** What a study page opens on before it knows which collections are active.
 *  A stored `"all"` is skipped. The page refetches when the real pick differs. */
export function speculativeAppCollection(
  collectionParam: string | undefined,
  currentId: string | null,
  rememberedId: string | null,
): string {
  if (collectionParam === "all") return "all";
  if (collectionParam && UUID_RE.test(collectionParam)) return collectionParam;
  if (currentId) return currentId;
  if (rememberedId && rememberedId !== "all" && UUID_RE.test(rememberedId)) return rememberedId;
  return "all";
}

/** The collection a study page opens on. A real `?collection=` wins, then the
 *  app cookie, then that page's own real collection, then the first active.
 *  `?collection=all` mixes collections for this visit only. A stored `"all"`
 *  is skipped. A paused or removed id is skipped and kept. */
export function resolveAppCollection(input: {
  collectionParam: string | undefined;
  currentId: string | null;
  rememberedId: string | null;
  activeIds: readonly string[];
}): string {
  const { collectionParam, currentId, rememberedId, activeIds } = input;
  if (collectionParam === "all") return "all";
  if (collectionParam && activeIds.includes(collectionParam)) return collectionParam;
  if (currentId && activeIds.includes(currentId)) return currentId;
  if (rememberedId && rememberedId !== "all" && activeIds.includes(rememberedId)) {
    return rememberedId;
  }
  return activeIds[0] ?? "all";
}
