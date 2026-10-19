# Redesign plan

This plan breaks the app redesign into phases that agents can plan and build
one at a time. Each phase lists the design frames to follow, the code it
replaces, the behavior it must keep, and what it hands to the next phase. Read
the shared sections first, then only the phase you're working on.

## Source of truth

The design lives on a canvas, and the code stays the source of truth for
behavior. When the two disagree, keep the behavior and restyle it.

- **Canvas:** <https://claude.ai/artifact/McWgeRZ4cGcjzYYPshRsuP>. Read it
  with the Artifact tool (`action: "read"`, then `scope: "files"` and a file
  `path`). Each frame is one `project/<Name>.dc.html` file; phases below refer
  to frames by that name. Frames are mockups: copy their layout, spacing,
  color and copy, not their markup.
- **Behavior:** the current code and the docs `AGENTS.md` links to. A frame
  never adds a feature the code doesn't have unless a phase says so.
- **Placeholders:** the canvas shows `[N]`, `[cost]`, `[date]` and
  `[Refill schedule]` where the real value comes from data. Use the real value.

<!-- prettier-ignore -->
> [!IMPORTANT]
> Where a frame and a decision below disagree, the decision wins. The canvas
> was drawn before these decisions were made.

## Decisions

These choices are settled. Don't reopen them in a phase.

