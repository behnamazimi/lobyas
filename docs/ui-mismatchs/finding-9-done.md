# Finding 9: Pinned primary actions sit in different places and sizes

**Severity:** medium | **Category:** layout

## Summary

The main action of a form is pinned to the bottom of the window on some pages and sits directly under its content on others; its height is 44, 58 or 60 px depending on the page.

## Where it shows

- Desktop: `/app/capture` "Save term" is pinned to the bottom of the window, hundreds of pixels below the fields; `/app/goals` "Save goals" sits directly under the content.
- Phone: sticky action bars are 104 px (Goals, app guides), 156 px (Capture, Quizlet guide, Request) or 172 px (Duolingo guide) tall.
- Primary button heights: 60 px (Capture, Goals, app guides, Triage "I know this"), 58 px (Read "Show definition"), 44 px (404, offline, Home "Continue", Review small buttons).

## What is wrong

`PinnedAction` (`components/kit/surface/pinned-action.tsx`) is `sticky bottom-0` with its own padding; the page's own container decides what "bottom" means. On a tall desktop window with a short form, the button ends up at the window edge far from the fields.

Button measures: `btn btn-neutral` pills at 60 px with 17 px / 800 text; the Read CTA at 58 px; 44 px / 15 px pills elsewhere.

## What it conflicts with

- `docs/redesign.md`, "Desktop conventions that apply everywhere": "Pinned bottom actions sit under the content instead of at the screen edge."
- Phone rule in the same doc: "Primary actions pinned above the safe area."
- Tap-target rule: at least 44 px.

## Where to look in the code

- `components/kit/surface/pinned-action.tsx` and every user of `PinnedAction` (`grep -rn PinnedAction components app`)
- `components/capture/`, `components/goals/goals-page.tsx`, `components/import/`, `components/kit/study/` (CTA)
- `app/globals.css` (`pb-safe`, dock utilities)

## Reproduce

1. At 1440×900 open `/app/capture` and `/app/goals`; note where the primary button is.
2. At 390×844 open `/app/capture`, `/app/goals`, `/app/import/apps/anki`; measure the sticky bar and button heights.

## Evidence

![app-1440-a.jpg](img/app-1440-a.jpg)
![app-390-a.jpg](img/app-390-a.jpg)

## Also affects

Finding 4 (cards), finding 10 (states).

## Questions the fixer should answer

- Which rule is right for desktop: under the content or at the window edge? The redesign doc says under; Capture does the opposite.
- Is the 58 vs 60 px difference deliberate for the study CTAs?

## Done when

- On desktop every pinned action sits under its content (or the doc is updated with a reason to differ).
- Primary action heights follow one rule per context.

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
