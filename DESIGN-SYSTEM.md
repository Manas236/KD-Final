# K.D. Constructions — design system

**Read this and `src/styles/tokens.css` before writing any markup.**

The Figma covers the **homepage** and **`/about`**. `/projects` has no design and
will be derived from this file. So this file is written as **rules you follow**,
not as a description of what the homepage happens to look like. Where a rule was
inferred rather than designed, it says so.

`/about` arrived after the homepage shipped, as a generated export that had been
snapped to Tailwind's *default* spacing scale rather than this project's. Where
it disagreed with a rule below, the rule won and the export's value was recorded
in `OPEN-QUESTIONS.md` #15. Where it introduced something this file says does not
exist, that is #16. Read both before treating `/about` as a precedent.

The design is client-approved and **locked**. Fidelity is the requirement.
Deviation is a defect — including deviation you believe is an improvement.

---

## 0. The three hard rules

1. **No hex literal and no raw px font-size outside `src/styles/tokens.css`.**
   Use the token, or the Tailwind utility built from it. Gate:
   `grep -rniE "#[0-9a-f]{6}" src/ --include=*.astro --include=*.ts`
   must return nothing.
2. **No rounded corners. Anywhere.** There is not one in the approved frame.
   Never write `border-radius`, never reach for a `rounded-*` utility. Gate:
   `grep -rn "rounded\|border-radius" src/` must return nothing.
3. **Every text node carries a `data-edit` key, written as you write the node —
   not added afterwards.** See §9.

### Two build settings that hold rules 1–3 up

Both are in `astro.config.mjs` / `src/styles/tokens.css`, both look like
performance settings, and both break something silently if reverted.

- **`compressHTML: false`.** Astro's compressor strips whitespace between tags.
  The hero H1 is one sentence split across two spans so the second can be mint,
  and the footer copyright puts a generated year beside an editable legal name —
  in both, that whitespace is a **word gap**. Compressed, they render
  `Infrastructure,Brick by Brick.` and `© 2026Kailashchandra…`. Do not turn it
  back on without checking both.
- **`@import "tailwindcss" source(none)` + `@source "../**/*.{astro,ts,…}"`.**
  Tailwind's automatic content detection walks the whole project and treats any
  bare word as a possible utility — including the words in *this document*,
  which was compiling a corner-radius utility into the shipped stylesheet.
  Scanning is scoped to `src/` so that a document describing the design system
  cannot add to it. If a template ever moves outside `src/`, add it to `@source`
  or its classes will silently not exist.

---

## 1. Reading the spacing scale

`tokens.css` sets `--spacing: 1px`. Every numeric spacing utility therefore
reads as its own pixel value:

| You write | You get |
|---|---|
| `py-96` | 96px block padding |
| `px-48` | 48px inline padding |
| `gap-16` | 16px gap |
| `p-40` | 40px padding |
| `w-704` | 704px wide |
| `h-1` | 1px tall |

There is no t-shirt scale to translate through. The design's numbers go into the
markup unchanged. If you catch yourself computing `24 / 4 = 6`, stop — write
`p-24`.

**The gap scale actually used is: 6, 8, 12, 16, 20, 24, 32, 40, 56.** A gap
outside that list did not come from the design. Do not introduce one.

---

## 2. Band rhythm

The page is a stack of full-width **bands**. Each band paints one surface edge
to edge and holds one `1280px` container inside it.

The homepage order is:

| # | Band | Surface | Utility |
|---|---|---|---|
| 1 | Nav | ink | `bg-kd-ink` |
| 2 | Hero | ink + image | `bg-kd-ink` + backdrop |
| 3 | About | mist | `bg-kd-mist` |
| 4 | Capabilities | white | `bg-white` |
| 5 | Projects | ink | `bg-kd-ink` |
| 6 | Differentiators | mist | `bg-kd-mist` |
| 7 | Closing CTA | ink | `bg-kd-ink` |
| 8 | Footer | ink-deep | `bg-kd-ink-deep` |

