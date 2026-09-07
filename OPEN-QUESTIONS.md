# Open questions

Everything the homepage build could not resolve on its own. Nothing here was
decided unilaterally: where the design is silent or self-contradictory, the page
is built to the letter of the spec and the question is written down instead.

Ordered roughly by how much is blocked on the answer.

---

## 1. Mint on the light bands is invisible — needs a designer ruling

`--kd-mint` `#D7F8DD` against white and against `--kd-mist` `#DBE5E7` is roughly
**1.2 : 1**. WCAG asks 4.5:1 for body text, 3:1 for large text and for graphics
that carry meaning. At 1.2:1 these elements are not "low contrast" — on most
screens they are simply not there. Confirmed in the rendered screenshots: the
section eyebrows on the About, Capabilities and Differentiators bands read as
blank space, and the mint rules read as nothing at all.

**Built to spec, as instructed.** Every occurrence, with file and line:

| # | File | Line | What it is |
|---|---|---|---|
| 1 | `src/components/Kicker.astro` | 35 | 32×1px mint rule beside every section eyebrow |
| 2 | `src/components/Kicker.astro` | 36 | the eyebrow label itself, 11px mint |
| 3 | `src/components/Kicker.astro` | 39 | the second rule, centred variant (closing CTA only) |
| 4 | `src/components/About.astro` | 41 | the 48×1px mint rule under the pull-quote |
| 5 | `src/components/About.astro` | 43 | 1px mint left border on the body block |
| 6 | `src/components/Capabilities.astro` | 47 | the `01`–`04` numerals |
| 7 | `src/components/Capabilities.astro` | 71 | the 32×1px mint rule at the foot of each card |
| 8 | `src/components/Differentiators.astro` | 48 | the 3px mint top border on card 1 |

Occurrences 1–3 are in a shared component, so they land on **five** bands. On the
ink bands (hero, projects, closing CTA) mint is fine — around 12:1 — so the
problem is specifically mint on white and mint on mist.

**Not blocked on the answer**: whatever is decided changes token values or a
handful of class names, not structure.

---

## 2. Footer copyright year

The design shows **2025**, which was already a year stale when it was approved.
Rendered dynamically from `new Date().getFullYear()`.

The year sits in its own `data-no-edit` span, so editing that line through the
in-page editor cannot freeze a year back into the copy — see
`src/components/SiteFooter.astro`. Flagging only so nobody "corrects" the live
site back to the Figma.

---

## 3. Mobile is inferred, not designed

No mobile frame exists. Every breakpoint rule in `DESIGN-SYSTEM.md` §10 is my
inference and is marked as such in that document. It needs sign-off **before**
`/about` and `/projects` are built, because those pages will be built on it.

The parts most worth a designer's eye:

- the hero H1 stepping 72 → 48 → 36 by reusing existing scale steps (`d1` → `d3`
  → `d4`) rather than introducing new sizes;
- the 704/464 project grid collapsing at **900px** — not a Tailwind default, but
  the width at which a 704px column stops fitting;
- the nav collapsing to a drawer below 900, which is a component that does not
  exist in the design at all;
- **the divider trap**: the capability card's 1px *right* border and the
  differentiator card's 1px *left* border are column dividers. Stacked, they
  become stray vertical lines down one edge of the page and have to move to the
  bottom edge. This is written up in §10 because it is the rule most likely to be
  missed.

---

## 4. `Get in Touch` has nothing behind it

It is the primary nav CTA, and the design contains **no contact page, no enquiry
form, and no phone number or email address anywhere** — the only contact
information in the entire frame is "Vashi, Navi Mumbai / Maharashtra, India" in
the footer.

**Holding position:** the CTA points at `#contact`, and the footer's Headquarters
column carries that id, so the button is live rather than a 404. No contact page
and no form was invented.

Needs a decision on what it should actually do. If the answer is a contact page,
that is a fourth route and a new design.

---

## 5. `/about` and `/projects` have no design

Both are in the IA, both are linked from the nav and the footer, **and neither is
built** — this task was the homepage. Those four links currently 404. They are in
`KNOWN_PATHS` already so the editor will work on them the day they exist.

While the homepage is fresh, the patterns I expect to carry them:

**`/about`** — it is the About band, expanded.
- Hero: there is no second hero design. Most likely an ink band with the kicker +
  `d1`, no image, no stat tiles, and hero padding reduced to `pt-144 pb-96`.
- The pull-quote block (`d3` capped at 560, mint rule, mint-left-bordered body at
  519) is the page's spine and can repeat two or three times down it.
