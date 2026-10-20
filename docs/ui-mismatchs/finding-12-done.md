# Finding 12: Icon tiles are tinted on some lists and neutral on others

**Severity:** low | **Category:** visual

## Summary

Rows in similar lists use differently colored icon tiles.

## Where it shows

- Tinted (green / blue / coral / purple): `/app/me` first group (Mastery, Browse collections, Add a collection), `/app/import` "Or start your own" (Paste a list, From another app, One term, Start an empty collection), Goals tier cards.
- Neutral beige: `/app/me` second group (Settings, Admin panel, Report an issue), `/app/import/apps` (the letter tiles for Quizlet, Anki, Google Translate, Noji, Mochi, Brainscape, Duolingo, Memrise, Something else).

## What is wrong

The same list-row pattern is drawn with a colored tile in one group and a beige tile in the next group on the same page (Me). The Import page uses colored tiles for "start your own" and the app list beneath it uses one neutral tile for every row. The colors have no consistent meaning (Mastery is green, Browse blue, Add coral).

## What it conflicts with

- `docs/redesign.md` (Illustrations / tones): color is tied to modes and states; there is no rule that assigns icon-tile colors to destinations.

## Where to look in the code

- `components/kit/surface/list-row.tsx`, `components/me/me-menu.tsx`, `components/import/import-chooser.tsx` and the app list under `components/import/`
- `components/kit/tones.ts`

## Reproduce

1. At 390×844 open `/app/me` and `/app/import` and `/app/import/apps` and compare the icon tiles.

## Evidence

![app-390-a.jpg](img/app-390-a.jpg)

## Also affects

Finding 7 (color meaning).

## Questions the fixer should answer

- Do tile colors carry meaning? If not, should all be neutral, or should every group be tinted from a stated rule?

## Done when

- A stated rule decides tile color, and Me, Import and the app list follow it.

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
