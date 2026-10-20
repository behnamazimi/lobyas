# Finding 5: Section titles inside pages come in five or more sizes and two typefaces

**Severity:** medium | **Category:** visual / typography

## Summary

Titles that introduce a block of content (inside a card or below the page title) use Figtree at 14, 15, 16, 17 and 18 px, or Fraunces at 15, 16, 26 and 28 px, with weight 800, depending on the page.

## Where it shows

- Figtree 800: 14 px (`/app/capture`, `/app/import/more`), 15 px (`/app/mastery`, `/app/settings`), 16 px (`/app` Today, `/app/mastery`), 17 px (`/app/goals`), 18 px (`/app/settings`)
- Fraunces 800: 15 px (`/app/quiz` "Question style"), 16 px (`/app/import` "Or start your own"), 26 px (Browse empty state), 28 px (Library collection name)
- Public: Fraunces 500 at 18 px (`/privacy`, `/terms`), 20 px (collection term cards), 24 px (About-style pages), 48 px (Collections index)

## What is wrong

There is no section-title step on the type scale for the app. The same role ("the heading of a block in a card") is Figtree on Goals, Settings and Mastery, and Fraunces on Quiz and Import, at sizes that differ by 1 px (14, 15, 16, 17, 18).

Rendered `h2` / `h3` samples (font, size / weight, page): Figtree 16/800 Home; Figtree 15/800 Mastery and Settings; Figtree 14/800 Capture and More; Figtree 17/800 Goals; Figtree 18/800 Settings; Fraunces 15/800 Quiz; Fraunces 16/800 Import; Fraunces 28/800 Library.

## What it conflicts with

- Global heading tokens in `app/globals.css`: h1 36, h2 30, h3 24, h4 20, h5 18, h6 16 px, all Fraunces. None of the in-app section titles uses them, and nothing documents an app-specific scale.
- `docs/redesign.md` mentions "serif title, white section cards with rows" for list pages but no section-title size.

## Where to look in the code

- `components/kit/surface/card.tsx` (`SettingsSection`-style title), `components/kit/controls/form-fields.tsx`, `components/kit/study/question-card.tsx`
- Per-page components: `components/goals/`, `components/mastery/`, `components/settings/`, `components/import/`, `components/quiz/`, `components/home/`
- `app/globals.css` (heading defaults)

## Reproduce

1. At 390×844 open `/app/goals`, `/app/settings`, `/app/mastery`, `/app/quiz`, `/app/import`.
2. Inspect the first block title in each (`h2` / `h3`): `font-family`, `font-size`, `font-weight`.

## Evidence

![app-390-a.jpg](img/app-390-a.jpg)
![app-390-b.jpg](img/app-390-b.jpg)

## Also affects

Findings 1 and 4.

## Questions the fixer should answer

- What is the intended step for a block title in the app: serif or sans, and what size?
- Which of these blocks is really a different role (an eyebrow, a row label) rather than a title?

## Done when

- Block titles in the app use one or two named styles; each page's titles map onto them.

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