| Topic             | Decision                                                                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review grades     | Keep the four grades: Again, Hard, Good, Easy. Restyle them as four pressable tiles in the canvas style. The canvas shows three (Missed, Hard, Got it); ignore that.                                                                   |
| Review intervals  | Keep the **Show when terms come back** option and its current default. When it's on, a tile shows its interval as a small second line.                                                                                                 |
| Mixed collections | Drop **All active collections** from Read, Review, Quiz and Stories. Every study screen works on the current collection. Telegram and the widget don't change.                                                                         |
| Read reveal       | Keep today's behavior. A card opens with the definition hidden, and **Show definitions right away** in Read options stays off by default. The canvas Read frames show the revealed state.                                              |
| Term fields       | Every surface that shows a term body shows every field the term has, in today's order and with today's per-language labels. The learner's term layout (`TermBlock` placement under **More**) still applies in Read, Review and Triage. |
| Navigation        | Four destinations: Home, Library, Goals, Me. Read, Review and Quiz open from Home and the Library. Everything in today's **More** sheet moves into **Me**.                                                                             |
| Home              | `/app` becomes the Home path (it redirects to `/app/library` today). The current collection is app-wide.                                                                                                                               |
| Goals             | Every goal stays optional. Home must feel complete with none set. No "due", "overdue", "in N days" or "finish your queue" copy anywhere.                                                                                               |
| Goal celebration  | Keep the server claim flow in `docs/goals.md`. The celebration is the **Goal met** frame: a full-height sheet on phone and a dialog on desktop, over the current screen.                                                               |
| Stack             | Next.js (this repo's version), Tailwind 4 and DaisyUI 5 components, React Aria where the app already uses it, lucide stroke icons. No new UI library.                                                                                  |

## Ground rules for every phase

Every agent follows these rules on top of `AGENTS.md`.

- Read `AGENTS.md` and the docs it links for the area you touch before you
  change code. Many features have rules that a restyle can break, for example
  `saveInBackground`, Library overrides, the tour's `data-tour` targets and the
  term layout portal.
- Don't change server actions, routes, RPCs, TRACE or the database to make a
  screen look like a frame. A phase that needs new data says so and names the
  function to add.
- Build every screen from the shared kit in Phase 0. If you need a new
  building block, add it to the kit with its own story on the kit page, then
  use it.
- Use DaisyUI component classes (`btn`, `card`, `toggle`, `tabs`, `modal`,
  `dock`, `menu`, `badge`, `progress`, `radial-progress`) with the theme
  tokens. Don't hard-code hex colors in components.
- Lobyas (the characters) appear only in empty and first-time states,
  celebrations, status pages and the brand mark. Never on study cards, as
  progress meters or in navigation. Use the scenes in
  `components/illustrations/` and follow the illustration rules in
  `AGENTS.md`.
- Copy says "terms", never names an admin, never implies automation, and uses
  no exclamation marks except in celebrations.
- Every tap target is at least 44 px. Text contrast is at least 4.5:1 in both
  themes.
- Run `pnpm check` before you finish. Run `pnpm test:e2e:smoke` when you touch
  a flow it covers, and update the specs the phase lists.

## Branches and merging

The redesign ships as one release through an integration branch, so `main`
never shows a half-old, half-new app.

1. Phase 0 creates `redesign` from `main`.
2. Each phase works on `redesign/<phase>-<name>` (for example,
   `redesign/p3-read`) cut from the latest `redesign`, and opens a PR into
   `redesign`.
3. Merge `main` into `redesign` at least weekly so the final merge is small.
4. Phase 11 merges `redesign` into `main`.

Inside `redesign`, a phase replaces old screens in place. Phases that run at
the same time must not edit the same files; the dependency map below shows
which ones can.

## Responsive rules

The design is drawn at 390 × 844. It must also work well on tablets and
desktop. Every phase follows these rules instead of inventing its own.

| Width                          | Navigation                                                                                    | Content                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Phone, under `md` (768 px)     | Bottom tab bar on Home, Library, Goals and Me. Study screens hide it and show a close button. | One column, 20 px side padding. Primary actions pinned above the safe area.                                  |
| Tablet, `md` to `lg`           | Bottom tab bar stays.                                                                         | One column, max width 640 px, centered.                                                                      |
| Desktop, `lg` (1024 px) and up | Left rail with the four destinations, the collection switcher and the streak.                 | Pages use a 1120 px container. Study screens use a centered 640 px column; the card's height caps at 760 px. |

The `HomeDesktop` frame (1440 × 900) is the reference for the desktop chrome
and page layout. It shows the rail (brand mark, collection switcher with its
popover, the four destinations, the streak card and the account row) and
Home's two-pane layout. Every desktop page uses the same rail and container.
In the frame the rail scrolls with the page because the canvas can't pin it;
in the app it stays fixed to the window height while the page scrolls.

Desktop conventions that apply everywhere:

- **Sheets** become centered dialogs (max width 480 px). Short menus
  (term actions, add terms) become DaisyUI dropdowns anchored to their
  button.
- **Two-pane where it helps:** Home shows the path with a right column for
  today's goals and the current collection. Library shows the term list with
  the term detail in a right panel instead of a sheet.
- **Pinned bottom actions** sit under the content instead of at the screen
  edge.
- **Keyboard:** keep every shortcut that exists today (for example, Enter in
  Read and the Quiz keyboard hints).

## Pages without a frame

Some screens have no frame (for example, the export guides under
`/app/import/apps/[app]`, `/app/import/more`, the shared link page `/c/…` in
app chrome, and the Mastery **Terms** tab). Build them with the same kit and
the nearest frame's layout:

- A list or settings page follows **Settings** (`Settings`): back button,
  serif title, white section cards with rows.
- A step in a flow follows **Paste a list** (`Paste`): step bar, one column,
  pinned primary action.
- A detail view follows **Term, every field** (`TermDetailSheet`).
- An empty or error state uses the shared empty state with a lobya scene.

Admin pages (`/admin`) and the public site keep their current look. They only
need to keep working inside the new shell.

## Dependency map

Phase 0 and Phase 1 run first, in order. After that, the phases in the middle
row can run in parallel because they touch different files.

```text
P0 Kit  ->  P1 Shell  ->  P2 Home, P3 Read, P4 Review, P5 Quiz,
                          P7 Library, P8 Adding terms, P9 Goals and Me,
                          P10 Status pages
                     ->  P6 Triage and celebration (after P3, P4 and P5)
                     ->  P11 Hardening and merge (last)
```

## Phase 0: Kit and scaffolding

This phase builds the shared building blocks and tokens, so every later phase
assembles screens instead of styling them.

**Frames:** all of them, for tokens; `TermBody` for the term body; the sheets
for the sheet frame; `HomeDim` for the dim theme.

**Work:**

1. Create the `redesign` branch.
2. Update the two DaisyUI themes in `app/globals.css` (keep their names
   `emerald` and `dim` so nothing else changes):
   - Base: page `#F7F4EE` (`base-200`), card `#FFFFFF` (`base-100`), line
     `#ECE6DA` (`base-300`), ink `#2A2420` (`base-content`), muted text
     `#6F675D`.
   - Add mode colors as theme variables with a solid, tint and text step:
     Read blue (`#4F8FF0`, `#E4EDFD`, `#2A62C0`), Review coral (`#F2907F`,
     `#FCE6E2`, `#8F3626`), Quiz purple (`#B794EE`, `#EEE5FA`, `#5B34A0`), and
     success green (`#6FCF9A`, `#DDF4E7`, `#14563A`). Ring arcs use the
     deeper steps from the canvas (`#2F6FD6`, `#D9604B`, `#8E62D9`).
   - Dim values come from the `HomeDim` frame (`Main.dc.html`, the `dim`
     branch of its token object).
   - Radii: cards 24 to 30 px, controls fully rounded. Shadows: the soft
     two-layer shadow from the frames.
3. Load Fraunces at weight 800 for titles and the term on a card, and keep
   Figtree for everything else. Add a fallback stack for Japanese, Chinese and
   Korean terms.
4. Add the kit under `components/kit/`. Each item gets a short props comment
   and one story on the kit page:
   - **Shell parts:** tab bar, desktop rail, page header (back, serif title,
     action slot), study top bar (close, collection chip, goal pill).
   - **Surfaces:** card, section card, tinted tile, list row (icon tile,
     label, subline, trailing slot), divider.
   - **Controls:** primary pill (ink), secondary pill (white), danger pill,
     icon button, segmented control, toggle row, radio list, chip with count,
     stepper.
   - **Progress:** progress ring (goal), bar, segmented quiz progress, mastery
     stack (mastered, learning, not started).
   - **Sheet:** bottom sheet on phone and dialog on desktop, with a handle,
     title, optional subline, close button and a scrolling body.
   - **Study parts:** study card (scrolls inside, footer pinned), grade tiles
     (four), answer option (default, picked, correct, wrong), feedback note
     (correct, wrong, skipped), Listen button.
   - **Term body:** one component that renders every field with today's
     labels from `lib/terms/term-labels.ts` and supports placements under
     **More**. It replaces the rendering in `components/terms/term-body.tsx`
     and `study-term-body.tsx` without changing their props or the layout
     rules in `AGENTS.md`.
   - **Text helpers:** term title sizing (by length, CJK counted double),
     number formatting with grouping, one- and two-line clamps.
   - **States:** empty state, status page, skeleton.
5. Add a kit page at `/admin/kit` (admin only, behind
   `requireAdminPage()`) that renders every kit item in both themes, with long
   and short content.

**Keep:** both theme names, the theme toggle, the `standalone`, `coarse` and
`native-app` variants, and the safe-area utilities.

**Exit criteria:** the kit page renders every item in both themes at 390 px
and 1280 px; `pnpm check` passes; no existing page changes behavior.

**Hand off:** the kit's file list and import paths, the token names, and any
item that still needs a decision.

## Phase 1: App shell and navigation

This phase replaces the app chrome with the new navigation and makes the
current collection app-wide, so every later page plugs into it.

**Frames:** `Main` (tab bar), `HomeDesktop` (rail), `Me`, `Switcher`,
`Streak`.

**Existing code:** `components/app-chrome.tsx`, `components/app-shell.tsx`,
`components/app/study-phone-*`, `components/streak-badge.tsx`,
`components/streak-modal.tsx`, `lib/chrome.ts`, `lib/redirects.ts`,
`lib/library/pick-collection.ts` (`lb_lib_collection`), `lib/tour/`.

**Work:**

1. Build the tab bar (phone and tablet) and the desktop rail with Home,
   Library, Goals and Me. Study routes (`/app/read`, `/app/review`,
   `/app/quiz`, `/app/triage`) hide the tab bar and show the study top bar.
2. Make the current collection app-wide. Promote `lb_lib_collection` to the
   app's current collection, with the same pick rules. Read, Review, Quiz,
   Stories and Triage default to it; a `?collection=` link still wins and
   updates it.
3. Point `/app` at a placeholder Home page (Phase 2 fills it) instead of
   redirecting to the Library.
4. Build the **Me** page as a plain list of today's **More** actions, without
   a Goals row (Goals is a tab): Mastery, Browse, Add a collection, Settings,
   Admin panel (admins only), Install, Report an issue, Light/Dim, credits,
   Log out, and the footer links. Phase 9 replaces the list with the Me frame.
5. Restyle the streak pill and the streak history sheet (`Streak`).
6. Update `lib/tour/` chapters and targets for the new navigation.

**Keep:** the views in `docs/promos.md`, the guided tour, the PWA and native
shell behavior in `docs/mobile.md`, and the account menu's actions.

**Tests:** `study-redirect.spec.ts`, `streak.spec.ts`, `pwa.spec.ts`,
`promos.spec.ts`, `library.spec.ts` (navigation), and `lib/chrome.test.ts`.

**Exit criteria:** you can reach every current page from the new navigation
at phone and desktop widths, and the current collection survives moving
between pages.

**Hand off:** how a page reads and sets the current collection, the shell's
slots, and how a study page opts out of the tab bar.

## Phase 2: Home

This phase builds the path-based Home with and without goals, and adds queue
lines to the collection switcher Phase 1 shipped.

**Frames:** `Main`, `HomeNoGoals`, `HomeDim`, `Switcher`, `HomeLoading`,
`StressHome`, `StressSwitcher`, `HomeDesktop`.

**Existing code:** `lib/goals/` (`loadGoalDay`, `goalProgress`, `metCount`,
`nextOpenTier`), `lib/library/collection-tally.ts`
(`my_progress_state_by_collection`), `lib/library/load.ts`.

**Work:**

1. Load, for the current collection: name, kind, term count and mastered or
   known count; today's progress against each goal; and the queue size for
   Read, Review and Quiz.
2. Queue sizes: Read's "to read" count already exists. If Review and Quiz
   counts don't, add one read-only query next to `collection-tally.ts` that
   returns all three per collection. Don't change TRACE.
3. Build the path: three stops with icon, ring, "x of y today" and "N in
   queue"; the **Continue** pill on the first unmet stop with a queue; a check
   on met goals; and the last stop (the all-goals celebration with goals set,
   the **Set a daily goal** prompt without).
4. A stop with an empty queue opens the empty state (`Empty`).
5. The switcher sheet lists active collections with mastery and queues, plus
   **Add collection**. Paused collections don't appear.
6. Desktop (`HomeDesktop`): a header with the collection name, mastery bar,
   **Add terms** and one primary action that continues the next open goal;
   the path in a white panel on the left; and a right column with today's
   goals (small rings and **Edit pace**) and the collection card (queues,
   **Open in Library**, **Stories**, **Triage**). Below about 1180 px the
   right column moves under the path and its two cards sit side by side.
   The switcher is the rail's popover, not a sheet.

**Keep:** goals optional; no due copy; the celebration claim flow.

**Tests:** add a Home spec (with goals, without goals, switching collection)
tagged `@smoke`.

**Exit criteria:** Home matches the frames with goals, without goals, with an
empty queue, with long names and with many collections, in both themes.

## Phase 3: Read (Cards and Stories)

This phase restyles Read in both modes and adds the term body everywhere Read
shows a term.

**Frames:** `Read`, `ReadNoGoal`, `ReadOptionsSheet`, `TermLayoutSheet`,
`StoriesSetup`, `Story`, `StoryHistorySheet`, `StoriesNoCredits`,
`StoryAudioLimit`, `StressRead`, `StressReadMore`, `StressReadJa`.

**Existing code:** `components/read/`, `components/read/stories/`,
`lib/stories/`, `components/terms/term-narration-player.tsx`,
`components/terms/term-layout-*`, `docs/trace.md` (Stories section),
`docs/ai.md` (narration).

**Work:**

1. Cards: study top bar with the goal pill (or a running count with no goal);
   the term card with the hidden and revealed states, Listen, the term body,
   **Mark as known**; **Next term**. Keep focus mode and the fullscreen feed.
2. Remove the **All active collections** option.
3. Read options sheet with every option that exists today, including the
   listening and shadowing rows.
4. Term layout sheet (**What cards show**) on top of the existing
   `TermLayoutProvider`.
5. Stories: setup, reader with the narration player (Listen with its credit
   cost, play and pause, seek, previous, repeat sentence, speed, shadowing,
   sentence highlight, tap a sentence), term popover, glossary, feedback,
   **Mark as read**, history sheet, and the credit and listening-limit
   states.
6. Caught-up state with `CaughtUpScene`, which still counts toward the goal.

**Keep:** reveal default and every Read option; `recordRead` and `tickGoal`
calls; Stories through `POST /api/stories`; narration access rules and
billing in `lib/stories/narration-billing.ts`.

**Tests:** `read-landing.spec.ts`, `study.spec.ts`, `stories.spec.ts`.

**Exit criteria:** every Read frame, including the long-content ones, matches
in both themes; a term with only a definition shows only a definition.

## Phase 4: Review

This phase restyles Review with the four grades and the full term body on the
revealed side.

**Frames:** `Review`, `ReviewBack`, `ReviewOptionsSheet`, `StressReviewBack`,
`StressReviewDutch`. Use four grade tiles, not the three in the frames.

**Existing code:** `components/review/`, `lib/terms/review-outcome.ts`,
`docs/trace.md`.

**Work:**

1. Front: the term, its category, **Recall the meaning, then tap**.
2. Revealed side: header with the term and Listen, then the full term body,
   scrolling inside the card, with the four grade tiles pinned.
3. **Skip**, Review options (every option that exists today), swipe
   gestures, auto-play narration.
4. Remove **All collections**.
5. The goal pill and the inline **Review goal met** note.

**Keep:** `recordReveal` and `recordTest`, the grade values, intervals behind
their option, and the mastery promo slot.

**Tests:** `study.spec.ts`, `review-options.spec.ts`.

**Exit criteria:** Review frames match with four grades, with and without
intervals, in both themes and both widths.

## Phase 5: Quiz

This phase restyles quiz setup, every question type, feedback and results.

**Frames:** `QuizSetup`, `Quiz`, `QuizCorrect`, `QuizWrong`, `QuizUnsure`
(dictation skipped with **Can't listen now**), `QuizTrueFalse` (does it
fit, yes or no), `QuizTyped`, `Results`, `StressQuiz`.

**Existing code:** `components/quiz/`, `lib/quiz/`,
`docs/quiz-implementation-plan.md`, `docs/quiz-question-design.md`.

**Work:**

1. Setup: Simple or AI with the credit note, question count (5, 10, 20,
   custom). Remove **All active collections**.
2. Question screen: segmented progress, question card (prompt, quote),
   answers by interaction (`choice`, `boolean`, `text`, dictation), **Check**
   then **Next**; the feedback note pinned above the button; the middle area
   scrolls.
3. Results: score, lobya scene by score, missed terms with their details,
   **Quiz again**, **Practice missed (not scored)**, **Change setup**.

**Keep:** templates and builders, grading, the dictation skip, practice
rounds not counting, keyboard hints, session persistence.

**Tests:** `study.spec.ts`, `dictation.spec.ts`, `credits.spec.ts`.

**Exit criteria:** every question type and feedback state matches the frames,
including long options.

## Phase 6: Triage and goal celebration

This phase restyles Triage and moves the goal celebration to the new design.
It runs after Phases 3, 4 and 5 because the celebration opens over their
screens.

**Frames:** `Triage`, `GoalMet`.

**Existing code:** `components/triage/`, `components/goals/goal-celebration-dialog.tsx`,
`components/goals/goal-store.ts`, `docs/goals.md`.

**Work:**

1. Triage: counts (**N left to sort**, **N known**), tap to see the meaning
   with Listen, **Not yet**, **I know this**, **Undo**.
2. Celebration: the **Goal met** layout with today's goals, the next open
   goal as a link, **Done for today** and **Keep going**, the all-goals
   variant, and the lobya that matches the tier (see `goal-team.tsx`).

**Keep:** the claim flow, once per tier per day, and the celebrate toggle.

**Tests:** `goals.spec.ts`, `study.spec.ts` (Triage).

## Phase 7: Library

This phase restyles the Library and every sheet that opens from it.

**Frames:** `Library`, `TermDetailSheet`, `TermActionsSheet`, `DeleteDialog`,
`FiltersSheet`, `AddTermsSheet`, `CollectionActionsSheet`,
`EditCollectionSheet`, `ShareSheet`, `ReportCollectionSheet`.

**Existing code:** `components/library/`, `components/terms/`,
`lib/library/` (`overrides.ts`, `details-store.ts`), `docs/admin.md` (loves,
reports and takedowns).

**Work:**

1. Collection header card: kind and count, mastery bar, description, actions
   (Add terms, Triage, Share, More), and the paused state with **Resume**.
2. Unfinished-terms banner and the **Request definitions** entry where it
   exists today.
3. Search, filters sheet (categories with counts, **Hide terms I know**,
   sort), and the term list with Listen, actions, the known badge and swipe to
   mark known.
4. Term detail: sheet on phone, right panel on desktop, with the full term
   body.
5. Every collection sheet with today's actions, including the added-collection
   variants (love, report, remove).

**Keep:** lean rows with batched details from `GET /api/terms/details`,
`overrideMarkedKnown`, the filters cookie, and the share and moderation rules.

**Tests:** `library.spec.ts`, `share.spec.ts`, `moderation.spec.ts`.

## Phase 8: Adding terms

This phase restyles every way terms get into a collection.

**Frames:** `AddCollection`, `Paste`, `PasteCheck`, `Capture`, `Request`.
The app export guides and the JSON page have no frame; follow the Paste
layout.

**Existing code:** `app/(private)/app/import/`, `app/(private)/app/capture/`,
`components/import/`, `components/capture/`, `components/requests/`,
`docs/import.md`.

**Keep:** no AI in this path, the parser, the 1100-term cap, duplicate
handling, local draft storage, the Android share target, request copy rules
in `lib/requests/copy.ts`, and requests switched off unless enabled.

**Tests:** `import.spec.ts`.

## Phase 9: Goals, Me and account pages

This phase restyles the remaining tab pages and account pages.

**Frames:** `Goals`, `Me`, `Mastery`, `Settings`, `Browse`, `TopUpSheet`,
`ReportIssueSheet`.

**Existing code:** `components/goals/`, `components/mastery/`,
`components/settings/`, `components/library/shared-collections-*`,
`components/issues/`, `components/ai-credits/`.

**Work:**

1. Goals: tier cards with presets (Off, Light, Steady, Intense) and the
   stepper, the forecast, the celebrate toggle. Today's rings move to Home;
   keep a small summary here.
2. Mastery: Overview and Terms tabs. Grading shows the four grades.
3. Settings: AI credits, Telegram, desktop widget, Account.
4. Browse, the AI credits sheet and the report issue sheet.

**Keep:** forecast logic, credit and top-up rules in `docs/ai-credits.md`,
widget setup, account deletion.

**Tests:** `goals.spec.ts`, `settings.spec.ts`, `credits.spec.ts`.

## Phase 10: Status and empty states

This phase restyles the status pages and every empty state.

**Frames:** `Empty`, `Offline`, `Error`, `NotFound`, `HomeLoading`.

**Existing code:** `components/status-page.tsx`, `app/not-found.tsx`,
`app/error.tsx`, `app/~offline`, `components/shared/empty-state.tsx`,
`components/page-skeleton.tsx`.

## Phase 11: Hardening and merge

This phase checks the whole app and merges the redesign into `main`.

1. Walk every route at 390 px, 768 px and 1280 px in both themes, and on the
   iOS and Android shells.
2. Delete dead components and styles, run `pnpm check` (knip catches
   leftovers), and run the full e2e suite.
3. Update `AGENTS.md` and the docs whose described UI changed.
4. Add the redesigned flows to `/features` (`lib/features/sections.ts`).
5. Merge `main` into `redesign`, then `redesign` into `main`.

## Phase handoff template

Every phase ends by adding a note to [Handoffs](#handoffs) in this file, in the
same PR, so the next agent starts from facts instead of guesses. Because each
phase branches from the latest `redesign`, the next agent already has every
earlier note. Copy the note into the PR description too, for review.

Add the note as a `### Phase <N> · <name>` heading with these items:

- What was built, and the kit items added (with import paths).
- Data added (queries, props) and where they live.
- Behavior deliberately left as is, and why.
- Frames that didn't match, and the decision taken.
- Files later phases must not change, or must change with care.
- Open questions for later phases.

Before you start a phase, read the notes of every phase it depends on (see the
[Dependency map](#dependency-map)). Phase 0 and Phase 1 notes apply to every
phase. If a note you need is missing, stop and ask instead of guessing.

## Handoffs

Each phase adds its note here when it merges into `redesign`. Don't edit
another phase's note; add a correction under your own phase.

### Phase 0 · Kit and scaffolding

Branch `redesign-p0-kit` (not `redesign/p0-kit`: git can't hold both `redesign` and
`redesign/…`, so later phases should branch as `redesign-p<N>-<name>`).

**Built.** The `emerald` and `dim` themes carry the new palette, the kit lives in
`components/kit/` (import everything from `@/components/kit`), and `/admin/kit`
shows each item in both themes (Admin, System, Kit). `components/terms/term-body.tsx`
now re-exports the kit term body, so Library, Read, Review and term cards already
use it. Same props and layout rules; the old `term-detail-section.tsx` and
`term-more-footer.tsx` are gone.

**Kit items and paths.**

- Surfaces: `Card`, `SectionCard`, `Tile`, `Divider` (`surface/card.tsx`), `ListRow` (`surface/list-row.tsx`).
- Controls: `Pill`, `IconButton`, `SegmentedControl`, `ToggleRow`, `RadioList`, `Chip`, `Stepper` (`controls/`).
- Progress: `ProgressRing`, `ProgressBar`, `QuizSegments`, `MasteryStack` (`progress/`).
- Sheet: `BottomSheet` (`sheet.tsx`): bottom sheet under `md`, dialog from `md`. `full` makes the phone sheet fill the screen (use it for Goal met).
- Shell: `TabBar`, `Rail`, `PageHeader`, `StudyTopBar` (`shell/`). Nav items are in `shell/nav-items.ts` (`/app`, `/app/library`, `/app/goals`, `/app/me`). The kit has no breakpoint classes on them; Phase 1 hides the tab bar from `lg` up and shows the rail.
- Study: `StudyCard`, `GradeTiles` (four grades, optional interval line), `AnswerOption`, `FeedbackNote`, `ListenButton` (`study/`).
- Term body: `TermBody`, `TermDefinition` (`term-body/`).
- States: `EmptyPanel`, `StatusScreen`, `Skeleton` (`states/states.tsx`).
- Helpers in `lib/kit/text.ts`: `termTitleClass`, `collectionTitleClass`, `definitionClass`, `formatCount`, `CLAMP_ONE_LINE`, `CLAMP_TWO_LINES`.
- Not in the barrel (knip flags unused exports): import `Tone`/`TONES` from `@/components/kit/tones`, `NAV_ITEMS`/`NavItem` from `shell/nav-items`, and the `AnswerState`, `KitGrade`, `FeedbackKind` and `ListenStatus` types from their own files.

**Tokens** (`app/globals.css`, both themes). DaisyUI: `neutral` is the ink (primary
pill), `primary` and `success` are green, `info` is Read blue, `accent` is coral
(streak flame), `secondary` is Quiz purple, `error` is deep coral, `warning` is
yellow. Tailwind colors: `read`, `review`, `quiz` each with `-tint`, `-text`,
`-ring`; `success-tint`; `hard`, `hard-tint`, `hard-text`; `wrong`, `wrong-tint`,
`wrong-text`; `mastered`, `learning`, `debated-tint`; `muted`, `ink-soft`, `line`.
Utilities: `shadow-card`, `shadow-sheet`. `--primary-text` and its siblings now
point at the text steps. `--shadow-rgb` switches per theme.

**Data.** None added. Kit components take props only.

**Left as is.** Global `h1`–`h6` styles (kit titles use `font-heading font-extrabold`),
`components/ui/*`, the English-only More/Less labels in the term body, and the
layout editor's portal. `term-layout-customize.tsx` got a 44px, bolder button.

**Frames that didn't match.** Review has four grade tiles, not three (decision).
The frame's Customize always shows; the code only shows it with `customize`.
Frame-only colors became tokens; their dim values are my own and need a look
(`hard`, `mastered`, `wrong`, `debated-tint`, and the dim ring steps).

**Care.** `app/globals.css` and `components/kit/` are shared by every phase; add
tokens there instead of hard-coding hex. A stateful story shares its state across
both theme panels (use `Story single` for anything that opens over the page).

**Open.** The Settings frame still shows Telegram (removed in #301): drop it in
Phase 9. Not run: `pnpm test:e2e:smoke` and the e2e specs (Chromium for Playwright
isn't installed here and wasn't downloaded). I did not add an e2e spec for
`/admin/kit`. The 390px look was only checked for overflow and tap targets, not
against the frames. The dev overlay logs a React "script tag" error that comes
from the root layout's theme scripts, not the kit.

### Phase 1 · App shell and navigation

Branch `redesign-p1-shell`.

**Built.** The app shell has three layouts from `shellLayout` in `lib/chrome.ts`:
`tabs` (Home, Library, Goals, Me), `study` (Read including Stories, Review, Quiz,
Triage) and `sub` (everything else in the app, including admin and `/c/…`).
`navKey` highlights a destination. Phone uses kit `TabBar` (`lg:hidden`). Every
desktop page uses the same rail, pinned to the window height while the page
scrolls: brand, the collection switcher as a popover, the four destinations,
the streak card and the account row. Study routes hide the tab bar. On a phone
they also hide the rail and show the study bar; the collection chip opens the
sheet. On desktop the chip is a label and the switcher is the rail's popover.
Close on the study bar goes to `/app`. Sub-pages get a phone-only back bar:
history when this visit already moved inside the app, otherwise
`subPageFallback`. `/app` is a placeholder Home. `AUTHENTICATED_HOME_PATH` is
`/app`.

**Kit.** `CollectionSwitcherRow` in `components/kit/shell/collection-switcher-row.tsx`,
exported from `@/components/kit`. `StudyTopBar`'s collection chip takes an
optional `onPress`.

**Data.** No new queries. The current collection is the existing cookie
`lb_lib_collection`, read with `parseCurrentCollectionId` and written with
`setCurrentCollection` in `lib/collections/current.ts` (a browser cookie, not a
Server Action). `pickLibraryCollectionId` moved there. A study page resolves
with `resolveAppCollection`: a real `?collection=`, then the app cookie, then
that page's own real collection, then the first active collection. A stored
`"all"` is skipped. `?collection=all` and the in-page All option still mix
collections for that visit and do not write the cookie. A real pick does.
Stories checks the app cookie before its database last-collection. Triage
already follows the Library setup.

**Left as is.** Page bodies. The public account menu. Light and Dim only, no
Auto. Me is a plain list (streak row, the old More actions except Goals, Admin
for admins, install, report, theme, credits, log out, footer links). Phase 9
replaces that list with the Me frame. The study bar has no goal pill. The
switcher has no queue counts and no paused collections. The streak pill is on
the Home header on the phone. The desktop rail carries the streak card on every
page. The streak sheet is restyled and still uses `StreakFlameScene`. The walk ends after
Library; the Library account tip points at Me and comes before the streak tip.
Read, Review and Quiz chapters still run on those pages.

**Frames that didn't match.** Me has no framed profile card yet. The switcher
has no queue lines. Theme has no Auto. Settings does not mention Telegram.
Goals is not a row on Me.

**Care.** Don't rebuild the switcher in Phase 2; add queue lines to
`components/app/shell/collection-switcher.tsx`. Don't restyle Me's list into
the frame before Phase 9. `shellLayout` is how a study page opts out of the
tab bar: a path under `/app/read`, `/app/review`, `/app/quiz` or `/app/triage`.
Desktop study pages keep the rail.

**Open.** Sub-pages still show their old header under the new back bar until
their phase. Admin sits in the rail's content area with its own sidebar.
