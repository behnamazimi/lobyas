# Finding 14: Copy conflicts on one screen and naming drift across the add flows

**Severity:** low | **Category:** copy

## Summary

Two sentences on the same Paste screen give different rules for separators, the JSON sample is clipped by its copy button, and the flow that adds terms has three names.

## Where it shows

- `/app/import/paste`: the box placeholder says a "dash or colon" before the definition; the note below says "a dash, tab or comma".
- `/app/import/more`: the JSON sample's first lines are cut by the copy button (`"collection": "Software Engineerin…"`), and the block scrolls sideways.
- Names: "Add terms" (Library action tile and sheet), "Add a term" (Capture page title), "Add a collection" (Import page title, Me row, tab title for every `/app/import/*` page).

## What is wrong

Strings: `components/import/paste-step.tsx:14` ("with a dash or colon before its definition") and `:152` ("Put a definition after a dash, tab or comma"); `lib/import/read-input.ts:27` repeats the dash-or-colon version in an error. The parser (`lib/import/parse/`) is the authority for which separators work.
All `/app/import/*` pages use the browser title "Add a collection" (the tab title is the same for "From Quizlet", "Paste a list" and "Request a collection").

## What it conflicts with

- `docs/import.md` describes the parsers; copy must match them.
- `AGENTS.md` brand rules: say "terms", not "jargon"; no admin or automation wording.

## Where to look in the code

- `components/import/paste-step.tsx`, `lib/import/read-input.ts`, `lib/import/parse/`, `components/import/import-chooser.tsx`, `components/import/copy-icon-button.tsx`, `components/import/import-copy-command.tsx`
- Titles: `app/(private)/app/import/**/page.tsx` metadata

## Reproduce

1. At 390×844 open `/app/import/paste` and read the placeholder and the note below.
2. Open `/app/import/more` and look at the JSON sample.
3. Compare the page names across Library, Capture, Import.

## Evidence

![app-390-b.jpg](img/app-390-b.jpg)

## Also affects

Finding 13 (nouns).

## Questions the fixer should answer

- Which separators does the parser accept? The copy should state exactly that set once.
- Should the add flows share one noun, or is "term" vs "collection" the real distinction?

## Done when

- The Paste screen states one rule that matches the parser.
- The sample code block is readable without horizontal scroll or has no control overlapping its text.
- Page titles identify the page.

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
