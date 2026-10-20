import { TOUR_CHAPTERS } from "./chapters";
import type { TourState } from "./state";
import type { TourTargetId } from "./targets";

/** The guided walk used to lead from Library to Read, Review and Quiz. Those
 *  are no longer nav links, and Goals and Me have no chapters yet, so the walk
 *  ends after Library. Their own chapters still run when those pages open. */
export type TourWalkStop = {
  route: string;
  label: string;
  target: TourTargetId;
  blurb: string;
};

export const TOUR_WALK: readonly TourWalkStop[] = [
  {
    route: "/app/library",
    label: "Library",
    target: "nav-library",
    blurb: "Every collection you've added and all its terms.",
  },
];

function hasUnseenChapterOn(route: string, state: TourState) {
  return TOUR_CHAPTERS.some((chapter) => {
    if (state.seen.includes(chapter.id)) return false;
    const routes: readonly string[] = [chapter.route].flat();
    return routes.includes(route);
  });
}

/** The next page along the walk that still has tips of its own, if any. The
 *  walk is on once Library's collections tip is seen; that's saved, so it
 *  survives a reload. */
export function nextWalkStop(pathname: string, state: TourState): TourWalkStop | null {
  if (state.status === "done" || !state.seen.includes("library")) return null;
  const index = TOUR_WALK.findIndex((stop) => stop.route === pathname);
  if (index === -1) return null;
  return TOUR_WALK.slice(index + 1).find((stop) => hasUnseenChapterOn(stop.route, state)) ?? null;
}
