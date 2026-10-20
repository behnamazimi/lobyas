"use server";

import { revalidatePath } from "next/cache";

/** Tab pages are kept in the browser for a minute (`staleTimes` in
 *  next.config.ts). Leaving a study screen drops them, so Home, Library and
 *  Goals show what was just studied. Study answers don't do this themselves:
 *  it would re-render the study page on every answer. */
export async function refreshAfterStudyAction() {
  revalidatePath("/app", "layout");
}
