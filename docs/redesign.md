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

Admin pages (`/admin`) keep their current look and only need to keep working
inside the new shell. The public site follows the three shells described under
"Public pages" in `AGENTS.md` (frames: <https://claude.ai/artifact/JrgUpb1ur8X7MXWd4etHoR>).

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

This phase checks the whole app and merges the redesign into `main` after getting approval from author.

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

### Phase 2 · Home

Branch `redesign-p2-home`.

**Built.** `/app` is Home (`components/home/`): a phone header (Studying label,
collection title that opens the switcher, mastery bar, streak pill), the
three-stop path with ring, "x of y today", "N in queue", the **Continue** pill
and the last stop, and a desktop layout (`HomeDesktop`: title with **Add terms**
and one primary action, the path in a white panel, a right column with today's
goals or the pace prompt, and the collection card; below 1180px the column
drops under the path). The switcher rows (phone sheet and rail popover) now show
"Read · Review · Quiz" queue lines. Loading is a Suspense skeleton inside the page, not a
`loading.tsx`, so it doesn't cover the routes under `/app`. Without a collection
(or if collections fail to load) Home shows an empty panel and keeps the streak
pill on the phone.

**Kit.** `PathStop` (`components/kit/progress/path-stop.tsx`, from `@/components/kit`):
node, optional goal ring, met check, filled "next up" state. `CollectionSwitcherRow`
takes an optional `detail` line.

**Data.** `lib/library/collection-tally.ts` now also counts `readQueue`,
`reviewQueue`, `quizQueue` per collection from the same progress rows the shell
already loads, so no new query. Read = terms never read, not marked known.
Review and Quiz = `rankReviewQueue` / `rankQuizQueue` length on the unmarked
terms, so they follow TRACE's cooldown without copying it. `Collection.queues`
carries them; `ShellCollection` also gained `queues`, `description` (200 chars)
and `language`. The page itself calls the cached `loadLibraryCollections`, so it
is fresh on every visit even though the shell island isn't re-rendered on a soft
navigation. All branching for the path is in `lib/home/path.ts` (unit tested).

**Decisions taken.** Partial goals work per tier (rings only on tiers with a goal;
the pill goes to the first unmet goal with a queue; the last stop counts only set
goals). With no goals the pill reads **Start here** and the first stop with a
queue gets it. All goals met: the trophy turns green, no pill, desktop primary is
**Keep reading**. Desktop with no goals puts the "Want a daily pace?" prompt in
the goals card slot. An empty-queue stop still links to its study route, whose
caught-up state belongs to Phases 3 to 5. "Mastered" is `termsLearnedCount`.
Goal counts are global across collections; queues are per collection.

**Left as is.** Server actions, TRACE, the claim flow, promos (no Home slot), the
tour (no Home chapter), the streak sheet, Phase 1's shell and `collectionTone`
(the frames' per-collection tints have no data source).

**Frames that didn't match.** Mock queue numbers; per-collection tile colors;
`known` shown as a percent (now ever-mastered); `ReadNoGoal`/`QuizSetup` links
(Home links `/app/read`, `/app/quiz`); the frames only draw all-goals or no-goals,
so partial and all-met follow the rules above. The rail popover is 340px wide
(was 288) so the queue line fits.

**Care.** Home sets its own cream page background (`bg-base-200`) because the
shell still paints `base-100` behind every page; move that into `ShellFrame` once
the other pages are redesigned. `lib/home/path.ts` is the one place that decides
the pill, copy and trophy. Anything that changes what "queue" means is a change
to `tallyCollectionStats` only.

**Open.** Phone entry points for Stories, Triage and **Add terms** are not on
Home's phone frame; Phases 3, 6 and 8 must check they stay reachable. The kit
page story for `PathStop` is covered by type-check and lint but I couldn't get a
screenshot of `/admin/kit` in the headless run. `?collection=` on Home isn't
read (the cookie is the current collection). Mastery counts on Home are fresh;
the shell's switcher list is only as fresh as the shell's last load.

### Phase 3 · Read (Cards and Stories)

Branch `redesign-p3-read`.

**Built.** Read has a controls row under the shell's study bar (Read chip, Cards/Stories switch, options, and focus mode on Cards or history on Stories) in a centered 640 px column. Cards: hidden and revealed `StudyCard`, Listen pill, term body, **Mark as known** line, **Previous**, **Next term**, goal-met note, caught-up, error and paused states, and the fullscreen feed. Options and **What cards show** are `BottomSheet`s. Stories: setup, generating, error, no-terms, reader with the narration controls, term sheet (definition, Mark as known, Open term), glossary, footer and a history sheet.

**Kit.** `ModeSwitch` (`controls/mode-switch.tsx`, link-based pill switch). `GoalPill` is now exported and takes an `icon` for the no-goal case; `StudyTopBar` takes `goalSlot`. `ListenButton` takes `ariaLabel` and `disabled`. Stories on `/admin/kit`: Mode switch, and the pill with an icon.

**Data.** No new queries or actions. The goal pill reads `goalCountFor(tier)` / `useGoalCount(tier)` in `components/goals/goal-store.ts`. A study page mounts `<StudyDay />` (`components/goals/study-day.tsx`, inside Suspense) to seed today's counts through the existing `loadGoalDay`. The shell's `StudyBar` picks the tier from the path (`components/app/shell/study-goal-pill.tsx`), so **Review and Quiz only need to mount `StudyDay`** to get their pill. It shows nothing until counts are known. `tickGoal` now emits, so the pill updates live, and `rollOverIfNewDay` skips a store with no loaded day.

**Left as is.** TRACE, every server action and route, `recordRead`/`tickGoal` calls, reveal default and all Read options, narration billing and access, `POST /api/stories`, `OptionRow` (still used by Goals, share sheet and Review), `OptionsMenu` and `TermCardHeader` (Review), `CreditGateNotice` and `TopUpButton` (Phase 9), `resolveAppCollection` (Read maps `?collection=all` to the current collection locally in `page.tsx`).

**Decisions taken.** Caught-up counts toward the goal for the current collection (`GoalCaughtUp` no longer needs `"all"`). Switching collection from the shell resets the queue (`ReadPage` is keyed by collection). Stories' collection is read-only and says so when it falls back to another collection with enough terms. The `read-collection` tour chapter and target were removed; the tour mechanism is untouched. Home desktop's white path panel was removed on request.

**Frames that didn't match.** No Previous, focus mode or hidden-card state in the frames (kept from the code). Frame speeds and credit numbers are placeholders; real values used. The term sheet gained Mark as known and Open term as in the frame, reusing the glossary actions. "Read goal met" is a quiet note, not a celebration.

**Care.** `components/app-shell.tsx` got `lg:flex-none`: without it the desktop shell ignored `h-dvh`, so long study pages scrolled the whole window and the rail with it (a Phase 1 bug). `components/app/shell/shell-frame.tsx` paints `bg-base-200` on study routes, so Review, Quiz and Triage inherit the cream page. `components/read/read-page.tsx` skips the `view=cards` rewrite when the visit is about to move to Stories; this also fixed `read-landing.spec.ts` "no cookie yet", which was already failing on `redesign`.

**Open.** Not checked at 390/1280 against the frames: paused and no-terms states, the credit-short and listening-limit notices (they reuse Phase 9's components), narration controls while playing (no stub clip), and shadowing. `components/read/study/study-setup-panel.tsx` is untouched and still used by Review and Quiz setups. The kit page stories for Mode switch were checked by type-check and lint only.

### Phase 4 · Review

Branch `redesign-p4-review`.

**Built.** Review sits in Read's 640 px column under the shell's study bar (goal pill from `<StudyDay/>` in the layout). A controls row (Review chip, Previous, Skip or Next, options), a front card (term, category, "Recall the meaning" chip) with a pinned **Show answer**, and a revealed card (coral title, category, Listen, full term body via `StudyTermBody`, Mark as known foot line) with four grade tiles pinned under it. A quiet "Review goal met." note, caught-up, load-error, loading and paused states reuse Read's. Review options is a `BottomSheet` of `ToggleRow`s with the same four options and visibility rules.

**Kit.** `GradeTiles` takes `selected` and `ariaLabels`; `Pill` has a `ghost` variant. Stories on `/admin/kit`: Pill (Ghost) and Grade tiles (selected row).

**Data.** None added. `gradeTileLabels`, `KIT_GRADE_OF`, `REVIEW_GRADE_OF` in `lib/review/next-review.ts` map TRACE grades to tiles and build the interval line and screen-reader names (unit tested). `GoalMetNote` (`components/goals/goal-met-note.tsx`, `tier` prop) replaces `ReadGoalMet`; Read now imports it.

**Left as is.** TRACE, actions, `recordReviewRevealAction`, write queue, `tickGoal`, keyboard hook and `lib/review/keyboard.ts`, `/api/review/feed` (still accepts `all`), the cookie fallback `lb-review-collection` (read only now), promo slot, tour targets `review-card` and `review-grades`.

**Decisions taken.** Both card faces stay mounted and only one shows (`hidden` + `inert`), so narration autoplay still runs inside the reveal press; the 3D flip is gone. `?collection=all` follows the current collection. Switching collection from the shell remounts the page (keyed by collection); the write queue already handles a remount. The `review-collection` tour step and target are removed. **Show answer** is new (the frame has it, Read has the same).

**Frames that didn't match.** Three tiles in the frames, four built. Frame says the intervals option is off; the option and its default stay. "Review goal met!" with **See today** is a plain note with no button (celebration is Phase 6). The options sheet's "Customize what cards show" row is not added; Customize stays under the term body. Previous (not in the frame) is kept as a ghost button in the controls row.

**Care.** `components/review/review-playing-step.tsx` still exports `SOFT_ACTION_BUTTON_CLASS` and `releaseFocusAfterPointerPress` for Triage, and `review-card.tsx` plus `term-card-header.tsx` stay for Triage; Phase 6 should move or drop them. `review-options.spec.ts` now finds the options by role `switch`. `StudyNoActiveCollectionsState` is no longer wrapped in `QuizPanel` on Review (Read's page still wraps it).

**Open.** Checked at 390 and 1280 in light and dim for front, back (term with every field) and the options sheet. Not checked against frames: Japanese and definition-only terms, retry showing, caught-up, paused and load-error states, touch swipes. `e2e/tests/zz-visual.spec.ts` (Phase 3's scratch screenshot script with a hard-coded path) is still there.

### Phase 5 · Quiz

Branch `redesign-p5-quiz`.

**Built.** Quiz sits in Review's 640 px column under the shell's study bar (goal pill from `<StudyDay/>` in the layout). Setup is two section cards (Question style, How many questions) with **Start quiz** pinned under them. A question is a segmented progress row, a caption ("Question 3 of 10", plus the practice note), a `QuestionCard`, the answers (radio rows, Yes/No tiles or a typed field), and a pinned footer with the feedback note, the Enter hint and **Check** / **Next** / **See results**. Results are "N of M right", a lobya scene, Correct / Missed / Score tiles, the Quiz goal row (only with a goal set), expandable **Terms to revisit**, and **Quiz again**, **Practice missed (not scored)**, **Change setup**. Generating is an `EmptyPanel` with `PreparingScene`; an error is a `StatusScreen`.

**Kit.** From `@/components/kit`: `AnswerRadio` and `AnswerTile` (react-aria radios, so `radiogroup`, arrow keys and digit shortcuts still work; `AnswerRadio` shows the digit on desktop keyboards only), `AnswerInput` (typed field, default/correct/wrong/skipped), `QuestionCard`, `ChoiceCards` (cards with a note, or pills). `ANSWER_SURFACE` is exported from `study/answer-option.tsx`. Stories are on `/admin/kit` ("Quiz question", "Choice cards").

**Data.** None added. `components/quiz/quiz-note.ts` builds the note under a checked question from the template's own line (it adds "The answer is …" when the line doesn't name the answer) and maps a template to the card's label. `quizCountPresets` in `lib/quiz/question-limit.ts` gives the 5, 10, 20 chips that fit the collection.

**Left as is.** Templates, builders, grading, `generateQuizAction`, TRACE writes, the write queue, retries, session storage and Resume, dictation prefetch and autoplay, keyboard handling, credit gate and top-up (`CreditGateNotice`, `TopUpButton` untouched, Phase 9), `PromoVisit`, tour target `quiz-style`, `components/quiz/quiz-ui.tsx` (Triage and Read still import its panels).

**Decisions taken.**

- **Current collection.** The collection picker and **All active collections** are gone. Setup uses the current collection; `?collection=all` follows it. A shell switch remounts the page, and a quiz in progress offers **Resume**. The `lb-quiz-setup` cookie no longer stores a collection (an old one is still read as a fallback); `InitialQuizSetup` lost `savedCollectionId` and `collectionFromLink`.
- **Count chips.** They are 5, 10, 20 (those that fit) and **Custom**, which opens the old numeric field with its validation. The old "all terms" chip is dropped. Default stays 10.
- **Skipped dictation.** **Can't listen now** now shows **Skipped, no problem** with the answer and meaning, then **Next** moves on. It is still unscored and never sent to TRACE. A clip that won't load takes the same path.
- **Layout and copy.** Segments sit under the shell bar, not in it. The "N correct" tally is dropped. Copy is **Check** / **Next**; the results heading is "N of M right" for real and practice rounds. Removed: `study-setup-panel.tsx`, `study-progress.tsx`, `quiz-controls.tsx`, `text-feedback.tsx`, `studyCountPresetValues`, `allCollectionsTermCount`.
- **Related fix.** "What cards show" uses plain `ToggleRow` switches (on is shown) instead of the labeled Shown / More control.

**Frames that didn't match.** Frame counts are 5, 10, 20 with no Custom; the frame's skip is a note the code never had; frame explanation strings are mock text; the frame draws its own lobya, the app keeps `QuizCheerScene` / `KeepTrainingScene`; Results rows are static in the frame and expand in the app.

**Care.** `e2e` locators changed: counts and style are radios (click with `{ force: true }`, the inputs are visually hidden); buttons are **Check** and **Next**. A quiz can run past its size because of retries, so specs match `Question n of \d+`. The credit-gate notice and top-up button still use the old `ui` look inside the new setup card until Phase 9.

**Open.** Checked at 390 and 1280, light and dim: setup, Custom count, choice question open, picked and checked, results, and the error state. Not checked against frames: Yes/No tiles, typed and dictation questions, the Resume banner, AI over balance, and a 100-question quiz (the seeded terms had no examples, so only choice questions appeared). `e2e/tests/zz-visual.spec.ts` (Phase 3) is still there.

### Phase 6 · Triage and goal celebration

Branch `redesign-p6-triage`.

**Built.** Triage sits in Review's 640 px column under the shell's study bar. A controls row (Triage chip, "Sort what you already know", "N left to sort / N known"), a `StudyCard` front (term, collection · category, "Tap to see the meaning") and back (title, category, Listen, full term body with the learner's layout), a swipe layer that is unchanged, and an Undo icon with **Not yet** and **I know this** pills. The summary and caught-up states use `EmptyPanel`, `StatTile`s and kit pills. Goal met is a `BottomSheet` (`full` on a phone, a dialog from `md`): yellow hero with `GoalCheerScene`, "<Tier> goal met!" or "Today's goals met!", tiles for the day streak and today's counts, a "Today's goals" card with a **Go to <next>** link, **Done for today** (closes and goes to `/app`) and **Keep going** (closes).

**Kit.** `BottomSheet` takes `hero` (art in place of the handle and close button, centered title, cream body); story "Sheet with hero". `StatTile` (`surface/stat-tile.tsx`, from `@/components/kit`): white card, or tinted with a `tone`; story "Stat tiles". Quiz Results now uses it instead of its own copy.

**Data.** None new in the database. The Triage page follows `?collection=` then the app cookie (`lb_lib_collection`) and passes it to `getLibrarySetupData`. `GoalsIsland` passes `withTodayDone(streak).current` to `GoalTracker`, which hands it to the celebration (a goal is only met once something counted today). The goal store is unchanged.

**Left as is.** TRACE, every action and route, the claim flow (once per tier per day, celebrate toggle), `use-triage-deck.ts`, `use-triage-keyboard.ts`, the swipe logic, `PromoVisit`, tour targets `triage-card` and `triage-actions`, the Library's Triage links, `PageBadge page="triage"`.

**Decisions taken.** The collection picker is gone from Triage (the shell switcher is the only one). Reveal stays one-way. The "set aside" count is dropped from the counts line. The second count tile is the busiest other tier, shown only with activity. Keep going is the same label for every tier (the old "Keep reading/reviewing/quizzing" are gone). `GOAL_TIER_UNITS`, `QuizPanelHeader`, `QuizPanelBody` and `QuizStat` were unused and removed; `review-card.tsx`, `term-card-header.tsx`, `SOFT_ACTION_BUTTON_CLASS` and `releaseFocusAfterPointerPress` are deleted.

**Frames that didn't match.** The Triage frame's reveal toggles and shows only the definition (kept one-way and every field). The frame has a close button and collection chip on the page (the study bar has them). GoalMet draws Review's tiles; built from the finished tier. One purple lobya in the frame; the app keeps the three-lobya scene.

**Care.** `e2e/tests/goals.spec.ts` now expects "Review goal met!" and "Today's goals met!". The celebration dialog is mounted by `GoalTracker` in the root chrome, outside the shell, so it can't use `useShell`.

**Open.** Phone Home has no Triage link (only the desktop chip and the Library header link): Phase 7 or 8 should check it stays reachable. Checked at 390 and 1280, light and dim: Triage front, back (definition-only and full term), summary; Goal met partial and all-met. Not checked: Listen pill (no narration in e2e), reduced motion, a failed mark toast, a 40-character collection name on the study bar, `e2e/tests/zz-visual.spec.ts` (Phase 3's scratch file) is still there.

### Phase 7 · Library

Branch `redesign-p7-library`.

**Built.** The Library has no sidebar: the shell switcher changes the collection. The page is a title row (**Library**, **Collection** → `/app/import`), a phone-only collection row that opens the shell switcher, the collection card (`CollectionSummary`: letter tile, kind and count, mastery bar, description, meta, owner share notice; `CollectionStudyRow`: Read, Review, Quiz pills, or the paused banner with **Resume**; `CollectionActionTiles`: Add terms, Triage, Share or Copy link, More), banners, search and **Filters**, and the term list. A row shows the title, a Mastered or Marked known badge, a one-line definition, Listen and ⋯; swipe right still marks known. A tap selects a term: a `BottomSheet` on a phone and tablet, a sticky 420 px panel beside the list from `lg`. Sheets: filters, term actions, add terms, More, Share, Edit collection, Report, Export, Finish terms, edit term. Confirms (delete term, delete collection, reset progress, remove) use `ConfirmDialog`.

**Kit.** From `@/components/kit`: `ConfirmDialog`, `SearchField`, `Banner` (yellow or green), `FormField`, `TextInput`, `TextArea`, `SelectInput`. `ListRow` takes `disabled`; `Card` passes extra div props; `Pill` passes `data-tour` to its link. Stories on `/admin/kit`: Confirm dialog, Search field, Form fields, Banner.

**Data.** None added. The row's definition line comes from the lean row. `useLibraryList` now has `selectedTermId` and `selectTerm` (the first opening of a term still records a read and ticks the goal) instead of the open set. The collection-counts override (`overrideCollectionCounts`, `collectionCountsOverride`) is gone: only the sidebar read it. The header still computes live counts locally.

**Left as is.** Lean rows and `/api/terms/details`, `overrideMarkedKnown` / `overrideRemoved`, the `lb_lib_filters` cookie, row windowing, narration access, share, report, love and remove flows, `ownerNoticeFor`, the requests link, `PromoSlot`, term layout (the Library body shows every field). `TermFormFields` and `TermRelationshipsEditor` keep their old inputs inside the new edit sheet. `StartCollectionButton` and `CreateCollectionDialog` (empty library) keep the old look; `love-button.tsx` and `shared-collection-card.tsx` stay for Browse.

**Decisions taken.** Questions went unanswered, so I took the recommended defaults. Read, Review and Quiz pills sit in the card above the tiles (hidden while paused). Export JSON stays on collections you added. Edit term keeps the form, as a sheet. Unfinished terms stay out of the list (banner and Finish sheet). Term and collection ⋯ menus are sheets (centered dialogs from `md`), not dropdowns. "Mastered" labels `termsLearnedCount`; the row badge keeps Mastered and Marked known apart. Browse's report dialog is now the new `ReportCollectionSheet`. The `library-collections` tour step now points at the collection card.

**Frames that didn't match.** The frame's header has no study links; **Add terms** sheet's third row goes to `/app/import/apps`; Love lives in the More sheet for added collections; the filters sheet footer closes the sheet; frame "No definition yet" rows are not built; the frame hint about swiping only shows on touch.

**Care.** `components/library/collection-actions.tsx` owns every collection flow, `collection-action-rows.tsx` only lays out rows. Removed: `library-sidebar`, `collection-sidebar`, `collection-sidebar-drawer`, `copy-collection-link-button`, `add-terms-menu`, `category-chips`, `shared/toolbar`, `term-card`, `term-actions-menu`. E2E locators changed: More tile (not "Collection actions"), Share tile, switch (not checkbox) in the share sheet, `Delete term` is a button.

**Open.** Checked at 390 and 1280: list, detail sheet and panel, More sheet (dim), paused state. Not checked against frames: long names, a term with only a definition, Japanese terms, an added collection, blocked share, the empty library, swipe on a real touch device, and keyboard row navigation. `e2e/tests/zz-visual.spec.ts` (Phase 3) is still there.

### Phase 8 · Adding terms

Branch `redesign-p8-adding-terms`.

**Built.** `/app/import`, `/app/import/paste`, `/apps`, `/apps/[app]`, `/more`, `/app/capture` and `/app/import/request` draw their own kit `PageHeader` at every width (the shell's phone bar skips them: `ownsHeader` in `lib/chrome.ts`, used by `shell-frame.tsx`). `FlowFrame` (`components/import/flow-frame.tsx`) is one centered 640 px column. The chooser has a search field, result rows ("Built-in · N terms" / "Community · N terms · N loves"), the request link row, the four start rows and **More ways to add**. Paste has the step bar (`StepBar`), the list box, **Paste** / **Choose a file** pills, format help (a sheet) and the pinned **Check your list**. Check has New / Already there / Unfinished tiles, a "Read as" line (`lib/import/read-as.ts`) with **Change how it's read** (separators, heading, column roles), the destination (`ChoiceCards`), category, notices, conflicts, Skip / Update, the term list and the pinned **Add N terms**. The step bar moves to Add while saving. Capture has the serif Term field, the collection chip (opens a sheet that changes only Capture's destination), Definition, More details, and pinned **Save term** with "Save and add another". Request, its sent screen, the definitions form, request cards and the blocked state follow the same conventions.

**Kit.** `PinnedAction` (`surface/pinned-action.tsx`, from `@/components/kit`, story "Pinned action"): the page's primary action, sticky above the safe area. `KindToggle` and `LanguageToggle` (`components/shared/`) are now `ChoiceCards` and a native `SelectInput`; `create-collection-dialog` picks that up.

**Data.** None new. `lib/import/read-as.ts` is a pure sentence for the Check screen.

**Left as is.** Parser, Check state, commit, draft storage, adapter variant for `/admin/requests`, Android share target, `REQUEST_COPY`, tour targets `import-search` / `import-routes`, `ImportedNotice`. The destination stays on Check, not Paste. "Check your list" has no live count (it would parse every keystroke).

**Decisions taken.** Questions went unanswered, so I took the recommended defaults: page-owned headers; destination on Check; `TermFormFields` and `TermRelationshipsEditor` restyled (they also serve the Library edit sheet); `PinnedAction` added; frame copy "Save term", "Definition (optional)", "Update them", "Paste a list / From another app / One term / Or start your own". The shared `ErrorAlert` stays for import failures (it renders issue lists). Request kind labels stay "A field's jargon" / "Language vocabulary".

**Frames that didn't match.** Frame's destination on Paste; "Check 24 terms" count button; 5 rows + "and 19 more" (all rows shown); no separators, columns, filters, Restore, or "Start an empty collection" row (kept); Capture chip links to the shell Switcher (it sets only Capture's collection); Request frame shows only the blocked state.

**Care.** `app/globals.css` has a `.flow-fields` rule: inputs and unselected choice cards are white inside the add-terms pages (the kit fields are cream, which vanishes on the cream page). Sheets render outside it and keep cream. A new field on these pages needs no class. `e2e/tests/import.spec.ts` clicks choice cards by text (the radios are hidden) and uses **Save term**.

**Open.** Checked at 390 and 1280, light and dim: chooser with search, paste, check (existing collection, duplicate, long definition), edit sheet, capture with details and picker, apps, guide, JSON page, request (requests off). Not checked: requests switched on, the admin delivery screen, a 1100-line list, Japanese terms, a shared sentence (`?text=`), the Android share target, the dim primary pill (it looks grey; that's the kit token).

### Phase 9 · Goals, Me and account pages

Branch `redesign-p9-goals-me`.

**Built.** Goals, Me, Mastery, Settings and Browse sit in `FlowFrame`'s 640 px column on the cream page. Mastery, Browse and Settings draw their own `PageHeader` with a back button to Me (`ownsHeader` in `lib/chrome.ts`). Goals: a card per mode (tile icon, "N of M today", `Stepper`, Off/Light/Steady/Intense pills named "<Mode> pace"), the forecast card, a `ToggleRow` for celebrate and a pinned **Save goals** (**Start these goals** before the first save). Me: profile card (initials, email, "N day streak · longest M" that still opens the streak sheet), a credits strip with **Details**, then the rows from the frame. Mastery: one top card (Learning, Mastered, lifetime line, Practice activity, Grading with four tiles), a card per collection, and restyled Terms tab. Settings: `SectionCard` sections (AI credits, Desktop widget, Account). Browse: search, Built-in/Community switch with counts, status chips, Most loved, cards. Report an issue is a `BottomSheet`.

**Kit.** None added. `ConfirmDialog` takes `confirmDisabled`. `SegmentedControl` carries `data-segmented` so `.flow-fields` does not paint its pills white.

**Data.** Me's page also loads `getMyCreditSchedule` and the story estimate (`storyCost(termsForLength(DEFAULT_PIECE_LENGTH))`) into a `CreditsSummary` for `TopUpSheet` (`components/ai-credits/top-up-sheet.tsx`). `freeCreditsLine` moved to `lib/ai-credits/topup-copy.ts`. Nothing else new.

**Left as is.** Forecast and goal actions, claim flow, top-up rules (`TopUpButton` claims directly), widget hook, password and delete actions, Mastery URL sync, Browse loaders, promo visits, tour targets, public `ProfileMenu` (only the sheet import changed).

**Decisions taken.** Questions went unanswered, so I took the defaults: no Resume on paused Mastery cards, no Auto theme, medium story estimate, 640 px on desktop. Goals lost the lobya scene on tier cards and the Today rings (Home has them). The password form stays visible (no Change button). Mastery's Overview/Terms switch is a radio group. Report issue has no Cancel and is mounted only while open.

**Frames that didn't match.** Three grades in Mastery's Grading (four built). Telegram is gone from Settings. Browse cards show "N terms" only: `SharedCollection` has no kind or language. The report sheet's Send is disabled until 10 characters.

**Care.** `CreditGateNotice` is a yellow `Banner` and `TopUpButton` a `Pill` (`size="lg"` for pinned use). Removed: `collection-select`, `read-option-row`, `search-bar`, `GoalLobyaScene`, `GoalRing`. E2E: pace pills are buttons in a group, Browse source is a radio, the report radios are scoped to the dialog.

**Open.** Not checked against frames: long names, big numbers, paused collections, exhausted credits, Google-only accounts, goals all off, the Terms tab with journeys. `e2e/tests/zz-visual.spec.ts` (Phase 3) is still there.

### Phase 10 · Status and empty states

Branch `redesign-p10-status`.

**Built.** Not found, error, global error and offline are kit `StatusScreen`s with the frames' copy and kit `Pill` actions (**Go home**, **Browse collections** for signed-in visitors, **Try again**). `components/status-page.tsx` and `components/shared/empty-state.tsx` are deleted. Read and Review's caught-up states have actions (`CaughtUpActions` in `components/read/read-caught-up.tsx`): **Switch collection** (opens the shell switcher), **Add terms**, and on Read "Review <name> instead" when that collection has a review queue. Read's caught-up title and description follow the `Empty` frame. Loading: `PageSkeleton` and `PanelSkeleton` in `components/page-skeleton.tsx` now use kit `Skeleton` (Goals, Mastery, Settings, Stories, the page-root fallback), Library, Read and the shared-link page have their own kit skeletons.

**Switcher.** Paused collections are listed under a "Paused" heading in the switcher (`CollectionList`). Picking one sets the app cookie and opens its Library page (Resume banner). `ShellValue.current` may be a paused collection only on `/app/library`; Home and study screens still use an active one.

**Kit.** None added; no kit page change. The off toggle's knob is muted grey now (it was white on white).

**Data.** None. "Review X instead" reads `current.queues.review` from the shell context.

**Left as is.** Scenes (the app's animated lobyas, not the frames' simpler ones), Home's skeleton (already matches `HomeLoading`), `StudyNoActiveCollectionsState`, Triage's caught-up actions, admin error/loading, public-site loading, `HeaderSkeleton`/`SkeletonBar`/`AdminPageSkeleton`.

**Frames that didn't match.** No brand mark row above the status screens (the shell or site header carries it); the `Empty` frame's own header (the study bar has it); Browse collections only for signed-in visitors; status pages outside `/app` sit on the site's white page, not cream.

**Tests.** `e2e/tests/status.spec.ts` (not found, caught-up switcher); `admin.spec.ts` and `share.spec.ts` expect the new not-found heading.

### Phase 11 · Hardening and merge

Branch `redesign-p11-hardening`.

**Built.** No new screens. Removed the Phase 3 scratch spec `e2e/tests/zz-visual.spec.ts`. Knip reports no unused files (`components/ui/**` stays ignored, and anything still imported stays). Docs now describe the shell: Home, Library, Goals and Me; the tab bar under `lg`; the fixed rail from `lg`; study routes without the tab bar. Issue reports, legal links, the credits line and Capture's chrome are described as they are. The Features page adds Home, sorting a collection, and the phone tab bar with the desktop rail. `origin/main` was already contained in `redesign`, so merging it in changed nothing.

**Kit.** None added.

**Data.** None.

**Left as is.** TRACE, server actions, routes and the database. Every Decisions row. The public account menu. Phone Home still has no Triage link (Library and desktop Home do). Admin and the public site keep their look. `components/ui/*` stays where it is imported.

**Frames.** This phase has none. Earlier frame gaps were not reopened.

**Walk.** At 390, 768 and 1280, in Light and Dim, signed out and signed in: auth, public pages, a collection, a shared link, not-found, offline, Home, Library, Goals, Me, Mastery, Settings, Browse, Read, Stories, Review, Quiz, Triage, the add-terms flow, Capture, a request, and Admin. Phone and tablet show the tab bar on the four destinations and hide it on study routes. Desktop shows the 240px rail and, on Library, the 420px term panel. A long collection name truncates on the phone and in the rail, and wraps on desktop Home. `LobyasApp/ios` and `LobyasApp/android` set `data-shell` and did not overflow. No layout bug to fix. The dev overlay's hydration warning is the browser tool's `data-cursor-ref`, not the app. Real Xcode and Android Studio shells were not opened; they load the live site unless pointed at a preview.

**Tests.** `pnpm check`, the features, content-page and tour-target unit tests, then the full `pnpm test:e2e` (110 passed, 2 skipped) and `pnpm test:e2e:smoke` (60 passed, 1 skipped). Two specs still expected the old app: Study from a public page now lands on `/app`, and Browse's report reasons are radios inside the dialog. Both updated before the green run.

**Care.** Do not merge this into `main` until the author says so. The next step is a PR from `redesign` into `main`.

**Open.** Dim token values Phase 0 flagged (`hard`, `mastered`, `wrong`, `debated-tint`, dim ring steps) were not retuned. Listen with no clip, reduced motion, and a swipe on a real touch device were not exercised.
