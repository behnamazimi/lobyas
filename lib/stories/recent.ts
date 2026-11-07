import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { toVote } from "./repository";
import type { StoryVote } from "./types";

type Client = SupabaseClient<Database>;

const RECENT_TITLE_LIMIT = 3;
const RECENT_VOTE_LIMIT = 50;

export async function loadRecentTitles(
  admin: Client,
  userId: string,
  collectionId: string,
): Promise<string[]> {
  const { data, error } = await admin
    .from("stories")
    .select("title")
    .eq("user_id", userId)
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false })
    .limit(RECENT_TITLE_LIMIT);
  if (error) throw error;
  return (data ?? []).map((row) => row.title);
}

const RECENT_STORY_TERM_LIMIT = 2;
const RECENT_STORY_TERM_DAYS = 14;

/** The terms used in the user's latest stories for a collection, newest story
 *  first, so a new story doesn't offer them again straight away. */
export async function loadRecentTermGroups(
  admin: Client,
  userId: string,
  collectionId: string,
  now = new Date(),
): Promise<string[][]> {
  const since = new Date(now.getTime() - RECENT_STORY_TERM_DAYS * 24 * 60 * 60 * 1000);
  const { data, error } = await admin
    .from("stories")
    .select("term_ids")
    .eq("user_id", userId)
    .eq("collection_id", collectionId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(RECENT_STORY_TERM_LIMIT);
  if (error) throw error;
  return (data ?? []).map((row) => row.term_ids);
}

export async function loadRecentVotes(admin: Client, userId: string): Promise<StoryVote[]> {
  const { data, error } = await admin
    .from("stories")
    .select("format, tone, vote, created_at")
    .eq("user_id", userId)
    .not("vote", "is", null)
    .order("created_at", { ascending: false })
    .limit(RECENT_VOTE_LIMIT);
  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const vote = toVote(row.vote);
    return vote
      ? [{ format: row.format, tone: row.tone, vote, createdAt: new Date(row.created_at) }]
      : [];
  });
}
