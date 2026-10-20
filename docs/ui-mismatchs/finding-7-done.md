# Finding 7: Mode colors leak onto other modes

**Severity:** medium | **Category:** visual / color

## Summary

The app assigns Read blue, Review coral and Quiz purple. Several controls use another mode's color, and one title changes color between screens.

## Where it shows

- `/app/review` front: the hint pill "Recall the meaning, then tap" is Read blue (`bg-read-tint text-read-text`), while the screen's mode chip is coral.
- `/app/read/stories`: the selected length option ("Medium") uses the Quiz purple tint and ring; the screen's chip is Read blue.
- `/app/import/paste`: the step bar uses `bg-quiz-ring` (purple) for the active step (`components/import/step-bar.tsx:16`).
- `/app/review` graded side: the term title is coral (`text-review-text`); on Read, Triage and in the Library term sheet it is ink.
- `/app/triage`: the hint "Tap to see the meaning" is a neutral beige pill, unlike Review's blue pill.

## What is wrong

Colors per screen, measured: Review hint `rgb(228, 237, 253)` tint with `rgb(42, 98, 192)` text (Read tokens); Stories "Medium" ring `rgb(142, 98, 217)` (`--quiz-ring`); Paste active step `--quiz-ring`; Review graded title `--review-text` against ink elsewhere.

There are two readings of the problem and both are present: (a) mode colors used outside their mode, (b) the same element, the term title, flips color between screens.

## What it conflicts with

- `app/globals.css` comment: study modes are "a solid, a tint to sit behind text, the text step and the ring arc" per mode.
- `docs/redesign.md` has no rule for using a mode color on a non-mode flow; the Paste and Stories flows sit under Add and Read respectively, which suggests neutral or the parent's color.

## Where to look in the code

- `components/kit/tones.ts`, `components/kit/controls/pill.tsx`, `components/kit/controls/choice-cards.tsx`, `components/kit/controls/chip.tsx`
- `components/review/review-term-card.tsx` (`RecallHint`), `components/triage/triage-card.tsx`
- `components/import/step-bar.tsx`, `components/read/stories/story-setup-fields.tsx`

## Reproduce

1. At 390×844 open `/app/review` and compare the hint pill color with the coral "Review" chip.
2. Open `/app/read/stories`, select a length, and compare the ring color with the "Read" chip.
3. Open `/app/import/paste` and look at the step bar.
4. Reveal a Review card and compare the term title color with `/app/triage`.

## Evidence

![app-390-b.jpg](img/app-390-b.jpg)
![review-graded-390.jpg](img/review-graded-390.jpg)

## Also affects

Finding 8 (selected states use the same colors), finding 6.

## Questions the fixer should answer

- Which of these are deliberate (e.g. Stories selection = Quiz purple because AI?) and which are accidents?
- Should flows outside the three modes use neutral selection colors?

## Done when

- Each mode color appears only on that mode's surfaces; flows outside a mode use neutral tokens or their parent's.
- The term title color is the same on every screen that shows a term.

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
