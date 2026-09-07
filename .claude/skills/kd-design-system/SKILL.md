---
name: kd-design-system
description: Rules for building any page of the K.D. Constructions site. Use before writing or editing any .astro markup, component or stylesheet in this repo — including /about and /projects, which have no Figma behind them.
---

# K.D. Constructions — house rules

The homepage design is client-approved and **locked**; every other page is
derived from it. Fidelity is the requirement. Deviation is a defect, including
deviation you believe is an improvement. Do not exercise aesthetic judgement.

**Read first, every time:** `src/styles/tokens.css` (the design as values) and
`DESIGN-SYSTEM.md` (the design as rules — §2 bands, §3 kicker, §4 card grammar,
§5 media, §10 mobile).

## Hard rules

- **No hex or rgba() literal and no raw px font-size** outside `tokens.css`.
  If you are typing `#2C3A40`, it is `bg-kd-ink`.
- **No rounded corners.** Never `border-radius`, never a `rounded-*` utility.
  There is not one in the approved design.
- **Every text node carries a `data-edit` key**, written as you write the node,
  never in a later pass. It mirrors the copy object's path with the page as
  first segment — `copy.intro.lead` on /about is `about.intro.lead`. Keys are
  unique per page and are database identities: never renumber, never reuse a
  retired one.
- **No hardcoded strings in markup.** Copy lives in `src/data/<page>.ts`.
- **Do not add a token.** A value absent from `tokens.css` did not come from
  the approved frame.
- Spacing utilities are literal pixels (`--spacing: 1px`): `py-96` is 96px.

**Frozen** — ported from a working system, do not refactor, rename or tidy;
fix only what is broken and say what you changed:
`src/lib/{edit-auth,db,editable}.ts`, `src/scripts/inline-edit.js`,
`src/pages/api/content*`, `src/pages/api/edit-session.ts`, BaseLayout's editor
script tags.

**Before reporting done:** `npm run build` clean · both greps above return
nothing · every rendered `data-edit` key unique · the editor saves and repaints.
