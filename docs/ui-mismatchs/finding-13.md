# Finding 13: The same numbers and nouns disagree between screens

**Severity:** medium | **Category:** content / data

## Summary

Counts shown for the same collection or the same day disagree between Home, Library, Mastery and Browse, and the units for daily pace use three different nouns.

## Where it shows

- `/app` and `/app/library`: "3 of 10 mastered" for Distributed Systems.
- `/app/mastery`: header "Learning 5 terms" and "Mastered 3 terms"; the collection card below says "1 mastered · 5 learning · 2 not started"; the Terms tab splits the same 10 terms into Not started 2, Weak 4, Strong 2, Marked known 2.
- `/app` Read "14 of 20 today" while `/app/mastery` "Practice activity" says Read "6 read today".
- `/app/browse`: "Built-in · 0" and "No built-in collections yet" while `/collections` lists 12 built-in collections and the same collections appear on the signed-in Mastery page.
- `/app/goals`: units "terms a day", "cards a day", "questions a day".

## What is wrong

Home and Library call a term mastered from `collection.termsLearnedCount`; Mastery's header and its card use different buckets (`buckets.mastered`, `buckets.learningNotMastered` in `components/mastery/collection-card.tsx`; `termsLearning` in `components/mastery/mastery-overview.tsx`), and the header's "Mastered 3" equals Home's 3 while the card says 1. The words "mastered", "learning", "known", "strong", "weak" also name different groupings on different screens. The "6 read today" and "14 of 20 today" values may count different things (distinct terms vs reads), but both are labeled "today". It is not known from the UI which one is right: the fixer should read the sources before deciding.

Seed data in this checkout: the Distributed Systems collection has 10 terms, and Mastery says 2 are marked known.

## What it conflicts with

- `docs/trace.md` defines mastery and the blend; `docs/goals.md` defines daily counts; `docs/redesign.md` ("Goals ... no due/overdue copy").
- The Features page describes a term's level as unknown, learning or known, while Mastery uses Mastered, Learning, Not started, Weak, Strong, Marked known.

## Where to look in the code

- Counts: `components/home/home-header.tsx`, `components/mastery/collection-card.tsx`, `components/mastery/mastery-overview.tsx`, `components/mastery/mastery-practice-activity.tsx`, `lib/` loaders for Home and Mastery
- Browse: `components/library/shared-collections-tabs.tsx` (`counts.builtin`) and its loader
- Goals nouns: `components/goals/goal-tier-card.tsx`
- TRACE: `docs/trace.md`, `lib/trace/`

## Reproduce

1. Signed in as the seed admin, open `/app`, `/app/library`, `/app/mastery` (Overview and Terms tabs) and compare mastered / learning counts for Distributed Systems.
2. Open `/app/browse` and the Built-in tab, then `/collections` signed out.
3. Compare Read "today" on `/app` and on Mastery's Practice activity.

## Evidence

![app-390-a.jpg](img/app-390-a.jpg)

## Also affects

None; this is the one finding that touches data, not only styling.

## Questions the fixer should answer

- Which number is authoritative for "mastered", and which labels name the other groupings?
- Is the Built-in tab empty because the seed's built-in collections lack a flag the loader expects, or by design?
- Is "today" the same window on both screens?

## Done when

- A collection's mastered count is identical on every screen that shows it, or each screen's label says what it counts.
- The Built-in tab lists the built-in collections that the public page lists, or a documented reason explains why not.

## Ground rules for the fixer

- Read `AGENTS.md` and the docs it links for the area you touch (`docs/redesign.md` for the design decisions, `docs/e2e.md` before adding a spec). Where `docs/redesign.md` and the canvas disagree, the decision in the doc wins.
- Build from the shared kit (`components/kit/`) and DaisyUI classes with theme tokens from `app/globals.css`. No new hard-coded hex colors in components.
- Restyle only. Don't change server actions, routes, RPCs or TRACE. Keep `data-tour` attributes, `saveInBackground` usage and the term-layout portal rules intact.
- Keep tap targets at least 44 px on phone and text contrast at least 4.5:1 in light and dim (dark) themes.
- Comments only where necessary, in plain language.
- Finish with `pnpm check`; run `pnpm test:e2e:smoke` if a covered flow changes.
- Don't take the "Conflicts with" or "Questions" sections as the answer. They state the problem and what a solution has to respect. Choose the solution yourself; if it changes one of the shared pieces named here, check the other pages that use it (the "Also affects" list).

## About the evidence

Found in a UI audit of `main` (commit `ce37abfc`, after the redesign), measured in Chromium against `next dev` at `http://localhost:3000`, signed in as the seeded admin from `supabase/seed.sql`. Pixel values were read with `getComputedStyle` and bounding boxes. Screenshots are in `docs/ui-mismatchs/img/` (contact sheets: each tile is labeled with its route; phone sheets are 390 px wide tiles, cropped to the first screen). The audit's own scripts aren't in the repo. Admin pages are out of scope.
