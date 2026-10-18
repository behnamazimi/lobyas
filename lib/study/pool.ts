import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { TermCard } from "@/lib/terms/term-card";
import type { StudyScope } from "./types";

type Client = SupabaseClient<Database>;

/** Quiz's dedicated pool fetch: ranked by R_g(t) ascending. Terms with no
 *  Quiz history yet are ranked at UNTESTED_RECOGNITION_RETRIEVABILITY (§5) so they can
 *  receive their first answer. */
export async function fetchQuizTermPool(
  client: Client,
  userId: string,
  scope: StudyScope,
  limit: number,
): Promise<TermCard[]> {
  const { pickQuizTerms } = await import("@/lib/trace-queue");
  return pickQuizTerms(client, userId, scope, limit);
}
