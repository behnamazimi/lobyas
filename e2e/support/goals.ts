import { sql } from "./db";

export type StoredGoals = { read: number | null; review: number | null; quiz: number | null };

/** Gives a collection daily goals, the way saving them on the Goals page does. */
export async function setCollectionGoals(
  userId: string,
  collectionId: string,
  goals: Partial<StoredGoals>,
) {
  await sql(
    `insert into public.collection_goals (user_id, collection_id, read_goal, review_goal, quiz_goal)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id, collection_id) do update
     set read_goal = excluded.read_goal, review_goal = excluded.review_goal,
         quiz_goal = excluded.quiz_goal`,
    [userId, collectionId, goals.read ?? null, goals.review ?? null, goals.quiz ?? null],
  );
}

export async function storedGoals(userId: string, collectionId: string) {
  const [row] = await sql<{ read: number | null; review: number | null; quiz: number | null }>(
    `select read_goal as read, review_goal as review, quiz_goal as quiz
     from public.collection_goals where user_id = $1 and collection_id = $2`,
    [userId, collectionId],
  );
  return row ?? null;
}
