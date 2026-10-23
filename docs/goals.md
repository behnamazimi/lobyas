# Daily goals

Daily goals let a learner set a pace for Read, Review, and Quiz in each
collection, see roughly when that collection would be mastered at that pace,
and get a lobya celebration the moment a day's goal is met. This page covers
where the data lives, how a celebration is decided, and how the forecast works.

Goals belong to a collection. A collection without a row has no goals, and
studying in it counts toward nothing.

## What a goal counts

A goal counts distinct terms of its collection on the learner's local day, the
same numbers the streak history shows. It uses the same day boundary as the
streak. `goal_day_counts(user, collection)` reads them from `review_state`'s
last-read, last-reviewed, and last-quizzed stamps, joined to `terms` for the
collection (only rows touched in the last two days are joined), not from the
`review_events` log, so goals keep working if that log is ever dropped. There
are no counters to write on the study path. Without a collection it counts
every collection, which the mastery overview uses. Only the forecast's personal success
rates read the log, and they fall back to the defaults without it.

- **Read:** terms read, including Stories and the widget.
- **Review:** cards graded (reveals don't count).
- **Quiz:** questions answered (practice rounds don't count).

Every tier is optional. The presets are Light, Steady, and Intense (Read and
Review 10/20/40, Quiz 5/10/20), and the stepper moves in steps of 5. The
lobya's pose follows the nearest preset (`lib/goals/levels.ts`). Goals never
affect the streak.

## Where it lives

The feature is spread across a few small modules, all under `goals` names.

| Path                                                      | What it holds                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| `supabase/migrations/20261114100000_collection_goals.sql` | The `collection_goals` table, the goal RPCs and triggers            |
| `lib/goals/`                                              | Levels, progress math, settings repository, and the forecast loader |
| `lib/trace/forecast.ts`                                   | The pure forecast simulation                                        |
| `app/(private)/app/goals/`                                | The page and its server actions                                     |
| `components/goals/`                                       | The page UI, the live store, and the celebration sheet              |
| `components/illustrations/scenes/goal-*.tsx`              | The lobya team poses and the celebration scene                      |

`collection_goals` has one row per member and collection that has goals (a
column per tier, null for off), plus `celebrated_on` and `celebrated_tiers`,
which record the tiers already celebrated on one local date. A row with every
tier off is deleted. `user_settings.goal_celebrate` turns the celebration off
for all collections, and `user_settings.new_collection_goals` is what a
collection starts with when the member adds or creates it (null: no goals).

The Goals page edits the current collection (`lib/goals/current.ts`). A switch,
"Use these goals in every collection", widens the save. It copies only the tiers
the learner changed (every tier when none changed) to each collection in the
library through `my_save_collection_goals`, and merges them into
`new_collection_goals`. Triggers copy that default to a collection when it is
created or added, and delete a collection's row when the member leaves it.
Turning every tier off for all collections clears the default.

## How a celebration is decided

The server decides, so a celebration shows once per tier per day across all
tabs and devices. No write action returns today's counts, and Read and Stories
write after their response, so the browser only asks when a goal looks met.

1. `GoalsIsland` (mounted in the root layout) seeds `goal-store.ts` with the
   current collection's goals, today's counts, and the tiers already
   celebrated. The store keeps one entry per collection. A study screen that
   reports a collection it doesn't have yet makes the store load it from
   `GET /api/goals/day` (`ensureGoalCollection`); credits wait until it
   arrives. The tracker is keyed by user and resets the store when it
   unmounts, so signing out and back in on the same tab starts clean.
2. Study code calls `tickGoal(collectionId, tier, termId)` after each term it
   credits. The store counts each term once per collection, tier and tab.
3. When today's count plus this tab's ids reaches the goal, the store calls
   `claimGoalCelebrationAction`. The `my_claim_goal_celebration` RPC locks that
   collection's row, recounts for the collection's terms, and records the tier
   only if the goal is met, so a wrong collection id from the browser can't
   award a celebration.
4. Every answer carries the server's counts, which replace the store's. The
   terms sent with that claim are dropped, so a term the server had already
   counted before the page loaded can't keep a goal looking met. If the claim
   fails (a read may still be in flight), the store asks again up to three times,
   1.5 seconds apart, then waits for the next credit.
5. A true claim queues a celebration; `GoalCelebrationDialog` shows them one
   at a time over the current screen, naming the collection: a full-height
   sheet on a phone and a dialog from `md`. A screen can hold a tier's
   celebration by mounting `HoldGoalCelebration`: the quiz holds "quiz"
   while questions are on screen, so it opens on the results, and Read cards
   hold "read" while a card shows its back, so it opens on the next card's front.

Running out of terms counts as meeting the goal. `ReadCaughtUp` takes a `goal`
prop and calls `goalCaughtUp(collectionId, tier)` when the collection is caught
up and something was studied in that tier today. Editing goals never celebrates
by itself, but raising a tier's goal (or turning it back on) clears its
celebrated mark for today on that collection (`set_collection_goal_tiers`), so
reaching the higher goal celebrates again. Lowering or turning a goal off
leaves it.

To credit a new study surface, call `tickGoal` once the term is recorded.

## How the forecast works

The forecast plays TRACE forward one day at a time for the collection being
edited. Each day it picks the top N terms per tier with the real ranking
functions and applies the real update functions, using that collection's goals
as N. A term counts as mastered on the same rule
that stamps `ever_mastered_at`: a successful answer that leaves it known.

- Grades come from a seeded random sequence, using the learner's own Review
  success rate and grade mix and Quiz success rate once there's enough
  history, or 85% before that.
- Three runs give the date range. The horizon is 365 days; past it, the row says
  "Over a year." Each row shows the later end of the range.
- Mastered needs both Review and Quiz (Read alone tops out far below the known
  line), so the forecast asks for whichever is off instead of showing dates.

A run stops early when nothing that's left can finish in time: no collection
fits in the answers left, nothing was mastered for 90 days, or, from day 60,
every unfinished collection's recent pace already lands well past the year.
Pace only slows as fewer new terms are left, so that last check doesn't cut
off a collection that would have finished. A forecast for 4,000 terms takes
under a second in most cases, and the page asks for one 400 ms after the last
change.

## Next steps

- Read [TRACE](./trace.md) for the ranking and mastery rules the forecast
  replays.
- Read [Page promos](./promos.md) for the `goals` promo that points new
  learners at the page.