`/about` is:

| # | Band | Surface | Utility |
|---|---|---|---|
| 1 | Nav | ink | `bg-kd-ink` |
| 2 | Hero | ink + image | `bg-kd-ink` + backdrop |
| 3 | Our Story | white | `bg-white` |
| 4 | Our Journey | mist | `bg-kd-mist` |
| 5 | Board of Directors | white | `bg-white` |
| 6 | Health, Safety & Environment | ink | `bg-kd-ink` |
| 7 | Vision 2030 | ink | `bg-kd-ink` |
| 8 | Footer | ink-deep | `bg-kd-ink-deep` |

> ⚠️ **`/about` breaks the alternation twice** — 4→5 is light on light and
> 6→7 is ink on ink. That is what its export draws and it is built as drawn.
> **It is not a precedent.** `OPEN-QUESTIONS.md` #17 has the reasoning and the
> one-word fix for each. Derive `/projects` from the rules below, not from
> `/about`'s band table.

`/projects` arrived after this was written, as its own export, and is:

| # | Band | Surface | Utility |
|---|---|---|---|
| 1 | Nav | ink | `bg-kd-ink` |
| 2 | Hero | ink + image | `bg-kd-ink` + backdrop |
| 3 | Filters | mist | `bg-kd-mist` |
| 4 | Listing | ink | `bg-kd-ink` |
| 5 | Beyond the railway | mist | `bg-kd-mist` |
| 6 | Closing CTA | ink | `bg-kd-ink` |
| 7 | Footer | ink-deep | `bg-kd-ink-deep` |

