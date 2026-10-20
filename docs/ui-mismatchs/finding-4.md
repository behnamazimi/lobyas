# Finding 4: Card surfaces use five different radius, shadow and padding combinations

**Severity:** medium | **Category:** visual

## Summary

The kit has one `Card` (24 or 28 px radius, soft shadow). In practice the app also has cards with a 14, 16 and 18 px radius, different shadows and a different inner padding, so panels next to each other on a page, or on neighbouring pages, don't look like one family.

## Where it shows

Phone and desktop, signed in:
- 24 px radius, `shadow-card` (white): `/app/library`, `/app/goals`, `/app/me`, `/app/mastery`, `/app/browse`, `/app/import`, `/app/import/apps/*`
- 14 px radius, a thin `0 1px 2px` shadow (white): `/app/capture` (fields), `/app/settings`, `/app/import/more`
- 28 px radius: study cards on `/app/read`, `/app/review`, `/app/triage`
- 18 px radius: `/app/quiz` setup (answer field and style tiles)
- 16 px radius: `/app/import/paste` (textarea card)
- Public collection cards (`/collections/[slug]`, `/c/[id]`): 24 px radius with a ring-plus-two-layer shadow (`shadow-surface`)

## What is wrong

Measured card signatures (background | radius | shadow | inner padding):

- white | 24 | `shadow-card` | 16 / 4 / 0
- white | 16 | `shadow-card` | 0 / 14
- white | 14 | `0 1px 2px` only | 0 / 14 and 12 / 14
- white | 28 | none on the face (study) | 24 / 24
- tint (quiz purple) | 18, white | 18
- white | 24 | `shadow-surface` (ring) | 20 / 20 on public pages

The kit's own `Card` only offers 24 and 28 px (`components/kit/surface/card.tsx`). The 14, 16 and 18 px surfaces are hand-written classes (for example `rounded-[14px]` on Capture, Settings and More ways to add fields; `rounded-[18px]` on Quiz).

Inner padding varies between 0, 4, 8, 12, 14, 16, 20 and 24 px for the same kind of block.

## What it conflicts with

- `docs/redesign.md`: build every screen from the shared kit; if a new building block is needed, add it to the kit and its story on the kit page.
- The kit `Card` doc comment: "White surface with the soft two-layer shadow. `radius` is 24 (`md`) or 28 (`lg`) px."
- The kit page at `/admin/kit` is the design reference for these.

## Where to look in the code

- `components/kit/surface/card.tsx`, `components/kit/surface/list-row.tsx`, `components/kit/controls/form-fields.tsx`
- Hard-coded radii: `grep -rn "rounded-\[14px\]\|rounded-\[18px\]" components app`
- `app/globals.css` (`.shadow-card`, `.shadow-surface`, `.flow-fields`)

## Reproduce

1. At 390×844 open `/app/goals`, `/app/capture`, `/app/import/paste`, `/app/quiz`.
2. Inspect the surfaces: `border-radius`, `box-shadow`, `padding`.
3. Compare with `/admin/kit` for the intended cards.

## Evidence

![app-390-a.jpg](img/app-390-a.jpg)
![app-390-b.jpg](img/app-390-b.jpg)

## Also affects

Finding 5 (section titles), finding 12 (icon tiles).

## Questions the fixer should answer

- Are the 14 px field surfaces (Capture, Settings) meant to be fields rather than cards? If yes, is there a field token that should be shared with Quiz's 18 px and Paste's 16 px?
- Is the study card's 28 px radius the `lg` Card or its own element?
- Should public collection cards use the same shadow token as the app?

## Done when

- Cards and field surfaces use kit components or documented tokens; the radius set in use on the app is small and each value has a reason.
- No page mixes two card radii for sibling panels.

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
