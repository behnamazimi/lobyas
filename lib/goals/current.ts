import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CURRENT_COLLECTION_COOKIE, parseCurrentCollectionId } from "@/lib/collections/current";
import { loadLibraryCollections } from "@/lib/library/load";
import type { Database } from "@/lib/supabase/database.types";

export type GoalCollection = { id: string; name: string };

/** The collection goals apply to: the current one, or the first active one
 *  when the cookie names nothing usable. Null when nothing is active. */
export async function loadGoalCollection(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<GoalCollection | null> {
  const [library, cookieStore] = await Promise.all([
    loadLibraryCollections(client, userId),
    cookies(),
  ]);
  const active = library.collections.filter((collection) => collection.isActiveForReview);
  const currentId = parseCurrentCollectionId(cookieStore.get(CURRENT_COLLECTION_COOKIE)?.value);
  const picked = active.find((collection) => collection.id === currentId) ?? active[0];
  return picked ? { id: picked.id, name: picked.name } : null;
}