- Company figures use the **about stat** pattern — `d6` numeral over `label-sm`
  caption with a divider top border — not the hero's translucent tiles. The tiles
  only work on ink.
- A timeline (1973 → 2004 → today) has no pattern. The closest existing thing is
  the capability card row with its numerals replaced by years, which would need a
  ruling before it is used.

**`/projects`** — it is the Projects band, repeated.
- The 704/464 grid is the unit. A page of it alternates: one featured left, then
  one featured right, so the eye does not track down a single column.
- Every card already has badge / title / meta. A filter or a category header has
  no pattern, and the kicker is the obvious candidate — one kicker per discipline
  group, which keeps the band rhythm intact.
- Band alternation still applies: ink for the project grids, mist between groups.
  Never two ink bands in a row.

---

## 6. There is no photograph of the Matunga Z-Bridge

Searched `src/assets`, both archived prototypes, and every raw photo folder in
`dev/kd-construction` (including the 97 images in `Matunga Images/`). There is no
image of that structure. The nearest by subject are the Harbour Line FOB shots,
which the prototype's own `src/data/content.ts` attributes to
**"Harbour Line FOBs & Trespass Control — MRVC / Central Railway"**, a different
project at a different location.

**What is on the page now:** `src/assets/project-fob-truss-span.jpg`, from
`kd-construction/public/img/harbour-fob-span-1600.jpg`. It is a K.D.-built steel
truss foot overbridge over electrified track — the right *kind* of structure,
photographed at the wrong *place*, presented under the caption
"Matunga Z-Bridge · Central Railway · ₹21 Cr".

**That is a misattribution and it should not go live.** Either supply a
photograph of the Matunga Z-Bridge, or change the featured project. Flagged
rather than quietly shipped.

### The other five images, for the record

| Slot | File in `src/assets/` | Source |
|---|---|---|
| Hero backdrop | `hero-nhava-sheva-station.jpg` | `kd-construction/public/img/nhava-sheva-landscape-2400.jpg` |
| Featured project | `project-matunga-workshop.jpg` | `…/matunga-entrance-dusk-1600.jpg` |
| Project card 1 | `project-sanpada-carshed.jpg` | `…/sanpada-carshed-aerial-1600.jpg` |
| Project card 2 | `project-fob-truss-span.jpg` | `…/harbour-fob-span-1600.jpg` — **see above** |
| Nav + footer logo | `kd-logo-white.png` | `kd-construction/public/logo/kd-logo-white.png` |

The hero backdrop was chosen for its **right half**: the 90° ink gradient is
opaque across the left 45%, and the Nhava Sheva station building runs from the
centre to the right edge with empty scrub on the left. Two other candidates
(`matunga-workshop-dusk`, `sanpada-carshed-lines`) put their subject centre-left
and would have been swallowed.

The featured project image is a genuine dusk photograph of the Matunga carriage
workshop entrance, with the project's own name carved into it. It is also **very
dark**, and the `--kd-scrim-lg` overlay darkens it further — the lettering is only
just legible. A brighter Matunga shot would sit better under that scrim.

---

## 7. Nothing in the design specifies a page title, meta description or favicon

The frame is the page body. There is no `<title>`, no meta description, no
share-card image and no favicon anywhere in it.

- **Title** — assembled from approved fragments:
  `K.D. Constructions — EPC Infrastructure · Vashi, Navi Mumbai`
- **Meta description** — the hero sub-paragraph, verbatim, because it is approved
  copy that describes the company in one sentence. It is named once in
  `src/data/home.ts` and referenced twice, so the two cannot drift.
- **Favicon** — still Astro's default `favicon.svg`. The supplied logo is a
  739×473 landscape lockup with a wordmark; squaring it into a 32px icon is a
  design decision, not a crop, so it was not attempted.
- **`og:image`** — none. There is no 1200×630 share card in the assets. Links
  shared to WhatsApp or LinkedIn will show no preview image.

---

## 8. The About band leaves its right half empty

The spec reads: *"pull-quote capped at 560px; **below it** a block with a 1px mint
left border and 40px left padding, text capped at 519px; the two stats stacked."*

Built literally — a single measured column down the left of a 1184px band, with
roughly 620px of empty space to its right.

That may well be the intent for an editorial band. It is flagged because a
**two-column** reading also fits the numbers almost exactly:

```
560 (quote)  +  56 (gap)  +  40 (padding)  +  519 (body)  =  1175
                                    container inner width =  1184
```

