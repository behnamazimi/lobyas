# Finding 10: Hover, cursor and focus behavior differs between controls

**Severity:** medium | **Category:** state

## Summary

DaisyUI buttons react to hover and show a 2 px focus ring. Hand-built tiles, rows and chips mostly show no hover change, 53 buttons use the default cursor, and two different focus-ring styles are in use. One text field has no visible focus indicator.

## Where it shows

Measured at 1440×900 on `/app/library`, `/app/goals`, `/app/me`, `/app/browse`, `/app/mastery`, `/app/read`, `/app/review`, `/app/import`, `/app/capture`, `/app/settings`, `/`, `/collections/standup`, `/login`, `/features`.

## What is wrong

Sample: 152 interactive controls (deduplicated by class signature and height).

**Hover**: 90 had no change in background, text color, shadow, outline, transform, opacity, border color or filter. Examples: the rail's collection rows and "Add a collection"; Library action tiles ("Add terms", "Triage", "Filters"); the Read / Review / Quiz chips; Me rows (Mastery, Admin panel, Report an issue, Log out); the study cards; list rows; the "Lobyas" logo link. DaisyUI `btn` and `btn-ghost` controls do change.

**Cursor**: 53 controls have `cursor: default`, all `<button>`s: the rail's collection switcher and rows, the streak card, the − / + steppers on Goals, "Read options", "Review options", the "All 0" filter chips, "More details", "Analytics choice". Links and some buttons have `pointer`. Tailwind v4's preflight resets `button` to `cursor: default`; some components add `cursor-pointer` and others don't.

**Focus**: after a keyboard Tab, 75 custom controls show the browser's default `outline-style: auto; outline-width: 1px`, while DaisyUI controls show `outline: 2px solid`. The `#capture-term` input on `/app/capture` shows neither an outline nor a box-shadow change when focused (`outline: none`).
Also: on desktop the 3rd Tab stop from the top of every app page is `div.dropdown-content` (the collection switcher's list), whose computed opacity is 0, so focus lands on an invisible element.

Hover feedback isn't expected on touch, but the same screens are used at 1440 with a mouse.

## What it conflicts with

- Keyboard visibility: WCAG 2.4.7 and 2.4.11 (focus must be visible and not hidden).
- `app/globals.css` sets `.btn` styles but no shared rule for custom controls.

## Where to look in the code

- `app/globals.css` (base layer, `.btn` rules), `components/kit/controls/pill.tsx`, `components/kit/controls/chip.tsx`, `components/kit/surface/list-row.tsx`
- `components/app/shell/app-rail.tsx`, `components/kit/shell/collection-switcher-row.tsx` (the dropdown)
- `components/capture/` (term field), `components/kit/controls/form-fields.tsx`

## Reproduce

1. At 1440×900 open `/app/library`; hover "Add terms", "Filters", a term row, then `/app/me` and hover "Mastery", "Log out". Compare computed styles before and after.
2. Press Tab from the top of `/app/library` and note what receives focus at the third stop.
3. Open `/app/capture`, focus the Term field, and look for a ring.
4. Inspect `cursor` on the rail's collection button vs "Add a collection".

## Evidence

No screenshot; the evidence is measured values (see "What is wrong").

## Also affects

Finding 8 (selected states).

## Questions the fixer should answer

- What should be the default hover/active/focus language for hand-built controls: a shared utility, or per component?
- Should the closed collection switcher's content be removed from the tab order (display or `inert`) until it opens?

## Done when

- Every interactive control has a visible focus indicator that is the same style across the app, and a hover and cursor behavior that matches its role.
- Tabbing through any app page never stops on an invisible element.

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
