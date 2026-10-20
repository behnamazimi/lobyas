import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { SharedCollection } from "@/lib/terms/types";

type Client = SupabaseClient<Database>;
type Group = "builtin" | "community" | undefined;

/** Community browse hides collections you own. Built-in browse lists them. */
export function hidesOwnedRows(group: Group): boolean {
  return group !== "builtin";
}

/** Owned built-ins count as in the library. They have no membership row. */
export function browseLibraryIds(
  membershipIds: readonly string[],
  ownedBuiltinIds: readonly string[],
  group: Group,
): string[] {
  if (hidesOwnedRows(group)) return [...membershipIds];
  return [...new Set([...membershipIds, ...ownedBuiltinIds])];
}

export async function fetchOwnedBuiltinIds(client: Client, userId: string) {
  const { data, error } = await client
    .from("collections")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_builtin", true)
    .eq("visibility", "shared")
    .is("share_blocked_at", null);

  if (error) throw error;
  return data.map((row) => row.id);
}

export type CollectionRow = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_builtin: boolean;
  love_count: number;
  terms: { count: number }[] | { count: number } | null;
};

function termCount(terms: CollectionRow["terms"]) {
  if (!terms) return 0;
  if (Array.isArray(terms)) return terms[0]?.count ?? 0;
  return terms.count ?? 0;
}

export function mapBrowseCollection(
  row: CollectionRow,
  membership: Set<string>,
  userId: string,
  loved: Set<string>,
  reported: Set<string>,
): SharedCollection {
  const ownedByMe = row.owner_id === userId;
  return {
    id: row.id,
    name: row.name,
    icon: "",
    description: row.description ?? "",
    ownerId: row.owner_id,
    termCount: termCount(row.terms),
    inCollection: membership.has(row.id) && !ownedByMe,
    ownedByMe,
    isBuiltin: row.is_builtin,
    loveCount: row.love_count,
    lovedByMe: loved.has(row.id),
    reportedByMe: reported.has(row.id),
  };
}
