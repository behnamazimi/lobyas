# Finding 16: Dark theme ("dim"): cohesive on the app pages, with a few defects and no OS preference

**Severity:** low | **Category:** theming

## Summary

Review of ten app pages in the dim theme found no unstyled or old-colored areas. The defects found there are listed here so a fixer checks the theme when working on the other findings.

## Where it shows

`/app`, `/app/library`, `/app/goals`, `/app/me`, `/app/mastery`, `/app/capture`, `/app/settings`, `/app/import/paste`, `/app/read`, `/app/quiz` at 390 px, `theme=dim` cookie.

## What is wrong

- Avatar initials (rail, header, Me): `#93deb5` text on a `#9af3b9` tile = 1.19:1 (the text is probably the dim `primary-text` step on a `primary`-based tile; confirm in `components/ui/avatar.tsx`). Appears on every page in dim.
- Mastery Overview/Terms control: no visible selected state (finding 8).
- The brand tile (`ill-mark-tile`) stays light mint `#e8f5e7` on the dark header; probably intended, but it is the only light fixed-color block there.
- The theme ignores `prefers-color-scheme`: with an OS in dark mode and no cookie the app renders light (`data-theme="emerald"`); the theme is read from the `theme` cookie only (`lib/theme.ts`). Not a bug if intended; recorded as a behavior to confirm.
- `<meta name="theme-color">` is one fixed color regardless of theme (finding 15).
Not covered: dim for public pages (measured for contrast, not reviewed by eye), overlays in dim, admin.

## What it conflicts with

- `app/globals.css` defines `emerald` (light) and `dim` with the contrast steps (`--primary-text`, `--read-text`, …) meant to give 4.5:1 on white and on tints.

## Where to look in the code

- `app/globals.css` (theme blocks), `components/ui/avatar.tsx`, `components/settings/profile-menu.tsx` (avatar fallback classes)
- `lib/theme.ts`, `components/theme-toggle.tsx`

## Reproduce

1. Set the cookie `theme=dim` (or use the toggle on Me).
2. Open any app page and inspect the avatar initials color and background.
3. Emulate `prefers-color-scheme: dark` with a fresh browser profile and open `/`.

## Evidence

![app-dark-390.jpg](img/app-dark-390.jpg)

## Also affects

Findings 8 and 15.

## Questions the fixer should answer

- Should first-time visitors follow the OS preference?
- What should the avatar tile's fill be in dim so the initials reach 4.5:1?

## Done when

- Avatar initials reach 4.5:1 in both themes.
- Whether the theme follows the OS is a stated decision.

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
