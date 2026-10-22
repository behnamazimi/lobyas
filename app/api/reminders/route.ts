import { NextResponse } from "next/server";
import { requireAuthenticatedClient } from "@/lib/auth/require-session";
import { getRequestGoalSettings } from "@/lib/goals/settings";

/** The reminders the app arms on this device. A route rather than a Server
 *  Action because the app reads it on launch and every time it comes back. */
export async function GET() {
  const auth = await requireAuthenticatedClient();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const { reminders } = await getRequestGoalSettings(auth.user.id);
    return NextResponse.json({ reminders }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Loading reminders failed:", err);
    return NextResponse.json({ error: "Couldn't load reminders." }, { status: 500 });
  }
}
