# Finding 11: Study top bar varies from mode to mode

**Severity:** low | **Category:** visual / layout

## Summary

Read, Review and Quiz share a close button, collection chip and goal pill, but the second row differs; Triage drops the goal pill, centers the chip and moves its counts to the right.

## Where it shows

- `/app/read` and `/app/read/stories`, `/app/review`, `/app/quiz` (setup and in-question), `/app/triage`, 390 and 1440.

## What is wrong

- Read: mode chip, Cards/Stories control, options, focus (Stories swaps focus for a history icon).
- Review: mode chip, "Skip ›", options.
- Quiz setup: mode chip, then a serif page title under it; during a question the chip is replaced by a segment bar and "Question 1 of 8".
- Triage: no goal pill, the chip is centered, the second row holds "Sort what you already know" and "6 left to sort / 4 known" (two lines).
- The collection chip and goal pill are 36 px tall on all of them; the chip truncates the name at 390 and 360 px ("Distributed Syst…") but not in Triage, which has room.

## What it conflicts with

- Each mode legitimately has different options. The mismatch to examine is the shape of the row (what is left, center, right) and the chip/pill size (also a tap-target issue; the 36 px chip and pill are under 44 px).

## Where to look in the code

- `components/kit/shell/study-top-bar.tsx`, `components/app/shell/study-bar.tsx`
- Per-mode headers: `components/read/`, `components/review/`, `components/quiz/`, `components/triage/`

## Reproduce

1. At 390×844 open `/app/read`, `/app/review`, `/app/quiz`, `/app/triage` and compare the first two rows.

## Evidence

![app-390-b.jpg](img/app-390-b.jpg)

## Also affects

Finding 1 (headers), finding 10 (targets).

## Questions the fixer should answer

- Which elements of the second row are shared, and which are mode-specific slots?
- Should the chip and pill reach 44 px?

## Done when

- The study top bar is one component with named slots; the first row has the same contents on every study screen; the second row differs only by the mode's own controls.

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