> Band 5 is not in the export — added 2026-09-17 at the user's request
> (`OPEN-QUESTIONS.md` #30) and, being light, sits where the alternation puts
> it. Before it, `/projects` broke the alternation once, the same shape as
> `/about`'s 6→7: Listing → Closing CTA was ink on ink, built as drawn
> (`OPEN-QUESTIONS.md` #18). The Gallery tab swaps Listing for the ink Gallery
> band and hides band 5, and the Live tab hides band 5 too — on those two
> views the ink-on-ink boundary is still what the page shows, as drawn.
> Neither state is a precedent for whatever comes after `/projects`.

`/resources/vindhane-plant` (2026-09-18, `OPEN-QUESTIONS.md` #33 — no export;
derived from the rules below) is:

| # | Band | Surface | Utility |
|---|---|---|---|
| 1 | Nav | ink | `bg-kd-ink` |
| 2 | Hero | ink + image | `bg-kd-ink` + backdrop |
| 3 | The Plant (overview, lists, gallery) | white | `bg-white` |
| 4 | Fabrication & Erection (ledger + button) | ink | `bg-kd-ink` |
| 5 | Footer | ink-deep | `bg-kd-ink-deep` |

> Four bands, no repeat. The page's button sits inside band 4 rather than in
> a centred CTA band of its own, because a fifth band after an ink band would
> be ink on ink — the same reason `/projects` keeps its steel ledger inside
> the Listing band (#31). The centred kicker (§3) is therefore not used here.

`/projects/<slug>` — both kinds: the railway project pages
(`ProjectDetailPage.astro`, `OPEN-QUESTIONS.md` #21) and, since 2026-09-19,
the "Beyond the railway" project pages (`SocialProjectPage.astro`, #36) — is:

| # | Band | Surface | Utility |
|---|---|---|---|
| 1 | Nav | ink | `bg-kd-ink` |
| 2 | Hero (back link, kicker, H1, client or location, tiles) | ink + image | `bg-kd-ink` + backdrop |
| 3 | Overview (paragraphs, then the gallery block) | white | `bg-white` |
| 4 | Closing CTA (centred) | ink | `bg-kd-ink` |
| 5 | Footer | ink-deep | `bg-kd-ink-deep` |

> A Beyond the railway project with no photograph has no backdrop: band 2 is
> plain ink, and the gallery block in band 3 holds a placeholder tile the size
> of a gallery tile. Its four hero tiles follow the plant page's grid — a figure
> or a dashed placeholder (§9) — always Client · size · Scope of works · Year
> completed, in that order.

`/404` (2026-09-18, `OPEN-QUESTIONS.md` #35 — no export; derived from the
rules below) is:

| # | Band | Surface | Utility |
|---|---|---|---|
| 1 | Nav | ink | `bg-kd-ink` |
| 2 | Hero (kicker, H1, one sentence, one button) | ink | `bg-kd-ink` |
| 3 | Footer | ink-deep | `bg-kd-ink-deep` |

> The shortest page on the site. The button sits inside the hero for the
> plant page's reason — a CTA band after it would be ink on ink — and the
> kicker is left-aligned because the band is not centred end to end. The
> hero is `min-h-screen` with its content centred vertically, which is
> `/studio/[key]`'s treatment and no other page's: with only four lines in
> it, a flow-height hero leaves the document's ink ground showing below the
> footer as a third, empty band. Its padding is still `pt-144 pb-80`. **Not
> a precedent** for a content page, which has sections to fill the height.

### The rules a new page follows

- **Never two adjacent bands of the same surface.** The band boundary is the
  only thing separating two sections; two ink bands in a row read as one very
  long band with a stray gap in it. Alternate.
- The alternation is **dark → light → dark**, not a random shuffle. `white` and
  `mist` are both light; either may follow an ink band and either may precede
  one. `ink-deep` is reserved for the footer.
- A page always **opens** under the fixed nav on ink (the hero) and always
  **closes** on `ink-deep` (the footer).
- Every band is `py-96`. The footer is `py-64`. The hero is the one exception:
  `pt-144 pb-80`, because it sits under the 88px fixed nav.
- Every band's inner container is `max-w-kd mx-auto px-48` — 1280px wide,
  48px gutters. Nothing is ever wider than that container except a background
  or an image that is deliberately full-bleed.

### Text colour by surface

| Surface | Body copy | Headings | Muted / meta |
|---|---|---|---|
| ink | `text-kd-mist` | `text-kd-mist` | `text-kd-fog` |
| ink-deep | `text-kd-mist` | `text-kd-mist` | `text-kd-slate` |
| mist | `text-kd-slate-2` | `text-kd-ink` | `text-kd-slate` |
| white | `text-kd-slate-2` | `text-kd-ink` | `text-kd-slate` |

Mint is an **accent**, never body copy: kickers, rules, buttons, stat numerals,
one heading span, one card top border.

---

## 3. The kicker

**Every section opens with a kicker.** No section heading appears without one.

### Left-aligned variant — the default

```
[32×1px mint rule]  12px gap  KICKER LABEL
                    16px
                    Section H2 (Fraunces 36px)
```

- Rule: `w-32 h-1 bg-kd-mint`, vertically centred against the label.
- Label: `text-kicker uppercase text-kd-mint` — 11px, 2.2px tracking, Inter 600.
- Gap between rule and label: `gap-12`.
- Space between the kicker row and the H2: `mt-16`.
- H2: `font-display text-d4` — Fraunces 700, 36/40.

### Centred variant — closing CTA only

```
[32×1px rule]  12px  KICKER LABEL  12px  [32×1px rule]
```

A rule on **both** sides of the label, the whole row centred. Used by the
closing CTA band and nothing else on the homepage. On a new page, use it only
for a band that is itself centred end to end.

---

## 4. Card grammar

**Three card types exist. They are not interchangeable.** Each one belongs to a
kind of content, and using the wrong one is a defect even though it will look
plausible.

### 4.1 Stat tile — *a number and what it counts, on a dark band*

- Fill `bg-kd-stat-fill` (6%), border `border border-kd-stat-border` (10%).
- Padding `p-24`.
- Content, in order: **mint numeral** (`font-display text-d5 text-kd-mint`),
  then an **uppercase grey label** (`text-label uppercase text-kd-slate`).
- No title, no body copy, no rule, no border on any single edge.
- Use for: figures. Revenue, years, unit counts, targets. Nothing prose.

### 4.2 Capability card — *a numbered discipline, in a row of equals*

- **2px ink top border** (`border-t-2 border-t-kd-ink`).
- **1px ink divider on the right edge of every card except the last**
  (`border-r border-r-kd-card-border-light`).
- Padding `p-32`. **No gap between cards** — the dividers come from the borders,
  and a gap would put daylight either side of every line.
- Content, in order: **numeral** (`text-num text-kd-mint`, e.g. `01`) →
  **title** (`font-display text-d8`) → **body** (`text-body-sm text-kd-slate-2`)
  → **32×1px mint rule at the foot of the card**.
- Use for: an enumerated set where the order means something — 01, 02, 03, 04.

### 4.3 Differentiator card — *a claim and its argument*

- **3px top border**: mint on the first card, `border-kd-card-border-light` on
  every other.
- **1px left divider on every card except the first**, same colour as its top
  border.
- Padding `p-40`. **No gap between cards.**
- Content, in order: **title** (`font-display text-d7`) → **body**
  (`text-body-sm text-kd-slate-2`). **No numeral** — that is what separates it
  from 4.2 at a glance.
- Use for: reasons to choose the company. Unordered, rhetorical, prose.

### What all three share

Square corners, no shadow, no hover lift, no background image. A card is a
bordered region of the band it sits on, not an object floating above it.

---

## 5. Media

- Images are **always full-bleed inside their box**: `object-cover`, filling
  100% of width and height. The box size is fixed by the layout.
- **Always overlaid with a scrim.** `--kd-scrim-lg` on large cards,
  `--kd-scrim-sm` on small ones, `--kd-hero-overlay` on the hero. There is no
  bare photograph anywhere in the design.
- **Never rounded. Never bordered.** No frame, no inset line, no ring.
- **Text sits at the bottom of the box**, over the dense end of the scrim:
  `32px` in on large cards, `20px` on small ones.
- If a source photo's aspect ratio does not match its box, **crop it** with
  `object-position`. Never letterbox, never pad, never change the box.
- Use `<Image>` from `astro:assets` with explicit `width`/`height`. `eager` for
  anything above the fold, `lazy` for everything below it.

---

## 6. Buttons and links

| Kind | Fill | Text | Border | Type |
|---|---|---|---|---|
| Primary | `bg-kd-mint` | `text-kd-ink-deep` | none | `text-ui` |
| Primary, large | `bg-kd-mint` | `text-kd-ink-deep` | none | `text-ui-lg` |
| Ghost (on dark) | none | `text-kd-mist` | `border border-kd-ghost-outline` | `text-ui` |

- Padding is `px-24 py-12` on a standard button, `px-32 py-16` on the large CTA.
- An arrow is an inline SVG **after** the label, `gap-8`, `aria-hidden`, sized
  in `em` so it tracks the label.
- **Nav links**: `text-nav` — 14px, 0.28px tracking, Inter 500, `text-kd-mist`.
  The **active** link is `text-kd-mint` with a **1px mint bottom border**. That
  border is the only underline in the design; never use `text-decoration`.
- Standalone section links ("View All Projects") are `text-ui text-kd-mint` with
  a trailing arrow, right-aligned against the section heading.

---

## 7. Chrome

- **Nav is fixed**, full width, `h-88`, `bg-kd-ink`, with a 1px bottom border in
  `border-kd-nav-border`. Because it is fixed, the first band of every page
  must clear it — the hero does that with `pt-144`.
- **Logo** is 102×68 in the nav and 120×80 in the footer. Same asset, two boxes.
  It is a transparent PNG and must sit on ink; never place it on mist or white
  without checking it first.
- **Badges** (project discipline chips) are the only use of `--kd-teal`:
  `bg-kd-badge-fill` with `border border-kd-badge-border`, `text-badge uppercase`
  on a large card and `text-badge-sm uppercase` on a small one, `px-8 py-6`.
- **Footer** is four columns: a `260px` brand block, then three equal columns.
  Column heads are `text-kicker-sm uppercase`. A bottom bar is separated by a
  1px `border-kd-footer-divider` top border with `pt-24`, legal left, founding
  line right.

---

## 8. Type — which token goes where

Family is never part of the size token. `d1`–`d9` are **Fraunces**: add
`font-display`. Everything else inherits **Inter** from `body`.

| Role | Token |
|---|---|
| Page H1 | `text-d1` |
| Closing CTA headline | `text-d2` |
| Pull-quote | `text-d3` |
| Section H2 | `text-d4` |
| Stat numeral (dark band) | `text-d5` |
| Featured card title; large stat | `text-d6` |
| Differentiator title | `text-d7` |
| Capability card title | `text-d8` |
| Small card title | `text-d9` |
| Lead paragraph under an H1 | `text-body-lg` |
| Lead paragraph in a section | `text-body` |
| Card body, secondary copy | `text-body-sm` |
| Button label | `text-ui` / `text-ui-lg` |
| Nav link | `text-nav` |
| Meta line on dark | `text-meta` / `text-meta-sm` |
| Stat tile label | `text-label` + `uppercase` |
| Stat caption on light | `text-label-sm` |
| Enumeration numeral | `text-num` |
| Section eyebrow | `text-kicker` + `uppercase` |
| Footer column head | `text-kicker-sm` + `uppercase` |
| Badge | `text-badge` / `text-badge-sm` + `uppercase` |

The tokens that need `uppercase` carry the tracking that only makes sense in
caps. If you use one without `uppercase`, you have used the wrong token.

---

## 9. Editable slots

Every text node in the markup carries a **declared named slot key**:

```astro
<h1 data-edit="home.hero.headline">{copy.hero.headline}</h1>
```

Rules:

- **The key mirrors the copy object's path**, with the page as the first
  segment: `copy.hero.headline` on the homepage is `home.hero.headline`. On
  `/about` it would be `about.…`.
- **Keys are authored by hand and stored as-is.** They are not computed from
  the DOM. This is the whole point — a key survives the section around it being
  rewritten, and survives its own copy being edited.
- **One key, one element, one run of text.** Put `data-edit` on the element that
  holds exactly one text node. A heading split across two coloured spans is two
  keys, on the two spans — not one on the heading.
- **Keys are unique per page** and never reused across pages. That includes the
  shared chrome: `Nav` and `SiteFooter` render on every page, so they take a
  `page` prop that supplies the first segment of every key they write —
  `home.nav.links.0.label` on `/`, `about.nav.links.0.label` on `/about`. The
  *copy* is still one object (`about.ts` re-exports `home.ts`'s `nav` and
  `footer`), so a label has one definition site and per-page keys.
- **Never renumber, never reuse a retired key.** A key is a database identity:
  rows in `content_edits` are filed under it. Changing `home.about.body1` to
  `home.about.lead` orphans every edit made to it.
- Lowercase, dot-separated, `[a-z0-9-]` within a segment. Array items are
  indexed: `home.capabilities.cards.0.title`.
- Copy lives in `src/data/<page>.ts` as a typed object. **No hardcoded strings
  in markup.**

### Placeholders — review only, never a design element

An item with `pending: "<label>"` in its copy module is content K.D. has not
supplied. It renders as the ordinary card or tile with two marks a client
cannot miss: a **dashed** border and the project cards' teal badge chip
carrying the label (ink text on a light band, mist on ink). Nothing else
changes: no new colour, no new type step, no new token. The label is its own
slot (`…items.3.pending`), so the copy gate is unchanged. Every pending
element carries `data-pending`; `npm run check:placeholders` lists them and
fails while any exists, and `PRE-LAUNCH.md` says what closes each. None may
exist at go-live. The dashed border is not in the approved design and is
there precisely so it gets removed. OPEN-QUESTIONS.md #32.

---

## 10. Mobile — **INFERRED, NOT DESIGNED**

> ⚠️ **No mobile frame exists.** Everything in this section is my inference from
> the desktop frame, not a designer's decision. It is listed in
> `OPEN-QUESTIONS.md` #3 for that reason.
>
> **Built, on this inference, for the homepage and the shared chrome** (`Nav`,
> `SiteFooter`) — at the user's direction, after the homepage shipped visibly
> broken on a phone. `/about`'s own sections (`Story`, `Journey`, `Board`,
> `Hse`, `Cta`) are **not** built to this spec yet and remain fixed-desktop;
> when they are, the rules below are what to build them against.

### Breakpoints

Tailwind defaults: `sm 640` · `md 768` · `lg 1024`.

### Stacking rules

| Pattern | Desktop | Steps down to |
|---|---|---|
| 4-up grid (capabilities) | 4 cols | 2 cols at `lg` (1024) → 1 col at `sm` (640) |
| 3-up grid (differentiators) | 3 cols | 1 col at `md` (768) |
| Hero stats | 2×2 | stays 2×2; 1 col below 640 |
| Project grid 704/464 | 2 cols | full-width stack at 900 |
| `/projects` listing | 2 cols (featured, pipeline, odd one out span both) | 1 col at 900 |
| About band 624/560 | 2 cols (pull-quote / bordered block) | full-width stack at 1120 |
| Footer | 4 cols | 2 cols at `md` → 1 col at `sm` |

The 900px project-grid step is not a Tailwind default — it is the width at which
a 704px column stops fitting. Use an arbitrary variant: `min-[900px]:grid-cols-…`.

The 1120px About step is not a default either. The band's right block is a fixed
560 (1px border + 40px padding + 519 of text) and the container keeps 48px
gutters, so below 1120 the pull-quote column is under 464 and a 48px quote has
nowhere left to go: `min-[1120px]:flex-row`. `OPEN-QUESTIONS.md` #8 has the
band's arithmetic.

### Type steps

- Hero H1: `text-d1` → **48px** below 1024 → **36px** below 640.
  Those two sizes are `d3` and `d4`, which already exist. **Do not invent a
  size** — step down through the existing scale.
- Closing CTA headline: `d2` → `d3` below 1024 → `d4` below 640.
- Everything else holds its size. The body scale is already small.

### Container

Gutters step `px-48` → `px-24` at 640. The 1280px cap is unchanged.

### Nav

Collapses to a drawer **below 900**. The logo stays; the links and the
`Get in Touch` button move into the drawer.

### ⚠️ The divider trap

**Card borders that read as dividers between columns must become bottom borders
when the cards stack.** A capability card's 1px *right* border is a column
divider at 4-up; at 1-up it is a stray vertical line down the right of the page.
The same applies to the differentiator card's 1px *left* border.

When stacking:

- drop the side border,
- put a 1px bottom border of the same colour on every card except the last,
- keep the top border (2px ink / 3px mint) — that one is part of the card, not a
  divider between cards.

---

## 11. Things the design does not have

Named so that nobody adds them back:

- No rounded corners.
- No drop shadows, no elevation, no glassmorphism.
- No hover animation, no scroll reveal, no parallax, no counters that count up.
- No gradient text, no gradient borders. The only three gradients are the hero
  overlay and the two image scrims.
- No icon set. The only vector in the design is the arrow on a button.
- No second accent colour. Teal is for badges and nothing else.
- No tints or shades of the eight colours. If you need a lighter ink, you need
  one of the alpha tokens that already exists, or you need to ask.
