/** Every element a tour step can point at. Mark the element in markup with
 *  `data-tour="<id>"`; when a phone and a desktop version share an id, the
 *  visible one is used. */
export const TOUR_TARGETS = [
  "app-streak",
  "app-account",
  "nav-home",
  "nav-library",
  "nav-goals",
  "nav-me",
  "library-browse",
  "library-import",
  "library-collections",
  "library-search",
  "library-term",
  "library-actions",
  "review-collection",
  "review-card",
  "review-grades",
  "read-card",
  "read-modes",
  "read-options",
  "stories-level",
  "stories-write",
  "quiz-style",
  "triage-card",
  "triage-actions",
  "browse-filters",
  "browse-add",
  "import-search",
  "import-routes",
  "settings-ai",
] as const;

export type TourTargetId = (typeof TOUR_TARGETS)[number];