which is the kind of coincidence that usually means the columns were side by
side in the frame. One sentence from the designer settles it; changing it later
is a ten-line edit to `src/components/About.astro`.

---

## 9. The projects grid does not reconcile — the two columns differ by 46px

From the spec: the featured card is **704×500**, and the right-hand column is two
**464×265** cards with a **16px** gap.

```
right column:  265 + 16 + 265 = 546
left column:                    500
                     difference   46px
```

Both numbers are stated, and they cannot both be right. Built to the stated
numbers, which leaves 46px of ink below the featured card — visible in the
screenshot as the left card stopping short of the right column.

Three ways out, for the designer to pick:

1. featured image box becomes **704×546** (keeps the small cards, fills the row);
2. small cards become **464×242** each (keeps the featured card at 500);
3. let the featured card stretch to the row height and keep 500 as the image's
   intrinsic size — one word in `src/components/Projects.astro`.

Option 3 is the smallest change and the likeliest intent, but it is a design
decision and was not taken here.

---

## 10. Two colours on the page are not in the token table

Both are real, both are on screen, and neither has a token because neither is in
the approved colour list.

- **White.** The Capabilities band is specified as a white surface in the band
  rhythm, but white is not one of the eight colours in the palette table. It is
  currently the Tailwind `bg-white` utility. If it is meant to be a token it
  needs a name and a value; if it is meant to be `#FFFFFF` exactly, that is worth
  writing down.
- **The logo's gold.** `kd-logo-white.png` has an amber/gold rule and a gold
  detail inside the "D". It is legible and correct on ink, but it introduces a
  ninth colour that appears nowhere else in the design. Fine if intended;
  jarring if the palette is meant to be closed.

---

## 11. The badge text colour is not specified

`--kd-teal` is documented as "project badge chips **only**", and the chip's fill
and border are given as teal at 22% and 40%. The colour of the **text inside the
chip** is not stated.

Currently `--kd-mist`, following the rule for text on a dark surface — the chips
sit on the dark end of an image scrim. Teal-on-teal would have been close to
unreadable. Worth confirming.

---

## 12. Residual layout shift from the fonts: 0.0110

Measured on the production build under simulated Slow 3G with an empty cache
(`npm run check:cls`). Google's "good" threshold is 0.1, so this is roughly nine
times inside budget and Lighthouse scores it green — but it is not zero, and the
brief asked for zero.

Proven to be the font swap and nothing else: with both woff2 families blocked
outright so no swap can happen, CLS is exactly **0.0000**
(`npm run check:shift-cause`).

What is already done: all four woff2 subsets are preloaded, and both families
have metric-matched fallback faces (`size-adjust`, `ascent-override`,
`descent-override`) measured from the real fonts by
`npm run fonts:measure`. The hero H1 no longer changes height at all. What
remains is a run of body copy taking a different number of lines under
Arial-scaled-to-Inter than under Inter itself; one global `size-adjust` per
family cannot be exact for every string.

Driving it to a true zero means `font-display: optional`, which never swaps — but
which also means a visitor on a slow first load sees **Georgia and Arial instead
of Fraunces and Inter for that entire pageview**. On a design-locked project that
is a worse defect than 0.011 of shift, so the trade was not taken unilaterally.
Say the word and it is a one-line change.

---

## 13. Deployment, and the canonical origin

Deployment was explicitly out of scope and nothing was written for it — no nginx
config, no systemd unit, no CI, no deploy script.

One loose end it leaves: `astro.config.mjs` needs a `site` for canonical URLs and
for the sitemap. It reads `PUBLIC_SITE_URL` from the environment and falls back
to `http://localhost:4322`. **The sitemap currently contains localhost URLs.**
Set `PUBLIC_SITE_URL` before anything is published.

---

## 14. Whitespace between tags is load-bearing, and the compressor is off

Not a question — a decision that should not be quietly reverted.

`compressHTML: false` in `astro.config.mjs`. Astro's HTML compressor strips
whitespace between tags, and two places on this page need that whitespace as a
**word gap**: the hero H1, which is one sentence split across two spans so the
second half can be mint, and the footer copyright, where a generated year sits
beside an editable legal name. With the compressor on they render
`Infrastructure,Brick by Brick.` and `© 2026Kailashchandra…`.

Both were caught in the screenshot review, not by any test. The workarounds are
worse: a literal space inside the accent span does not survive the in-page
editor, which trims every value it reads off the page, and `&nbsp;` survives but
stops the H1 wrapping where the design wraps it.

If anyone turns the compressor back on for performance, these two headings break
silently.
