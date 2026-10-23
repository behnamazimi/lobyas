import { NextResponse, type NextRequest } from "next/server";
import { readVerifiedUser } from "@/lib/auth/verified-user-header";
import { parseCurrentCollectionId } from "@/lib/collections/current";
import { loadGoalDay } from "@/lib/goals/settings";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** One collection's goals and today's progress, for a study screen that opens
 *  a collection the page didn't load goals for. A GET, so it never queues
 *  behind a Server Action. */
export async function GET(request: NextRequest) {
  const user = await readVerifiedUser(request.headers);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  const collectionId = parseCurrentCollectionId(
    request.nextUrl.searchParams.get("collection") ?? "",
  );
  if (!collectionId) {
    return NextResponse.json({ error: "Invalid collection." }, { status: 400, headers: NO_STORE });
  }

  try {
    const supabase = await createClient();
    const [day, collection] = await Promise.all([
      loadGoalDay(supabase, collectionId),
      supabase.from("collections").select("name").eq("id", collectionId).maybeSingle(),
    ]);
    return NextResponse.json({ day, name: collection.data?.name ?? "" }, { headers: NO_STORE });
  } catch (error) {
    console.error("Couldn't load goals:", error);
    return NextResponse.json({ error: "Couldn't load goals." }, { status: 500, headers: NO_STORE });
  }
}
