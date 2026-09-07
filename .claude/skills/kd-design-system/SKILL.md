---
name: kd-design-system
description: Rules for building any page of the K.D. Constructions site. Use before writing or editing any .astro markup, component, or stylesheet in this repo — including new pages such as /about and /projects that have no Figma behind them.
---

# K.D. Constructions — house rules

The homepage design is client-approved and **locked**. Every other page is
derived from it. Fidelity is the requirement; deviation is a defect, including
deviation you believe is an improvement. Do not exercise aesthetic judgement.

## Before writing any markup

Read both, in full, every time:

1. `src/styles/tokens.css` — the design, as values.
2. `DESIGN-SYSTEM.md` — the design, as rules. §2 band rhythm, §3 kicker,
   §4 card grammar, §5 media, §10 mobile.

## Hard rules

- **No hex literal, no `rgb()`/`rgba()` literal, no raw px font-size** outside
  `src/styles/tokens.css`. Use the token or its Tailwind utility. If you are
  typing `#2C3A40`, you have made a mistake — it is `bg-kd-ink`.
- **No rounded corners.** Never write `border-radius`; never use a `rounded-*`
  utility. There is not one rounded corner in the approved design.
- **Every text node carries a `data-edit` key**, written at the same moment as
  the node, never added in a later pass. The key mirrors the copy object's path
  with the page as its first segment — `data-edit="about.intro.lead"` for
  `copy.intro.lead` on `/about`. Keys are unique per page and are database
  identities: never renumber one, never reuse a retired one.
- **No hardcoded strings in markup.** Copy lives in `src/data/<page>.ts` as a
  typed object; templates read from it.
- **Do not add a design token.** A value not in `tokens.css` did not come from
  the approved frame.
- Spacing utilities are literal pixels (`--spacing: 1px`): `py-96` is 96px.

## Frozen files

`src/lib/edit-auth.ts`, `src/lib/db.ts`, `src/lib/editable.ts`,
`src/scripts/inline-edit.js`, `src/pages/api/content*`, `src/pages/api/edit-session.ts`
and the editor script tags in `BaseLayout.astro` are ported from a working
system. Do not refactor, rename or tidy them. Fix only what is broken, and say
what you changed.

## Verify before reporting done

`npm run build` clean · the two greps above return nothing · every rendered
`data-edit` key unique · the editor still saves and repaints.
