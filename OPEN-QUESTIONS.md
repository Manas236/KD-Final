 k

# Open questions

Everything the homepage and `/about` builds could not resolve on their own.
Nothing here was decided unilaterally: where the design is silent or
self-contradictory, the page is built to the letter of the spec and the question
is written down instead.

Ordered roughly by how much is blocked on the answer. #1-#14 came out of the
homepage; #15-#17 are new with `/about`; #18 is new with `/projects`; #19 is
new with the `K.D.Website_Details.md` reconciliation pass on the homepage;
#19b extends that reconciliation to `about.ts` and `projects.ts`, using
`PHOTOS.md` to fix the misattributions #6 and #18d flagged and to add the
projects the doc named that neither page had; #20 adds the Vision, Mission
and Philosophy content the doc has and `/about` didn't; #21 gives each
project its own page under `/projects/[slug]`; #22 records swapping the
Matunga Workshop photo for a supplied rendering; #23 adds project photo
galleries.

---

## 1. Mint on the light bands is invisible — RESOLVED

**Resolved by the user directly.** `src/styles/tokens.css` now defines
`--kd-mint-2: #2E6B39` — same hue as `--kd-mint`, darkened for legibility:
~6.4:1 against white, ~5.0:1 against `--kd-mist`, both clearing WCAG AA's
4.5:1 for text. `Kicker.astro` takes a `tone="dark" | "light"` prop that
switches its rule and label between the two; every occurrence in the table
below now passes `tone="light"` or uses `--kd-mint-2` directly. `--kd-mint`
itself is untouched and stays exactly as approved on the ink bands.

The original question is kept below for the record.

`--kd-mint` `#D7F8DD` against white and against `--kd-mist` `#DBE5E7` is roughly
**1.2 : 1**. WCAG asks 4.5:1 for body text, 3:1 for large text and for graphics
that carry meaning. At 1.2:1 these elements are not "low contrast" — on most
screens they are simply not there. Confirmed in the rendered screenshots: the
section eyebrows on the About, Capabilities and Differentiators bands read as
blank space, and the mint rules read as nothing at all.

**Built to spec, as instructed.** Every occurrence, with file and line:

| #  | File                                     | Line | What it is                                                    |
| -- | ---------------------------------------- | ---- | ------------------------------------------------------------- |
| 1  | `src/components/Kicker.astro`          | 35   | 32×1px mint rule beside every section eyebrow                |
| 2  | `src/components/Kicker.astro`          | 36   | the eyebrow label itself, 11px mint                           |
| 3  | `src/components/Kicker.astro`          | 39   | the second rule, centred variant (closing CTA only)           |
| 4  | `src/components/About.astro`           | 65   | the 48×1px mint rule under the pull-quote                    |
| 5  | `src/components/About.astro`           | 68   | 1px mint left border on the right-hand block                  |
| 6  | `src/components/Capabilities.astro`    | 47   | the`01`–`04` numerals                                    |
| 7  | `src/components/Capabilities.astro`    | 71   | the 32×1px mint rule at the foot of each card                |
| 8  | `src/components/Differentiators.astro` | 48   | the 3px mint top border on card 1                             |
| 9  | `src/components/about/Journey.astro`   | 61   | the timeline markers, mint on mist — but see below           |
| 10 | `src/components/about/Journey.astro`   | 66   | `CHAPTER I · 1973` and its two siblings, 12px mint on mist |
| 11 | `src/components/about/Journey.astro`   | 90   | the 6×6 bullet marks beside every timeline point             |
| 12 | `src/components/about/Board.astro`     | 46   | the 32×1px mint rule at the head of each director card       |
| 13 | `src/components/about/Board.astro`     | 56   | the director role labels, 12px mint on white                  |

Occurrences 1–3 are in a shared component, so on the homepage they land on
**five** bands and on `/about` on **six** more. On the ink bands (both heroes,
projects, HSE, both closing CTAs) mint is fine — around 12:1 — so the problem is
specifically mint on white and mint on mist.

`/about` adds one twist worth a designer's eye. The timeline markers are the
only mint element in the whole design drawn with a **second colour behind
them** — a 2px teal ring — and that ring is the one reason they are visible on
the mist band at all. If that was a deliberate fix for this problem, the same
fix may be what the kickers want. See #16.

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
inference and is marked as such in that document.

**`/about` has since been built, and it ships with no responsive variants at
all** — exactly like the homepage, and for the same reason: writing them would
be building on an unsigned inference. Both pages are fixed-width desktop
layouts today. Nothing has to be undone when the answer arrives; the stacking
rules just have to be written once, into both pages, and the divider trap below
now applies to three more grids (`about/Board.astro`'s 2×2, `about/Hse.astro`'s
4-up row, and `about/Journey.astro`'s three timeline columns, whose horizontal
rail has no stacked equivalent at all).

**`/projects` has since been built on the same fixed-desktop basis as `/about`**,
not the homepage's mobile pass — its hero, filter tabs, and stacked listing cards
have no responsive variants either. One more grid joins the divider-trap list
when the answer arrives: the listing has no side-by-side columns today, so there
is nothing to collapse there, but the filter tab row (`projects/Filters.astro`)
will need to wrap or scroll below whatever width three tab labels stop fitting
the container at.

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

## 5. `/projects` has no design — `/about` and `/projects` now do

`/about` **has been designed and built**, from an export supplied after the
homepage shipped. What that build could not resolve on its own is #15–#17 below.
Two of the guesses recorded here before it existed turned out right and are worth
keeping, because they are the reason the page reuses patterns rather than
inventing them: company figures use the **about stat** pattern (`d6` numeral over
a `label-sm` caption with a divider top border) and not the hero's translucent
tiles, and the hero clears the fixed nav with `pt-144`. The third guess — that a
timeline "has no pattern" — was right, and the export answered it with one; see
#16 for what that answer costs.

`/projects` **has since been designed and built too**, from its own export. What
that build could not resolve on its own is #18. The three guesses recorded below,
made before that export existed, were all wrong on the specifics and are kept
for the record rather than deleted:

- ~~The 704/464 grid is the unit, alternating one featured left then one featured
  right.~~ The export draws one column of full-width cards, tallest first, not a
  two-up grid at all. See #18.
- ~~A filter or category header has no pattern; use one kicker per discipline
  group.~~ The export specifies an actual filter — three tabs, one visibly active
  — so it is built as a working filter rather than replaced with a pattern that
  fits the design system better. See #18.
- ~~Band alternation: ink for the grids, mist between groups, never two ink bands
  in a row.~~ Partly right — the fix for the export's own darker filter-bar fill
  landing on `--kd-ink-deep` (reserved for the footer) *was* to make that band
  mist instead, which is exactly this guess. But the export still closes on two
  ink bands in a row (Listing → Closing CTA), the same shape `/about` has at
  HSE → Vision 2030, and it is built as drawn for the same reason. See #17 and
  #18.

---

## 6. There is no photograph of the Matunga Z-Bridge — RESOLVED, see #19b

**Resolved.** `project-fob-truss-span.jpg` is now captioned as what it actually
is — a Harbour Line FOB — on both pages it appears on, rather than as the
Matunga structure. See #19b for the full reassignment and what stands in for
Matunga Workshop FOB (renamed from "Matunga Z-Bridge") instead. The original
question is kept below for the record.

Searched `src/assets`, both archived prototypes, and every raw photo folder in
`dev/kd-construction` (including the 97 images in `Matunga Images/`). There is no
image of that structure. The nearest by subject are the Harbour Line FOB shots,
which the prototype's own `src/data/content.ts` attributes to
**"Harbour Line FOBs & Trespass Control — MRVC / Central Railway"**, a different
project at a different location.

**What was on the page:** `src/assets/project-fob-truss-span.jpg`, from
`kd-construction/public/img/harbour-fob-span-1600.jpg`. It is a K.D.-built steel
truss foot overbridge over electrified track — the right *kind* of structure,
photographed at the wrong *place*, presented under the caption
"Matunga Z-Bridge · Central Railway · ₹21 Cr".

**That was a misattribution and should not have gone live.** Either supply a
photograph of the Matunga Z-Bridge, or change the featured project. Flagged
rather than quietly shipped — and now fixed by doing the latter.

### The other five images, for the record

| Slot              | File in`src/assets/`           | Source                                                        |
| ----------------- | -------------------------------- | ------------------------------------------------------------- |
| Hero backdrop     | `hero-nhava-sheva-station.jpg` | `kd-construction/public/img/nhava-sheva-landscape-2400.jpg` |
| Featured project  | `project-matunga-workshop.jpg` | `…/matunga-entrance-dusk-1600.jpg`                         |
| Project card 1    | `project-sanpada-carshed.jpg`  | `…/sanpada-carshed-aerial-1600.jpg`                        |
| Project card 2    | `project-fob-truss-span.jpg`   | `…/harbour-fob-span-1600.jpg` — **see above**       |
| Nav + footer logo | `kd-logo-white.png`            | `kd-construction/public/logo/kd-logo-white.png`             |

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
- **Favicon** — ~~still Astro's default `favicon.svg`. The supplied logo is a
  739×473 landscape lockup with a wordmark; squaring it into a 32px icon is a
  design decision, not a crop, so it was not attempted.~~ **Resolved
  2026-09-18 (#35):** the KD monogram cut from `kd_logo.jpg`, on the logo's
  own mint, squared — `public/favicon.ico` (16/32/48) and
  `public/apple-touch-icon.png` (180), written by
  `scripts/build-favicon.mjs`. Astro's `favicon.svg` is deleted.
- **`og:image`** — none. There is no 1200×630 share card in the assets. Links
  shared to WhatsApp or LinkedIn will show no preview image.

`/projects` repeats the first two rows exactly the same way: title and meta
description assembled from the page's own approved copy (the hero sub-paragraph,
same trick as the other two pages), no favicon and no `og:image` decision made.

---

## 8. The About band leaves its right half empty — RESOLVED, it is two columns

**Resolved by the user directly, 2026-09-23**, with the design export's own
render of the band set beside the built one. The band is **two columns**:

```
left    the pull-quote, capped at 560, with the 48×1px mint rule 32px
        below it. The shorter column, centred against the right one.
right   a 560px block — 1px mint left border + 40px left padding + 519
        of text — holding the kicker, both paragraphs and the stats.

624 (left column)  +  560 (right block)  =  1184
```

which is the container's inner width at 1280 exactly, and there is no grid gap
to find: the quote's own 560 cap is what leaves the 64px of air before the mint
border. That is why the arithmetic closes.

Three things the export settles that the spec text never said:

- the **kicker belongs at the top of the right block**, not above the quote.
- **body2 is `text-body-sm`** (14/22.75), not `text-body`. The export sets the
  two paragraphs at different sizes — the same lead/secondary step `/about`'s
  Our Story band already uses — and every spacing below body2 only lands where
  the export puts it if the paragraph is 22.75 per line.
- the columns are **centre-aligned**. The right block is always the taller and
  sets the height of the band.

Rebuilt in `src/components/About.astro` and measured against the export at
1280: the mint border lands 624 from the container's left edge (export: 623.5),
the text measures 519 (518), the stats divider sits 413.5 below the top of the
band (413.3) and the rule under the quote 388.8 (387.6). Every element is
within a pixel, and both paragraphs break onto the same lines as the export's.

Two differences remain, both deliberate and both one line to undo:

- **the stats gap stays at 24.** The export measures 16-19 — one step on the
  scale — and 24 is the figure `/about`'s Our Story stats were aligned to
  in #15. Moving both bands to 16 is the alternative; they should not differ.
- **the pull-quote breaks one word earlier than the export's.** Fraunces sets
  `"Fifty-three years is not` at 564.3px against the spec's 560 cap, so `not`
  drops to line two; the export's render of that line is ~542px, so the same
  string fits. The cap is a stated number and is kept at 560. Raising it to
  576 reproduces the export's line breaks exactly.

**Still open: the same shape on `/about`.** #8 used to say that one answer
settles both bands. It does not, quite. `/about`'s Our Story band is a 560px
story column with a 560px ink figure block **under** it, and unlike the
homepage the export is explicit about that — it renders the two as `flex-col`
siblings, which is how `src/components/about/Story.astro` is built. The
homepage's answer makes a two-column reading of that band far more likely
(560 + 64 + 560 = 1184, the same coincidence), but it is a different page with
its own export and it is not being changed on inference. One sentence settles
it, and the change is the same shape as this one.

**The two stats were resolved earlier, and still are**: side by side
(`grid grid-cols-2`) at every viewport width, not stacked — a phone screenshot
of the stacked version was the complaint that reopened that part.

The original question is kept below for the record.

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

**The same shape recurs on `/about`, and this time the export is explicit about
it.** The Our Story band is a 560px story column with a 560px figure block under
it — not beside it — and the export renders them as two `flex-col` siblings, so
that band also leaves its right half empty. 560 + 64 + 560 = 1184 exactly, which
is the coincidence again, only tighter. Built literally in
`src/components/about/Story.astro`, on the same reasoning as here: one answer
settles both bands.

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

---

## 15. The `/about` export disagrees with the design system on eleven numbers

The `/about` export arrived as generated Tailwind, and it is a **lossy
translation**: every value in it was snapped to the nearest class in Tailwind's
*default* scale, not this project's `--spacing: 1px` scale. That is provable from
values the design system already fixes — the nav came through as `h-20` (80px)
when it is 88, the nav logo as `w-24 h-16` (96×64) when it is 102×68, the footer
logo as `w-28 h-20` (112×80) when it is 120×80. None of those three is a redesign
of the chrome; they are 88, 102, 68 and 120 rounded to the nearest class that
exists in a scale this project does not use.

So where the export and `DESIGN-SYSTEM.md` disagree on a number, **the design
system was followed and the export's value is recorded here**. Every one of them
is a one-line change if the designer says otherwise.

| #  | Where                       | Export says                                         | Built as                                                     | Why                                                                                                            |
| -- | --------------------------- | --------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 1  | hero top padding            | 160px                                               | `pt-144`                                                   | §7: a hero clears the 88px fixed nav with`pt-144`. The export agrees on `pb-80`.                          |
| 2  | hero image opacity          | 25%                                                 | `--kd-hero-image-opacity` (20%)                            | §11 forbids adding a token.                                                                                   |
| 3  | hero overlay                | `linear-gradient(270deg, …)`                     | `--kd-hero-overlay` (90°)                                 | §11 allows exactly three gradients. A right-lit overlay would also put the text on the transparent half.      |
| 4  | Our Story H2                | 30/36 (`d5`)                                      | `text-d4`                                                  | §8 gives the section-H2 role to`d4`, and the export's own other two H2s *are* `d4`.                     |
| 5  | Our Story stat numerals     | 20/28 (`d7`)                                      | `text-d6`                                                  | The about-stat pattern is`d6` over `label-sm`. #5 named it for this band.                                  |
| 6  | Our Story stat list spacing | flush (0)                                           | `gap-24`                                                   | Matches the same pattern on the homepage's About band.                                                         |
| 7  | director-card mint rule     | 40px                                                | `w-32` (`--kd-rule`)                                     | The mint accent rule has two lengths, 32 and 48. A third is a new token.                                       |
| 8  | hero vertical rule          | slate at 40%                                        | `--kd-ghost-outline` (mist 35%)                            | Nearest alpha the palette contains; see the note below.                                                        |
| 9  | ₹220 Cr block rule         | slate at 40%                                        | `--kd-ghost-outline`                                       | Same.                                                                                                          |
| 10 | HSE card borders            | slate at 20%                                        | `--kd-nav-border` (slate 18%)                              | Same.                                                                                                          |
| 11 | timeline rail               | slate/ink at 20%, sitting 12px*below* the markers | `--kd-divider-light` (ink 18%), through the marker centres | A rail that misses its markers reads as a stray line; the markers' 3px mist border punches through it cleanly. |

### The one thing this exposes about the palette

Rows 8–10 are all the same problem: **the ink bands have no generic hairline
token.** Three exist — `--kd-stat-border` (mist 10%), `--kd-nav-border` (slate
18%) and `--kd-footer-divider` (slate 15%) — and every one of them is named for
the single place it was first used, so a divider anywhere else has to borrow a
name that lies about it. The export reached for slate at 40%, which is roughly
double any of them, so the rules on `/about` are lighter than drawn.

Either a generic `--kd-divider-dark` gets added at the weight the designer
actually wants, or one of the three gets renamed. This is the only place in the
build where the palette ran out.

---

## 16. `/about` introduces two things the design system says do not exist

Both are in the export, both are real design decisions, and both contradict a
rule that is written down and enforced. Neither was resolved unilaterally.

### 16a. The timeline markers are drawn as circles with a teal ring

`DESIGN-SYSTEM.md` §0 rule 2 is *"no rounded corners, anywhere"*, and it is
enforced by a grep over `src/` that must return nothing. §11 reserves
`--kd-teal` for project badge chips and nothing else. The export's markers break
both: they are 16px circles with a 2px teal ring and a 3px mist border.

**Built as squares, ring kept.** The corner rule is the one with a build gate
behind it, and it would have failed twice over — the property, and the class
name written into a source comment, which Tailwind scans and would have compiled
into the shipped stylesheet. (That is not hypothetical. It happened once during
this build and is the trap the note at the top of `tokens.css` describes.)

The teal ring was kept because it is the only thing that makes the marker
visible: mint on mist is the 1.2:1 of #1. A designer reaching for a second
colour at exactly the point where mint stops working looks like a fix, not a
flourish. Worth confirming — and if it is confirmed, #1 may have the same answer.

### 16b. The HSE row is a fourth card type

§4 says *"three card types exist; they are not interchangeable"*. The HSE band's
four cards use the **differentiator grammar** — a claim and its argument, no
numeral, first card mint-topped, dividers drawn as the cards' own left borders —
at the **capability card's measure**: `p-32` not `p-40`, a `d9` title not `d7`,
and a 2px top border not 3px.

That reads as "the differentiator card, at four across instead of three", which
is a sensible thing for a designer to want and is exactly how it is built. But it
is a fourth entry in a table that says there are three, and §4 is the section
most likely to be read as law by whoever builds `/projects`. It needs either a
name and a row in §4, or a ruling that the three existing cards flex by column
count.

---

## 17. The `/about` band rhythm breaks two of §2's rules

§2: *"never two adjacent bands of the same surface"*, and *"the alternation is
dark → light → dark, not a random shuffle."* The export's band order is:

| # | Band                         | Surface     |
| - | ---------------------------- | ----------- |
| 1 | Nav                          | ink         |
| 2 | Hero                         | ink + image |
| 3 | Our Story                    | white       |
| 4 | Our Journey                  | mist        |
| 5 | Board of Directors           | white       |
| 6 | Health, Safety & Environment | ink         |
| 7 | Vision 2030                  | ink         |
| 8 | Footer                       | ink-deep    |

Two boundaries do not follow the rule:

- **4 → 5, mist then white.** Two light bands in a row. Not the *same* surface,
  so the letter of the rule survives, but it is not dark → light → dark either,
  and 192px of near-identical light separates the timeline from the board.
- **6 → 7, ink then ink.** This one is the actual violation. The HSE cards and
  the Vision 2030 kicker are separated by 192px of unbroken ink, which is
  precisely the "one very long band with a stray gap in it" that §2 warns about.

**Built as drawn.** §2's rhythm rules were written to *derive* pages that had no
design; `/about` has one, and fidelity to an approved frame outranks a rule
written for its absence. It may also be deliberate — a dark closing sequence
that carries the eye from the safety pledge into the 2030 statement.

The fix, if it is not deliberate, is one word per band: `bg-kd-ink` →
`bg-kd-mist` on `src/components/about/Hse.astro`, or `bg-white` → `bg-kd-mist`
on `src/components/about/Board.astro`. Nothing structural depends on either.

---

## 18. `/projects` arrived, and disagreed with every guess `#5` made about it

The export is a generated Tailwind dump in the same style as `/about`'s —
default-scale classes (`zinc-700`, `slate-400`, `gray-400`, `gray-800`,
arbitrary `left`/`top` pixel offsets), not this project's tokens. Same
treatment as `/about`: the wording is transcribed into `src/data/projects.ts`,
the layout is rebuilt against `DESIGN-SYSTEM.md`, and every place the two
disagree is recorded here rather than silently picked one way.

### 18a. It is one column of full-width cards, not the 704/464 grid

`#5` guessed the homepage's featured-left/two-stacked-right grid would repeat,
alternating sides. The export instead stacks every card at the container's full
1184px width, tallest first: the featured card at `560px`, two "medium" cards at
`400px`, two "small" cards at `265px` — the same height the homepage's own small
project cards already use. Built to that shape in
`src/components/projects/Listing.astro`. The `400px` medium tier is a size this
codebase has not used before; it is what the export's own two medium cards agree
on, not a rounding of anything.

**Update from #26:** from 900px up the tiers now sit two-up as blocks, at the
user's direction. Heights are unchanged; the single column survives below 900px.

### 18b. The status filter is a real, working control — a new interaction, not a new kicker

`#5` guessed a filter would have no design and reached for one kicker per
discipline group. The export specifies something more specific: three tabs —
All Projects / Live / Completed — with "All Projects" drawn visibly filled and
the other two outlined, i.e. a real active/inactive state. `DESIGN-SYSTEM.md`
§11 lists "no hover animation, no scroll reveal" among things the design does
not have, but a click-to-filter control is neither of those, and building it as
a static row that looks interactive but does nothing would be the worse defect.
`src/components/projects/Filters.astro` ships it as a working filter: a
`<script>` toggles the `hidden` utility on every `[data-project-status]` card in
Listing.astro, the same mechanism `Nav.astro`'s drawer already uses. This is a
control with no precedent anywhere else in the design and needs a designer's eye
if `/about` or a future page ever wants one too — right now there is exactly one,
and its visual language (filled pill vs. outlined pill) was invented for it.

### 18c. A "live" status badge is a fourth badge-like element the design system does not name

`DESIGN-SYSTEM.md` §7 documents exactly one badge: the teal discipline chip
("Civil", "Mechanical"). The export draws a second, different mark — a solid
pill reading "Live" or "Live — 85%+ Complete", top-left of the image, in the
accent colour rather than teal. Built as `bg-kd-mint` / `text-kd-ink-deep`
(the same fill/text pair as a primary button, since a solid accent fill has no
other precedent) so it cannot be confused with a discipline chip sharing the
same corner. Same shape as `#16b`'s fourth card type: a real thing in an
arrived export, not named in the section that lists what exists, flagged rather
than either invented freely or left out.

### 18d. Two projects have no photograph, and existing assets stand in — partially resolved, see #19b

**Update from #19b:** the Matunga Z-Bridge row below is now moot — that card
is renamed "Matunga Workshop FOB" and reassigned its own honest stand-in
(`project-matunga-workshop-fob.jpg`), freeing `project-fob-truss-span.jpg` to
caption the real Harbour Line FOBs project it was always a photo of. Panvel–
Karjat and the renamed Mumbai Harbour Line Station Redevelopment still have no
dedicated photography and still use stand-ins — see #19b for what changed and
what didn't. The original note is kept below for the record.

`#6` already flags that the Matunga Z-Bridge photo is a different structure at a
different location. `/projects` repeats that card, so it repeats that problem —
and adds two more projects with no photography at all: **Panvel–Karjat Railway
Line** (the featured card) and **Harbour Line Redevelopment**. Nothing in
`src/assets` depicts either.

| Slot                        | File in`src/assets/`           | What it actually shows                                                                      |
| --------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| Panvel–Karjat Railway Line | `about-mankhurd-workforce.jpg` | K.D. Constructions workforce on site at Mankhurd — not this project                        |
| Harbour Line Redevelopment  | `hero-nhava-sheva-station.jpg` | The Nhava Sheva station backdrop, reused a third time on this page (also the hero backdrop) |
| Matunga Z-Bridge            | `project-fob-truss-span.jpg`   | See`#6` — a real K.D. bridge, wrong location                                             |

Both stand-ins are captioned with the real project's name and value, same as the
Z-Bridge card already is. Alt text on all three describes what the photograph
actually shows, not the project it is captioned under, so the mismatch is at
least not compounded by the accessibility tree. Real photography for these two
projects would resolve this without touching any other part of the page.

### 18e. Matunga Z-Bridge's badge disagrees with the homepage's — resolved, see #19b

**Update from #19b:** fully resolved now — the project is renamed "Matunga
Workshop FOB" on both pages and both now badge it "Civil · Structural Steel"
(`home.ts`) / `["Civil", "Structural Steel"]` (`projects.ts`), grounded in the
doc's own description. The partial-resolution note below is kept for the
record.

**Update from #19:** the homepage's "Gati Shakti" half of this badge has been
removed — it was never corroborated anywhere (not this export's own "Civil"
chip, not `K.D.Website_Details.md`) and read as invented. `home.ts`'s badge is
now "Civil · Structural Steel", grounded in the source doc's description of
this exact project (RCC construction, structural steel and girder fabrication,
piling, launched and erected over a live line). This export's own card still
shows a single "Civil" chip, so the two pages still disagree, just no longer
on a fabricated third term. One decision still settles both.

The original note is kept below for the record.

The homepage badges this project "Civil · Gati Shakti"
(`src/data/home.ts`, `projects.cards[1].badge`). This export's own card shows a
single "Civil" chip, nothing else. `src/data/projects.ts` transcribes this page's
export rather than reconciling it with the homepage's copy — the same policy
this file applies everywhere a page's own export is its own source — so the same
real project now carries two different badge sets depending which page it is
read from. Worth a single decision that updates both.

### 18f. Listing → Closing CTA is ink on ink

The same shape as `/about`'s HSE → Vision 2030 boundary (`#17`): the export
closes with two ink bands back to back, `192px`... no — here it is `py-96` on
each side, `192px` of unbroken ink between the pipeline panel and the "Next
Horizon" kicker. Built as drawn, for the reason `#17` gives: fidelity to an
arrived export outranks a rhythm rule written for a page that had none. The
one-word fix, if it is not deliberate, is `bg-kd-ink` → `bg-kd-mist` on
`src/components/projects/Cta.astro`.

### 18g. The filter bar's fill is not reproduced

The export fills the tab bar `bg-gray-800` — visibly darker than the
`bg-zinc-700` bands above and below it, the same fill it gives the footer. That
reads as reaching for `--kd-ink-deep`, which `DESIGN-SYSTEM.md` §7 states is
"reserved for the footer." Built as `bg-kd-mist` instead in
`src/components/projects/Filters.astro` — which also happens to be what keeps
Nav → Hero → Filters from being three ink bands in a row, one more than the
one documented exception in §2 allows. If ink-deep on a non-footer band turns
out to be wanted, that is a rule change to §7 as well as a token swap here.

---

## 19. `src/data/home.ts` was reconciled against `K.D.Website_Details.md` — `about.ts` and `projects.ts` were not

A hand-authored company reference document, `K.D.Website_Details.md` (a text
mirror of `K.D.Website_Details.docx`, converted for search — see `S72`),
became available after the homepage, `/about` and `/projects` all shipped from
generated deck exports. On request, `src/data/home.ts` alone was passed over
it and corrected where the two sources conflict or where the doc fills a real
gap. `about.ts` and `projects.ts` were left untouched — same policy this file
applies everywhere a page's own source is its own source — so the pages now
disagree on the specifics below until someone decides which source wins on
each.

**Changed in `home.ts`, grounded in the doc:**

- **Owned equipment fleet: 41+ → 50+.** The doc states "50+ heavy equipment
  units" three separate times (intro, at-a-glance, Heavy Equipment section) as
  a company-wide total, not a per-project figure. `hero.stats[3]` and
  `differentiators.cards[2].body` were updated; the same "41+" still stands,
  unreconciled, in `about.ts`'s `story.stats` and `projects.ts`'s comment
  block.
- **Capability list widened.** `HERO_SUB` and `about.body1` said "civil,
  mechanical, and electrical engineering." The doc's own Core Capabilities
  line adds signalling & telecommunication and track engineering; both were
  updated to the full list. `capabilities.cards[2]` ("Electrical
  Engineering") also stopped folding track engineering into its body copy —
  the doc treats them as separate verticals. `about.ts`'s own `story.body1`
  still reads "civil, mechanical, and electrical" only.
- **"Gati Shakti" removed.** See the update to #18e — it appeared nowhere in
  the doc, nowhere in `/projects`'s own export, and is gone from both
  `capabilities.cards[0].body` and `projects.cards[1].badge`.
- **Headquarters address completed.** The footer previously read "Vashi, Navi
  Mumbai" / "Maharashtra, India" — the only address anywhere in the design,
  and the landing target for the nav's "Get in Touch" CTA (#4). The doc gives
  a full registered address (Office No. 1313/1314, Real Tech Park, Sector
  30A, Vashi, Navi Mumbai – 400703, Maharashtra, India); `footer.columns
  .headquarters.lines` now carries all three lines. Purely additive — no
  other page specified an address to conflict with. #4's underlying question
  (no phone, no email, no contact page) is unchanged.
- **Footer disciplines list completed.** Went from three items (Civil,
  Mechanical, Electrical) to the doc's full five-discipline order (Civil,
  Track, Electrical, Mechanical, Signalling & Telecommunication). Additive —
  the list has no fixed length in `SiteFooter.astro`.
- **Capability card bodies (01–04) reworded** to match the doc's own
  descriptions of each discipline more closely — OEM sourcing and DLP support
  for Mechanical, "live, operational railway environments" for Electrical
  (the doc's own phrase), fabrication scope (bridges, FOBs, girders) for
  Steel Fabrication.

**Deliberately left alone, despite not being corroborated by the doc:**

- `about.body2` / `differentiators.cards[1].body`'s "reinvesting retained
  earnings... aligned with Railway Board standards" — identical wording
  appears independently in `about.ts`'s own `story.body2`, which is strong
  evidence it came from the original deck rather than being invented for the
  homepage alone. The new doc doesn't cover financial policy at all, so
  there's nothing here to reconcile against — only a claim the doc is silent
  on, which is not the same as a claim it contradicts.
- `about.stats` (2.85× growth, ₹362 Cr+ pipeline) and `cta.headline`
  (₹362.90 Cr) — unmentioned in the doc, but internally verified: `about.ts`
  independently states the FY2020 baseline as ₹77.14 Cr, and ₹220 Cr ÷
  ₹77.14 Cr ≈ 2.85×. That arithmetic only works if both figures came from a
  real source. Left untouched.
- `projects.cards[0].meta`'s "Sanpada Carshed · **Indian Railways** · ₹48 Cr."
  **Resolved in #19b**: changed to Central Railway on both `home.ts` and
  `projects.ts`, per the doc's own Signature Projects entry — see #19b for the
  reasoning. The original note is kept for the record: the doc's own
  Signature Projects list gives this project's client as **Central Railway**
  specifically — but `projects.ts`'s independent transcription of the same
  project also said "Indian Railways," so this read as a genuine granularity
  difference (railway zone vs. the parent organisation) baked into the
  original deck, not a homepage-only slip like Gati Shakti was.
- Project-level ₹ figures generally (₹165 Cr, ₹48 Cr, ₹21 Cr). **Resolved in
  #19b**: the doc gives no cost figure for any individual project — only
  company-wide revenue — so every per-project ₹ Cr figure across `home.ts`
  and `projects.ts` was replaced with the doc's own physical stats for that
  project (RCC volume, steel tonnage, span length) instead.

**Not blocked on an answer**: every change above is a `home.ts` string; none
of it touches structure, slot keys, or counts.

---

## 19b. `about.ts` and `projects.ts` reconciled against `K.D.Website_Details.md` and `PHOTOS.md`

Continuation of #19, which reconciled `home.ts` alone and left `about.ts` and
`projects.ts` untouched. This pass reconciles both, using `PHOTOS.md`'s
ranked shortlist to fix the photo misattributions #6 and #18d flagged and to
give the newly-added projects real photography instead of more stand-ins
where the library actually has it. **No layout, component structure, or
band/grid rhythm was changed anywhere in this pass** — every addition is a
new entry in an array a component already `.map()`s over (`listing.medium`,
`listing.small` in `projects.ts`), or a string edit inside an existing slot.

### Changed in `about.ts`, grounded in the doc

- **Capability list widened**, matching `home.ts`'s already-widened
  `HERO_SUB`: `story.body1` went from "civil, mechanical, and electrical
  engineering" to the doc's full five-discipline list.
- **Owned equipment fleet: 41+ → 50+.** `story.stats[1]` still said "41+"
  after #19 fixed the same figure on `home.ts`; now matches.
- **ISO certifications and Rail Chamber membership added** to `story.body2`
  — ISO 9001:2015, ISO 14001:2015, ISO 45001:2018, and membership of the
  Chamber of Railway Industries. This is real, doc-stated company
  information ("At a glance" and the ABOUT US section both give it) that
  was previously on neither page. The same sentence was added to
  `home.ts`'s `about.body2`, written independently rather than shared, per
  this codebase's standing policy for near-duplicate copy across pages.
- **Journey Chapter III wording corrected.** `journey.chapters[2].points`
  read "Extended reach from civil works into electrical and track
  engineering" — missing mechanical, which the doc's own History section
  names for this chapter ("expanding beyond core civil works into
  mechanical, electrical and track engineering"). Added.

**Deliberately left alone:**

- **Board of Directors.** The doc's own Leadership section is explicit that
  this data is unconfirmed — *"Please collect the leadership data... or ask
  Sir for the correct guidance/details before finalising"* — and gives only
  first names plus a surname spelled "Gindodi" (`about.ts` has "Gindodia").
  `about.ts`'s director names, roles and bios are transcribed from the
  client-approved `/about` design export, a different and more specific
  source than the doc's own unresolved note. A gap in the doc is not the
  same as a contradiction from it, so nothing here was changed — flagging a
  spelling discrepancy this small on a director's name is a phone call, not
  a guess.
- **CSR section.** The doc's own CSR section carries an explicit editorial
  note calling it *"a draft placeholder... please treat as a starting
  skeleton, not final copy"* and asks for CSR spend, committee, and local
  programme specifics that don't exist yet anywhere in this project's
  sources. Building a new page section from copy the source document itself
  says is not final would be inventing content, not fixing stock content —
  out of scope for this pass.

### Changed in `projects.ts`, grounded in the doc and `PHOTOS.md`

- **"Matunga Z-Bridge" renamed "Matunga Workshop FOB."** The doc names no
  project called "Z-Bridge"; its "Matunga Workshop FOB" — a 303m FOB
  fabricated, launched and erected over a live line at Matunga, Central
  Railway, with 704.88 MT of steel and 1,584 m³ of RCC — matches this
  card's existing description closely enough that they're treated as the
  same structure. `meta` changed from the unverifiable "₹21 Cr" to the
  doc's own "303m Span"; badges changed from `["Civil"]` to `["Civil",
  "Structural Steel"]`, matching `home.ts`'s already-corrected badge (#18e).
- **The Matunga Z-Bridge/Workshop FOB photo problem is actually solved, not
  relabelled.** `project-fob-truss-span.jpg` was never a photo of this
  structure (#6) — it's a genuine Harbour Line FOB shot (the file's own
  name and the archived prototype's caption both said so). Rather than
  keep it mis-captioned under a new name, it now captions the real project
  it depicts: **Harbour Line FOBs & Trespass-Control**, a new entry (below)
  on both `projects.ts` and `home.ts`. Matunga Workshop FOB gets its own,
  different stand-in instead — `project-matunga-workshop-fob.jpg`, a
  Bonkode FOB photograph (PHOTOS.md tier A7), honestly captioned as a
  generic "canopied steel foot overbridge walkway," not as Matunga.
- **Sanpada Carshed's client corrected** Indian Railways → Central Railway,
  resolving the #19 note above. `meta` also changed from "₹48 Cr" (not in
  the doc) to the doc's own "11,338 m³ RCC."
- **Matunga Workshop's `meta` changed** from "₹165 Cr" to "1,816 MT Steel"
  — the doc's own structural steel figure for the Matunga LHB Coach
  Maintenance Facilities work this card represents.
- **Panvel–Karjat's `meta` and hero stat changed** from "₹358 Cr+" (not in
  the doc) to "29.6 km Corridor" (the doc's own corridor length), and its
  `statusBadge` from "Live — 85%+ Complete" to "Live — 90%+ Complete",
  matching the doc's "over 90% complete."
- **Four projects added, named in the doc but present on neither page
  before this pass** — all as new array entries in `listing.medium` /
  `listing.small`, the existing tiers, not a new tier:
  - **Nhava Sheva & Uran Railway Stations** (medium) — Central Railway,
    "3,046 MT Steel" (doc: 29,421 m³ RCC and 3,046 MT steel across both
    stations). Photo: `project-nhava-sheva-uran.jpg`, PHOTOS.md tier A8,
    previously unused — the hero backdrops on `/` and `/projects` both use
    different Nhava Sheva frames (A9 and A13 respectively), so this is a
    fourth, distinct angle, not a repeat.
  - **Harbour Line FOBs & Trespass-Control** (medium) — MRVC, "4 Locations"
    (doc: Vashi–Sanpada, Nerul–Seawood, Seawood–Belapur,
    Khandeshwar–Panvel). Photo: the reassigned `project-fob-truss-span.jpg`
    — see above.
  - **Solapur Vande Bharat Maintenance Depot** (small) — Central Railways,
    Recently Awarded (doc: LoA received for the Solapur Coaching Depot
    upgrade). No photograph of Solapur exists anywhere in the library.
    Stand-in: `project-solapur-vande-bharat.jpg`, PHOTOS.md tier B1 — a
    Vande Bharat trainset inside the Matunga shed, honestly captioned as
    what it shows rather than claimed as Solapur. The one genuinely
    on-theme low-resolution frame PHOTOS.md's own "Recover" list flags as
    worth chasing full-size (#1 on that list).
  - **Lower Parel Railway Redevelopment** (small) — Western Railways,
    Recently Awarded. No photograph of Lower Parel exists either. Stand-in:
    `project-lower-parel.jpg`, PHOTOS.md tier A10 (a platform interior,
    previously unused).
  - The small tier's own card markup (`Listing.astro`) never renders a
    `statusBadge` — only `featured` and `medium` do. Rather than extend the
    template to add one, "Recently Awarded" is carried in these two cards'
    `meta` line instead of a pill.
- **"Harbour Line Redevelopment" renamed "Mumbai Harbour Line Station
  Redevelopment"**, the doc's exact name — now needed for clarity since the
  page also has a "Harbour Line FOBs & Trespass-Control" card and the two
  are easy to conflate. `statusBadge` changed from generic "Live" to "Live
  — 60%+ Complete" (doc: "over 60% complete"). Its stand-in photo changed
  from the homepage's hero backdrop, reused a third time on this page
  (#18d), to `project-harbour-redevelopment-progress.jpg` (PHOTOS.md tier
  B12) — the one genuinely under-construction aerial in the whole library,
  a better fit for an actively-redeveloping brownfield station than a
  finished building would be.
- **`/projects`'s own hero backdrop changed** from a reuse of the
  homepage's Nhava Sheva image to `hero-uran-station.jpg` (PHOTOS.md
  Uran Railway Station folder, previously unused), so the two pages no
  longer share a hero photograph.

### Changed in `home.ts`

- `about.body2` gets the same ISO/Rail Chamber sentence as `about.ts`'s
  `story.body2` — see above.
- `projects.cards[0]` (Sanpada): same client and `meta` correction as
  `projects.ts`.
- `projects.featured` (Matunga Workshop): same `meta` correction as
  `projects.ts`.
- `projects.cards[1]`: renamed from "Matunga Z-Bridge" to "Harbour Line
  FOBs & Trespass-Control" — same reasoning as `projects.ts` above, and the
  same image (`project-fob-truss-span.jpg`) now correctly captions what it
  actually shows on both pages instead of misattributing it on either.

### New image assets

Six new files in `src/assets/`, processed from the raw folders in
`PHOTOS.md` (resized to ≤2000px on the long edge, JPEG q85, EXIF-rotated,
no manual crop — `object-cover` handles framing at render time):
`project-nhava-sheva-uran.jpg`, `project-matunga-workshop-fob.jpg`,
`project-harbour-redevelopment-progress.jpg`,
`project-solapur-vande-bharat.jpg`, `project-lower-parel.jpg`,
`hero-uran-station.jpg`. None are upscaled beyond their source resolution.

**Not blocked on an answer**: every change in this section is a data string,
a new array entry following an existing tier's shape, or an image import —
`Listing.astro`'s markup, the band rhythm, and every grid/card layout are
untouched. The build and both pages' `check-edit-keys` gates pass clean.

---

## 20. `/about` had no Vision, Mission or Philosophy content at all

`K.D.Website_Details.md` has a full "MISSION, VISION & PHILOSOPHY" section —
a Vision statement, a Mission statement, and four named philosophy pillars
under the quote "It is better to be safe than sorry." None of it existed
anywhere on `/about` before this: the page's only "Vision" strings were the
unrelated "Vision 2030 Turnover Target" stat and the Board band's heading
"The Stewards of the Vision." This was a real content gap, not a mismatch —
caught by the user directly asking whether Vision/Mission was on the page.

**Built, not just flagged**, since unlike `/projects` this has no arrived
export to defer to — the doc is the only source, so there's no "which source
wins" question to hold on. Two new bands, added between Journey and Board:

- **`about/Vision.astro`** (white) — kicker "Our Vision & Mission", heading
  "Vision 2030" (the doc's own 2030 target figure, already used elsewhere on
  this page and the homepage's closing CTA, reused rather than inventing a
  new headline). Reuses Story.astro's text-block shape one band up (kicker,
  `d4` heading, max-w-560 column) and Board.astro's small-mint-label-over-a-
  paragraph treatment one band down for the two named statements — no new
  visual pattern, both already exist on this page.
- **`about/Philosophy.astro`** (ink) — kicker "Our Philosophy", heading set
  as the company's own quote (the same "quote as heading" move Hse.astro
  makes one band further down). Reuses Hse.astro's card grammar exactly:
  differentiator grammar at four across, card 1 mint-topped, `p-32` / `d9`
  title — the fourth-card-variant pattern OPEN-QUESTIONS.md #16b already
  names as this design's accepted departure, applied a second time rather
  than invented again.

Both statements and all four pillar bodies are trimmed from the doc's own
(longer) wording rather than transcribed in full — the doc's Vision and
Mission paragraphs run three sentences each and the four pillars each carry
two; every band elsewhere on this page runs shorter, so the third sentence
of each statement and the second sentence of each pillar were cut to match
the page's existing register rather than let this section read as denser
than its neighbours. Nothing was added that isn't in the doc; only length
was edited, and only against the doc's own text, not against
already-approved wording — see the file header's client-approved-copy
policy, which governs transcription of an arrived export and doesn't apply
to authoring fresh from the source document.

**A side effect worth noting**: #17 flagged Journey → Board as mist-then-
white, two light bands running together. Inserting Vision (white) then
Philosophy (ink) between them changes that boundary to
mist → white → ink → white, which is fully alternating — that half of #17
is resolved as a consequence of this addition, not a separate fix.

Board.astro's director names use the surname "Gindodia"; the doc's own
Leadership section (see the note in #19b) spells it "Gindodi" and marks the
whole section unconfirmed. Not touched here, same reasoning as #19b.

**Not blocked on an answer**: both bands reuse existing patterns exactly, no
new component grammar was introduced, and the build and `/about`'s
`check-edit-keys` gate (93 → 109 slots) pass clean.

---

## 21. Every project now has its own page — `/projects/[slug]`

`/projects` was a listing only — nine cards, no way to read more about any
one of them. The user asked for each project to have its own page.

**New route**: `src/pages/projects/[slug].astro`, server-rendered
(`prerender = false`, same as every other page on this site) rather than
statically generated — `Astro.params.slug` is looked up against
`src/data/project-detail.ts` at request time, and an unknown slug 302s back
to `/projects` rather than rendering an empty page. Slugs are computed, not
stored: `src/lib/slug.ts`'s `slugify()` is the one place a project title
becomes a URL segment, used both to build the link on every card and to
resolve the route, so the two cannot drift apart. Confirmed: all nine
routes return 200, an invalid slug 302s, and clicking a card on `/projects`
actually lands on its own page.

**No design export covers this — same position `/about`'s #20 was in.**
Every band on the new page reuses a pattern that already exists elsewhere
on the site rather than inventing one:

- **Hero** (ink + image) — the exact three-layer construction
  (photograph at 20% opacity, `--kd-hero-overlay` gradient, content in
  normal flow) every other hero on this site already uses, plus the
  ink-band "stat tile" grid (`--kd-stat-fill` / `--kd-stat-border`,
  `d5` mint value over an uppercase label) the homepage and `/projects`
  heroes already use for their own stats — reused here for a project's
  physical facts (RCC volume, steel tonnage, span, etc.) instead of
  inventing a new stat presentation.
- **Overview** (white) — Story.astro's plain kicker/heading/paragraph
  shape, one paragraph per `<p>`, `max-w-560`.
- **Closing CTA** (ink) — `projects/Cta.astro`'s own centred kicker →
  heading → mint button construction, verbatim, with different copy
  ("Explore the rest of our portfolio" / "View All Projects", both
  sourced from `project-detail.ts`'s `detailChrome`, not hardcoded in
  the template — see the codebase's standing "no hardcoded strings in
  markup" rule).

**Content is authored from the doc, not transcribed from an export**,
because there is no export — the same position #20 was in. Each project's
body paragraphs and stats are trimmed from `K.D.Website_Details.md`'s
fuller project descriptions (the same source #19b already used for the
listing's short `meta` lines), kept to two short paragraphs and up to four
stats to match the register of every other band on the site rather than
reading denser than its neighbours. Two Recently Awarded projects (Solapur,
Lower Parel) have only one stat each — "LoA Awarded" / "Recently Awarded"
as the `value` — because the doc gives no physical stats for a project at
LoA stage; the stat grid renders however many tiles exist rather than
padding to a fixed count.

**Cards are now clickable.** Both `projects/Listing.astro` and the
homepage's `Projects.astro` get a plain `<a class="absolute inset-0">` as
the last child of each card, `aria-label`led with the project's name,
rather than wrapping the card in an `<a>` — nothing inside a card was
otherwise interactive, so a stretched link makes the whole card clickable
without touching its sizing or its `position: relative` stacking context.
This is the only change to either existing file; no layout, grid, or band
was touched.

**Deliberately not wired into `scripts/check-edit-keys.mjs`.** That
script's `PAGES` map assumes exactly one static copy module per route and
walks every string leaf in it expecting a slot — a shape built for
`home.ts` / `about.ts` / `projects.ts`, each backing exactly one URL.
`project-detail.ts` backs nine URLs from one module with a different shape
(an array keyed by slug, not a page-shaped object), and reusing the same
`data-edit` keys across all nine on purpose (see the note in
`[slug].astro` — the in-page editor stores edits under `(page_path, key)`,
so identical keys on nine different paths cannot collide) doesn't fit the
script's per-page uniqueness model either. Extending the script to cover a
dynamic route properly is a real second piece of work, not a quick
addition, so these nine pages are verified by the production build and a
manual pass (all nine slugs return 200, screenshotted, click-through
confirmed) rather than by the automated gate. Flagged rather than silently
left uncovered.

**Not blocked on an answer**: every band is a reused pattern, the two
listing files gained one link element each and nothing else, and the
build and all nine routes are confirmed working.

---

## 22. The Matunga Workshop photo is now a supplied rendering, not a photograph

User-requested: `project-matunga-workshop.jpg` — the dusk photograph of the
Matunga carriage workshop entrance (PHOTOS.md tier A16) — replaced with
`Admin_Building(Matunga).png`, supplied directly rather than found in any
reviewed media folder. Same file path, so no import changed in
`Listing.astro`, `Projects.astro`, or `project-detail.ts` — only the
asset's bytes (resized to 1800px wide, flattened to RGB, JPEG q85, same
processing as every other asset in `src/assets/`) and the three alt texts
that described the old photo's actual content.

**This is a 3D architectural render, not a photograph** — rendered people,
cars and a stylised sky, the same category PHOTOS.md's "Do not use ✗"
table excludes for the Bonkode FOB assets ("a render on an EPC contractor's
site reads as a project you did not build"). Swapped anyway, on direct
instruction, but the three alt texts were changed from a photographic
description ("...entrance at dusk, lit water feature below the name wall")
to an honest one — "Architectural rendering of the Matunga Workshop
administrative building" — rather than left implying a photograph. The
subject is also a genuine fit: the doc's Matunga Railway Workshop scope
names "administrative and training facilities" specifically, which this
render depicts more precisely than the old entrance photo did.

**Scope, and what was deliberately not touched**: "Matunga photos" was
read as the photo captioned for the Matunga Workshop project specifically
— the three usages above — not every image sourced from the Matunga media
folder for an unrelated purpose. Two others were left alone:

- `project-solapur-vande-bharat.jpg` — the Vande Bharat trainset inside
  the Matunga shed, standing in for the Solapur depot card (#19b). It is
  a photo taken at Matunga, but swapping it for a building exterior would
  replace the one genuinely on-theme "train in a maintenance shed" image
  in the whole library with something that no longer fits a train
  maintenance depot card at all.
- `project-matunga-workshop-fob.jpg` — the Bonkode FOB stand-in for the
  Matunga Workshop FOB project (#19b). That project is a bridge; the
  supplied render is a multi-storey building. Using it there would swap
  one honestly-captioned generic stand-in for a picture of the wrong kind
  of structure entirely.

If either of those should also change, that's a separate decision — not
inferred from "all Matunga photos" here.

**Not blocked on an answer**: one asset file's bytes and three `alt`
strings changed; no component, layout, or data shape did. Build passes.

---

## 23. Project photo galleries — a Gallery tab on `/projects`, a gallery on each project page

User-reported: the photos were "completely missing" from the projects pages —
each project had one photograph (a card on `/projects`, a 35%-opacity hero
backdrop on its own page) out of a library of several hundred, and there was no
gallery anywhere.

**Built:**

- **44 photographs** across six projects, picked from `PHOTOS.md` tiers A/B/C
  and processed by the new `scripts/build-gallery.mjs` into
  `src/assets/gallery/` (EXIF-rotated, long edge ≤1600px, metadata stripped,
  OnePlus watermark and letterbox bars cropped). The script records the raw
  source of every file; captions live in `src/data/gallery.ts`.
- **`/projects` gets a fourth tab, "Gallery"**, which swaps the Listing band
  for a Gallery band (every project's photos, grouped, each group heading
  linking to the project page) and back. `/projects#gallery` opens on it.
- **Each project page gets a "Project Gallery" block** inside its white
  Overview band, under a divider — not a band of its own, because an ink band
  there would sit against the ink CTA and a light one against the white
  Overview (§2).
- **Click any photo to enlarge** — `Lightbox.astro`, a native `<dialog>` with
  Previous / Next / Close, arrow keys and Escape.

**Things that need an eye:**

- **Attribution is by folder.** Three groups rely on it: Panvel–Karjat is the
  `Chowk/` folder (a corridor station); Harbour Line FOBs is `Vashi FOB/`
  (Vashi–Sanpada is one of its four locations); Mumbai Harbour Line Station
  Redevelopment is the Mankhurd safety event of 8 January 2026 (Mankhurd is one
  of its four stations). If any folder belongs to a different job, move its
  entries in `gallery.ts`.
- **Panvel–Karjat has no stills at all.** Its five photos are frame grabs from
  the site's own 720p phone videos — honest, on-site, and soft. Real photography
  of the corridor would replace them file-for-file.
- **Three projects have no gallery**: Matunga Workshop FOB, Solapur and Lower
  Parel have no photographs of their own in the library, so their pages show
  none (rather than borrowing stand-ins, as their cards already do — #19b).
- **The lightbox is new UI** with no design behind it: solid ink surface,
  ghost buttons from §6, and the one place a photo is shown uncropped and
  unscrimmed. §11's "no hover animation" is respected — nothing animates.
- **Not in `/projects`' export**: the Gallery tab and its band. Same position
  as #18b's filter — a real control rather than a decoration.
- **`scripts/check-edit-keys.mjs`** now skips `.file` paths alongside `.alt`
  and `.href` — a gallery file name is an attribute source, not text. The
  `/projects` gate passes at 131 slots. The editor round-trip probe
  (`check:editor`) was not run: it writes real rows to `content_edits`.

**Not blocked on an answer**: every photo is a data entry in `gallery.ts`;
removing or reassigning one is a one-line change and a re-run of
`scripts/build-gallery.mjs` if a new file is needed.

---

## 24. The Matunga LHB facility was a second project folded into the Matunga Workshop entry

User-reported: the project pages and the homepage felt thin. The first real
cause found was not a shortage of source material — it was a project that had
never been given a page.

`K.D.Website_Details.md` lists **six** Signature Projects. This codebase only
ever carried five of them. The missing one is **"Creation of LHB Coach
Maintenance Facilities, Matunga"** (Indian Railways / COFMOW) — and it is the
largest RCC volume in the whole portfolio.

It had not been dropped, exactly. Its *numbers* were on the site, attached to
the wrong project: `Matunga Workshop`'s detail page carried `27,090 m³ RCC`,
`1,816 MT` steel and the `6,000 kVA` system as its own stats, with a second body
paragraph beginning "A parallel programme created LHB coach maintenance
facilities at the same workshop…". Two contracts, one card.

### What changed

- **A tenth project** — `Matunga LHB Coach Maintenance Facilities`, medium tier,
  `/projects/matunga-lhb-coach-maintenance-facilities`. Body and stats are the
  doc's own: 27,090 m³ RCC · 1,816 MT structural steel · 6,000 kVA · 3,089 m BG
  track, with the 2,749 m of inspection pit and traverser track in the prose.
  Titled the way every other entry on this page is — the doc's name shortened to
  a card-length noun phrase, the same treatment `Panvel–Karjat Suburban Rail
  Corridor` → `Panvel–Karjat Railway Line` already got.
- **`Matunga Workshop` gave those figures back.** The doc grants that contract
  one measured outcome and no volumes at all, so it now carries one stat —
  `350 → 575 Bogies/Month POH Capacity` — and its second body paragraph is the
  doc's own closing sentence rather than a description of the other project.
  Its client drops `/ COFMOW`, which belongs to the LHB contract.
- **Two `meta` lines that were quoting the LHB tonnage** — the `/projects` card
  and the homepage's featured card, both reading "Indian Railways · 1,816 MT
  Steel" — now read "Indian Railways · POH 350 → 575 Bogies/Month".
- **A new hero image**, `src/assets/project-matunga-lhb.jpg`, from
  `Matunga Images/matunga 6.jpeg`. Not a stand-in: the shed in it carries its own
  sign reading **LHB IDLI SHED**. It is the same raw source as gallery tile
  `matunga-workshop-02.jpg`, so the photograph appears twice on the site.

### Things that need an eye

- **`Matunga Workshop`'s page is now a one-stat page.** That is what the
  approved doc supports, and inventing volumes for it is exactly what created
  this problem — but if the company can supply RCC/steel figures for the
  workshop contract itself, that page is the first place they should go.
- **The gallery was deliberately left alone.** `Matunga Images/` covers a site
  that hosts *both* Matunga contracts, and the existing twelve captions were
  written by subject, not by contract. Splitting the group would renumber live
  `data-edit` keys for a judgement nobody has confirmed — so the LHB page shows
  no gallery of its own, and the coach-shed photographs stay under
  `Matunga Workshop`. **One question closes it:** which of those twelve
  photographs are of the LHB facility?
- **The new card was appended, not inserted.** `listing.medium.4` rather than a
  slot next to the other Matunga work, so no existing card's index — and
  therefore no stored edit key — moves. Display order on `/projects` is
  consequently not grouped by site.

**Not blocked on an answer**: build passes, `/projects` copy-slot gate passes,
and every change above is a data edit plus one image file.

---

## 25. The Founding Director was the wrong person

`src/data/about.ts` had **Mohanlal S. Gindodia** as Founding Director and
**Kailash S. Gindodia** as a Director, with the two remits swapped to match.

`KD_INFO.md` §3 and `CONTENT.md` both record this as a known error carried over
from the pre-approval drafts, corrected against the approved leadership slide and
confirmed again in the company's verification session of 2026-08-18:
**Kailash S. Gindodia is the Founding Director.** Both files carry an explicit
"do not revert" on it.

Fixed in place: the two `role` values and the two `bio` values swapped, so each
director keeps his existing array index and every stored `data-edit` key still
points at the same person. `Shiv K. Gindodia`'s role also gains the approved
slide's `· Inducted 2017`, which aligns with Chapter III opening in 2017.

### Things that need an eye

- **Provenance.** `K.D.Website_Details.md` — the text mirror of the approved
  `.docx` — assigns no roles at all; its Leadership section is an unresolved
  editorial note ("*Please collect the leadership data…*") listing four names.
  So this correction does **not** contradict the source of truth; it fills a
  blank the text mirror could not carry, because the role assignment lives in a
  slide image inside the `.docx`. Worth one confirmation from the company all
  the same, since it is the one place the site states something the text mirror
  does not.
- **Display order is unchanged** — Mohanlal still renders first and the Founding
  Director second, because reordering the array would renumber `data-edit` keys
  (DESIGN-SYSTEM §9: keys are database identities). The approved slide's order is
  Kailash · Sarita · Mohanlal · Shiv. **Reorder on request**, accepting that any
  edits already saved against `about.board.directors.*` would need re-pointing.
- **Still missing** for a real leadership block: professional portraits (the
  slide's crops are ~300 px) and 150–250 word biographies — `WEBSITE_INFO.md`
  §18 ranks this the second-biggest content blocker on the whole site.

---

## 26. `/projects` listing is two-up blocks on desktop, not one column

At the user's direction: the export's single column of full-width cards (#18a)
read fine on a phone but, on a desktop, as ten 1184px strips in a row — one
very long scroll. `src/components/projects/Listing.astro` is now a two-column
grid from `900px` (the homepage project grid's step, DESIGN-SYSTEM §10) and the
export's single column below it.

### What changed

- **Featured card and pipeline panel** span both columns, as before.
- **Medium (400px) and small (265px) cards** are one column wide — 584px at the
  1280 container. Tier heights are the export's; only the widths changed.
- **Odd one out.** A tier with an odd number of visible cards stretches its last
  card across both columns, so a card never sits beside an empty cell or a card
  of the other tier's height. Unfiltered, that is *Matunga LHB Coach Maintenance
  Facilities* (the fifth medium card). `Filters.astro` recomputes it on every
  tab, since Live and Completed leave different counts.
- **Medium and small images** are now cut at `1168×800` / `1168×530` (2× the
  584px box) instead of `1184×400` / `1184×265` strips, which a half-width box
  would otherwise have cropped to a sliver.

### Things that need an eye

- This is a deviation from the `/projects` export, requested rather than
  designed. The widened odd card in particular is a layout rule of mine, not
  the designer's.


---

## 27. `/clients` now shows the supplied client marks

The nine files in `Logo/` at the project root — the ones `WEBSITE_INFO.md` §9
records as "blocked: client logos and permission to display them" — were on
disk but not on the page. `/clients` rendered every client as a bordered text
card. Now every card in a section that has any logo opens with a **logo
well**: a 176px band across the top of the card, pulled through the card's
padding so its hairline runs edge to edge, the mark centred in it.

### What changed

- **`scripts/build-client-logos.mjs`** (`npm run logos:build`) writes
  `src/assets/clients/*.png` from `Logo/`. The supplied files were nine
  different canvases — white and off-white JPEGs, a 1px grey scan frame on
  Central Railway, a stray red rule under the Indian Railways roundel, a
  3092px transparent NMMC, and Balbharati's emblem still on its textbook-cover
  pattern. Each mark is cut out by an edge-seeded flood fill (so the white
  *inside* a mark — PWD's ring, the stars on the roundel — stays), un-matted
  at the rim so nothing halos on mist, trimmed to its own bounding box, and
  capped at 600px. **Centring the file therefore centres the mark**, which a
  white JPEG canvas would never have done.
- **`src/lib/client-logos.ts`** sizes each mark for one visual weight: equal
  *area* rather than equal height (Central Railway's wide lockup beside
  CIDCO's tall one), corrected by ink coverage (a solid roundel at 80% of its
  box beside CIDCO's open lockup at 22%). Coverage is written to
  `coverage.json` by the same script that cuts the files.
- **`InfoItem.logo`** in `src/data/pages.ts`, an attribute-only field like
  `gallery.ts`'s `file`; `check-edit-keys.mjs` skips it. Eight of the ten
  clients have one. **COFMOW has no mark on disk**, so its well sets the name
  in Fraunces instead, `aria-hidden` because the editable title follows.
- The marks are shown in full colour, uncropped, unscrimmed. DESIGN-SYSTEM §5
  is written for photographs; another organisation's mark is not one, and two
  of these carry the State Emblem, so nothing is recoloured or redrawn.

### Things that need an eye

- **Permission.** `WEBSITE_INFO.md` §9 lists "permission to display" as the
  block, not the files. The files have now been used on the assumption that
  their being supplied in the project folder is that permission. If it is
  not, remove the `logo` field from the client in question — the card falls
  back to the name in the well, as COFMOW's does.
- **Balbharati's "logo" is a textbook-cover illustration**, not a corporate
  mark — the two children reading, cut from its printed border. It is what
  was supplied. If a proper Balbharati mark exists, drop it in `Logo/`,
  point the script at it, and re-run.
- **Two of the three railway roundels are the same roundel.** Central and
  Western Railway's supplied files are the Indian Railways roundel over a
  zonal name. On the page they read as three near-identical red discs with
  different captions. That is accurate — it is how those zones present — but
  the well would look less repetitive with the zonal logos alone, if the
  client prefers.
- **The logo well is a fourth card element the design system does not
  name.** It is built as a variant of the §4.2 capability card (same border,
  padding, top rule) with a bordered band above the title, and is used only
  where an item carries a logo. Recorded, as #16b and #18c were.


---

## 28. Steel Fabrication & Erection is now a sixth engineering discipline

The user (2026-09-17): "we have steel fabrications and erections as well
but we don't have that section available." They were right about the
*section*, not about the topic. Steel fabrication was already on the site,
but only as a **plant** — the Vindhane facility under "Integrated
Manufacturing" on `/capabilities` and under "Facilities" on `/resources` —
and **erection was nowhere as a capability**. It appeared only inside
project narratives: "fabrication, launching and erection" at Matunga
Workshop FOB, Sanpada, Harbour Line FOBs and Panvel–Karjat. The source doc
had the same shape: `### Steel Fabrication` sat under `## INTEGRATED
MANUFACTURING & RESOURCES`, and `## ENGINEERING` listed five disciplines
with no structural-steel entry.

### What changed

- **`K.D.Website_Details.md`** gains `### Steel Fabrication & Erection`
  under `## ENGINEERING`, after Civil. It is written **only from facts the
  doc already states** — the truss/plate-girder systems, launching over
  running lines with OHE, the per-project tonnages (704.88 / 1,412 / 1,816
  / 3,046 / 4,686 MT) and the two recorded Harbour Line spans. No capacity,
  workforce, machinery or area figure has been added; none exists (KD_INFO
  §4.6 — "nothing further is available"). The at-a-glance "Core
  Capabilities" line now includes "Structural Steel Fabrication & Erection".
- **`/capabilities`** (`pages.ts`): a sixth card after Civil; heading
  "Five engineering disciplines." → "Six engineering disciplines."; meta
  description updated. Six items fill the 3-column grid in two full rows,
  where five left a gap.
- **Homepage card 04** (`home.ts`): "Steel Fabrication" → "Steel
  Fabrication & Erection", body rewritten to cover plant *and* site.
- **`/projects` tagline** (`projects.ts`, meta + hero): "Five decades. Five
  disciplines." → "Five decades. Six disciplines." The alliteration is
  lost; accuracy wins. If the client prefers the old line, the honest
  alternative is to drop the count, not to keep "five".
- The "Steel Fabrication" **plant** card under Integrated Manufacturing and
  on `/resources` is unchanged — it is the resource, the new card is the
  service.

### Things that need an eye

- **This overrides an earlier structural decision.** CONTENT.md and
  KD_INFO.md record "five engineering verticals + three integrated
  resources" as the approved structure (KD_INFO #4, CONTENT.md ~318). The
  user asked for the section explicitly, so the structure is now six + three.
- **The user is fetching more information.** Expect a body rewrite in both
  the source doc and `pages.ts` once it arrives. The current text is a
  grounded placeholder, not final copy.
- **Not touched, pending that info:** the prose discipline lists in the
  source doc's intro ("civil, mechanical, electrical, signalling &
  telecommunication, track engineering and railway infrastructure"), which
  `home.ts` about.body1 and `about.ts` mirror verbatim; and the supplementary
  files (CONTENT.md, KD_INFO.md, WEBSITE_INFO.md), which still describe the
  five-vertical structure.
- **No imagery.** ASSETS.md and PHOTOS.md both record zero photographs of
  the Vindhane plant. PHOTOS.md B11 (twin cranes at dusk, Vashi) is the only
  erection-in-progress frame in the library.

### 28b. The two decks, read on 2026-09-17

The user pointed at `3. KD 2026 Annual PPT.pptx` and `KD - Company
Profile.pptx` for fabrication and erection detail. Neither is a `.md`, so
neither was in the earlier grep. What they turned out to be:

- **The Annual PPT is "rev 1".** CONTENT.md, KD_INFO.md and WEBSITE_INFO.md
  already mined its text months ago — its "41+ units", chapter subtitles,
  RDSO line and Matunga ₹165 Cr are all logged there as superseded or 🟡.
  Its *photographs* were never extracted, though. Slide 12 ("The Plant at
  Vindhane That Changes Everything") carries three pictures of the plant
  and slide 15 one of the fleet at the same shed — the exact imagery
  ASSETS.md and PHOTOS.md recorded as "zero". Saved to `Vindhane Plant/`
  at their embedded resolution (≤1600 px); rows B19–B22 in PHOTOS.md.
- **The Company Profile deck was never seen before** — WEBSITE_INFO.md #18
  still lists "company profile / brochure" as a wanted document. It is 14
  full-slide PNGs with no text layer, so it was read by eye. Its slide 7
  is the one that answers the user's question: **"B. Heavy Structural
  Fabrication — Foot-over-bridges · Cover-over-platforms · Steel roofing
  systems · Large-span industrial sheds"**, with "On-site fabrication" under
  Project Management & Execution, and on slide 13 "Fabrication equipment —
  welding, bending and cutting machines". Slide 11 adds the one erection
  *method* detail in either deck: **"Vashi Flyover Bridge — two 650T
  telescopic cranes … to lift and place the structure"**, which PHOTOS.md
  B11 (twin cranes at dusk, Vashi FOB) corroborates visually.

### What went in

- **Source doc §Steel Fabrication & Erection** now names the four
  fabrication product types, the plant's welding/bending/cutting
  machinery, on-site fabrication, and the two-crane Vashi lift. The plant
  paragraph under Integrated Manufacturing gains the same equipment line
  and product list.
- **`pages.ts`**: the /capabilities card body and the /resources plant card
  body carry the product list and machinery. Homepage card 04 unchanged.

### Deliberately left out

- **RDSO.** The Annual PPT says "girder manufacturing certification in
  progress". KD_INFO §4.6 and WEBSITE_INFO §0 rule 3 are explicit: never
  state or imply it, confirm before it goes on the fabrication page. The
  user has not confirmed. Not on the site.
- **Everything in the Company Profile that conflicts with the approved
  doc.** "Founded in 2004" and "nearly two decades" (the doc: 1973; 2004 is
  incorporation) · "500+ dedicated personnel" (no workforce figure is
  approved) · Matunga Workshop "150 Crores" (Annual says 165; doc says
  neither) · Uran "exceeded 110 Crores" · Nhava Sheva "3000+ MT / 29,000 m³
  / 270 m platform" (the doc's own 3,046 MT and 29,421 m³ are the precise
  versions; 270 m platform is new but unconfirmed). The doc wins on every
  one, per the standing rule.
- **The Company Profile's non-railway portfolio** — Bonkode Skywalk
  (72 × 3 m, Thane–Belapur highway, Bonkode village to TTC belt), Kharghar
  Golf Course Club House, CIDCO Urban Health Centre (20,000 sq ft), Nesting
  Tree (G+4), Lush Meadows. Not fabrication content, but it **identifies
  four of ASSETS.md's "unidentified" folders** (Bonkode FOB, Karanjade
  Health Care, Lush Meadows, Kharghar Golf Course) and answers KD_INFO
  §7's open question on whether Bonkode is part of the Harbour Line
  contract — it is not; it is a road skywalk. Worth a separate pass.

### Things that need an eye

- **"Vashi Flyover Bridge" was read as the Vashi FOB.** The slide's photo
  is an FOB staircase, and the two-crane frame in `Vashi FOB/` matches. If
  it is a different structure, the sentence in the source doc and the
  6.4 MB of confidence behind it both move.
- **"Some of the biggest in India"** was dropped as unverifiable marketing;
  the 650-tonne class was kept as the company's own statement.
- **B21 (EOT crane under a shed roof)** sits on the Vindhane slide but has
  no caption. It may be the plant's own crane or a project shed. Confirm
  before captioning it as the plant.
- **Ask for the originals** of B19–B22. What the deck embeds is 1600 px at
  best; the plant photograph is the one this site has been missing.

### 28c. The sixth discipline was missing from the footer — and the prose (2026-09-18)

The user, on `/capabilities`: the section heading says **"Six engineering
disciplines."** and lists six cards; the footer's **Core Disciplines** column
on the same page listed five. #28 added the card and updated the counts on
`/capabilities` and `/projects`, but did not touch the footer at all, and
deliberately parked the prose lists ("not touched, pending that info"). The
result was one page contradicting itself — the user's word was "consistency",
and they were right.

**What changed:**

- **Footer** (`home.ts` → every page): "— Steel Fabrication & Erection" added
  after Civil, in the source doc's §ENGINEERING order, so the column reads in
  the same order as the six cards on `/capabilities`. That **renumbers
  `*.footer.columns.disciplines.items.1–4`** on every page. DESIGN-SYSTEM §9
  forbids renumbering because keys are `content_edits` identities; the table
  was queried before the change and holds **zero rows**, so nothing was
  orphaned. After launch this option is gone — a seventh discipline would have
  to be appended, as the CSR nav link was.
- **Prose lists** that enumerated five, now six. "structural steel fabrication
  & erection" is the wording the `/capabilities` meta description already
  used: `home.ts` HERO_SUB (hero sub + meta), `home.ts` about.body1, `home.ts`
  "Full EPC Delivery" card ("structural steel", the short form, in a card),
  `about.ts` story.body1, and `K.D.Website_Details.md` line 17 — the intro
  the site mirrors.

**Left as-is, on purpose:** the About timeline bullet "Extended reach from
civil works into mechanical, electrical, and track engineering" is a
historical note (source doc line 52) and omits Signalling & Telecom too — it
is not a discipline count. The source doc's mission line (64) likewise. The
supplementary research files (CONTENT.md, KD_INFO.md, WEBSITE_INFO.md,
docs/STRUCTURE.md) still say "five verticals"; #28 already records that they
describe the superseded structure.

---

## 29. The borrowed `docs/` folder, read end to end — what it added to the project pages

The user (2026-09-17): "the projects are lacking and each project page has
very little info … I have borrowed a folder from another project which is
largely similar but still should contain 5% new info." Twelve `.md` files
in `docs/`. Four are **byte-identical** to files already at the repo root
(`ASSETS.md`, `CONTENT.md`, `KD_INFO.md`, `WEBSITE_INFO.md`) and one is an
older subset of the root `PHOTOS.md`. The seven genuinely new files are
`README.md`, `ASK.md`, `DESIGN.md`, `IMAGE_MAP.md`, `NEEDED.md`, `SEO.md`
and `STRUCTURE.md` — and of those, `ASK.md` is the one that matters: it
records an **in-person verification session on 2026-08-18** whose answers
`KD_INFO.md` (revision 4) marks 🗣 and treats as carrying the same
authority as the approved `.docx`. Everything below rests on that.

The user's own rule stands: `K.D.Website_Details.md` is the source of
truth. Nothing in `docs/` contradicts it. Every addition was written into
that file first (with a provenance comment per sentence), then into
`project-detail.ts`.

### What went in — ★ approved or 🗣 confirmed only

| Page | Addition | Grounding |
| --- | --- | --- |
| **Matunga Workshop FOB** | Third paragraph: locally known as the **Matunga Z-Bridge**; restored the Matunga East–West link after 1+ year closed, for lakhs of commuters, students and residents | 🗣 ASK.md #1 "same structure" — which is what released the story (CONTENT.md rev 4, KD_INFO §7.2). "Lakhs of residents" is also the source doc's own CSR line |
| **Matunga Workshop** | Third paragraph: the programme carried the portfolio's **signalling & telecommunication** scope | 🗣 ASK.md #3 "Matunga only". Body copy, not a badge — see below |
| **Matunga LHB** | Two more stat tiles: **2,749 m** pit/traverser track · **80 t** CNC traverser | ★ already in the body, now in the grid; six tiles fill the 2-col grid |
| **Nhava Sheva & Uran** | Paragraph 2 now carries the quantities and **"subways at both ends"** | ★ doc wording that was in the grid but not the prose |
| **Harbour Line FOBs** | Third paragraph: **two 650-tonne telescopic cranes** at the Vashi FOB · fourth stat tile "Truss + Plate / Girder Systems" | ★ already in the source doc's Steel section (#28b); Vashi FOB = this contract's Vashi–Sanpada location (KD_INFO §7.7, IMAGE_MAP §2) |
| **Harbour Line Redevelopment** | Third paragraph + stat tile: **45,000+ commuters a day**; **Kavach installed at Mankhurd** | 45,000+ is the source doc's own CSR figure for "station redevelopments"; Kavach 🗣 ASK.md #2 |
| **Sanpada Carshed** | Fourth stat tile "P-Way / Track Laying Works" | ★ in the body, now in the grid (KD_INFO §4.2 cites it as Track evidence) |
| **Lower Parel** | "at Western Railway's **Lower Parel Workshop**" | ★ the doc's own name for the site in its About paragraph and at-a-glance list |
| **Solapur** (+ listing) | Client "Central Railways" → **"Central Railway"**; Lower Parel listing "Western Railways" → "Western Railway" | The zone's name; the doc's own at-a-glance; `/clients` |
| **Panvel–Karjat** | Nothing. The page already carried every approved fact | — |

**Source doc** also gains a `## Further Projects — confirmed, not yet
described` list (see next section) so the 🗣 confirmations survive if
`docs/` is removed.

No markup changed. `[slug].astro` maps over `body` and `stats`, so three
paragraphs and six tiles render without touching the template.

### Deliberately NOT published — 🟡 in every file that holds them

These are the "5%" the user hoped for that the docs themselves say to
confirm first. One yes from the company adds each; none is on the site:

- **Matunga Railway Workshop heritage** — established 1915 · India's first
  railway workshop · first GreenCo Platinum-rated railway facility ·
  overhauls 200+ mainline coaches a year · headline *"India's first
  railway workshop. Now, its most modern office."* (ASK.md 🟠 #54)
- **Sanpada** — "Belapur–Uran line"; *"Three disciplines. One delivery. Zero
  disruption."* / "zero disruption to a single train"; inauguration by
  **Shri Vivek Gupta, GM Central Railway** with Directors Kailash and Shiv
  Gindodia. Naming a serving railway officer is flagged as a judgement
  call in KD_INFO §7.3 — ask before it goes anywhere (ASK.md #53).
- **Harbour Line Redevelopment** — **425+ train movements a day** (the
  45,000+ figure went in because the source doc itself states it; this
  one appears only in the earlier documents).
- **Matunga FOB** — the "Gati Shakti" framing, and the pull quote *"Built
  with discipline. Delivered with care."* (no pull-quote slot exists on the
  page; the quote is released copy if one is ever added).
- **Kavach — which contract.** S&T scope was given as "Matunga only" but
  Kavach was installed at Mankhurd, a Harbour Line location. ASK.md 🔴 #2
  asks which contract it sat under; until answered, the site ties Kavach to
  the *place*, and the S&T sentence sits on the Matunga Workshop entry.
  The verbal answer named the site, not which of the two Matunga contracts.

### The bigger gap the docs expose — the confirmed projects with no page

ASK.md #5–6 (🗣): the company confirmed **seven more projects as its own
work** — Kharghar Golf Course, Kharghar Football Stadium, Bonkode FOB (the
"White House" FOB), Ulwe Hospital, Ulwe CIDCO School, Karanjade Health
Care and Lush Meadows — plus Kharghar Centre of Excellence named ★ but not
covered by the session. The docs are unanimous on how to present them:
**a name, a location and a photograph — never a case study with empty
fields** (KD_INFO §7.13, WEBSITE_INFO 10d). Photography for six of the
eight is already in the repo root (`Bonkode FOB/`, `Kharghar Golf
Course/`, `Ulwa Hospital/`, `Ulwa CIDCO School/`, `Karanjade Health Care/`,
`Lush Meadows/`); IMAGE_MAP.md rates the Bonkode and golf-course frames
Tier A. #28b's read of the Company Profile deck adds scope for four of
them (Bonkode skywalk 72 × 3 m over the Thane–Belapur highway; CIDCO
Urban Health Centre 20,000 sq ft; golf-course clubhouse; Nesting Tree
G+4) that the docs did not have.

**Not built in this pass** — it is a new strand on `/projects` (KD_INFO
§15 calls it "Social & Public Infrastructure"), not an enrichment of the
ten existing pages, and the user's ask was the pages. It is the largest
single thing the docs unlock. Two honest routes: (a) a photo-led gallery
group per project on the existing Gallery tab, no detail page; (b) a new
band on `/projects`. Either needs the user's call on positioning — with
these on the site, K.D. reads as a railway-led EPC contractor with a real
social-infrastructure record, not a pure railway specialist (KD_INFO
§7.13).

### Things that need an eye

- **The `docs/` recommendations this pass did not act on**, because each
  is a client decision rather than missing information: drop the
  **₹362.90 Cr / three-tenders pipeline** figure on `/projects` (KD_INFO
  §7.11 — "pipeline figures date fast and nobody has volunteered to
  maintain it"; the approved "What's Next" is qualitative); put an
  **"as of" date** beside the 90%+ / 60%+ live percentages (every file
  says so).
- **`docs/DESIGN.md` is a different design** — navy `#0B2C52` / orange
  `#F28C28`, Montserrat. It predates the approved ink/mint homepage and
  was not consulted. Nothing from it applies.
- **The S&T sentence sits on Matunga Workshop, not the LHB entry.** If the
  company says the scope was under the LHB contract, move one paragraph
  and one line in the source doc.
- **Four `docs/` files duplicate root files exactly.** Nothing to
  reconcile now, but if either copy is edited the other goes stale;
  `docs/PHOTOS.md` is already eight lines behind the root one.

---

## 30. "Beyond the railway" — the confirmed non-railway projects, on `/projects`

The user (2026-09-17), on #29's closing offer: "please start working on
this." The offer was the seven projects the borrowed `docs/` folder records
the company confirming as its own on 2026-08-18 (ASK.md #5–6), and which
had no presence on the site: Kharghar Golf Course, Kharghar Football
Stadium, Bonkode FOB, Ulwe Hospital, Ulwe CIDCO School, Karanjade Health
Care, Lush Meadows.

### What the docs allow, and what was built to exactly that

Every file that mentions them says the same thing: **a name, a location
and a photograph — never a case study with empty fields** (KD_INFO §7.13,
WEBSITE_INFO 10d, CONTENT.md "Named but undescribed"). No client, scope,
value or year exists for any of them, and for the Kharghar pair the
company said "skip for now". So:

- **A new band, not six more listing cards.** Every card in
  `Listing.astro` is built around a client and a figure (`meta`), a
  discipline badge set and a page behind it. These have none of those.
  Forcing them into that shape would have meant blank meta lines or
  invented badges — the "empty fields" the docs warn against. The band is
  `projects/Social.astro`; its copy is `projects.social` in
  `projects.ts`.
- **Six tiles, not seven.** Kharghar Football Stadium has no photograph
  anywhere (IMAGE_MAP §3) — the docs say hold it until one exists rather
  than publish an empty tile. Kharghar Centre of Excellence is named ★
  but was not covered by the session and has no photograph either; one
  yes/no and one photograph add it.
- **The tile is the §5 media box the site already has** — `GalleryGrid`'s
  tile verbatim (265px, `object-cover`, `--kd-scrim-sm`, caption 20px in,
  square) with the small listing card's title/meta pair inside the
  caption (`text-d9` over `text-meta-sm`). Two text leaves, because a name
  and a location are two things and the editor needs a slot for each.
- **No link from any tile.** There is no page to link to, and a tile that
  302s back to `/projects` is a broken link with extra steps.
- **Click opens the page's existing Lightbox**, cycling through this band
  only (`data-lightbox-group="social"`). The lightbox now prefers a
  `[data-lightbox-title]` element inside the tile for its caption when
  one exists, falling back to the whole `<figcaption>` as before — without
  that, the two runs in this band's captions would have been joined into
  "Bonkode FOBBonkode · Navi Mumbai". `GalleryGrid` tiles are unaffected.

### Where it sits, and what that does to the band stack

Between Listing (ink) and the closing CTA (ink), on **mist**. That is where
DESIGN-SYSTEM §2's alternation puts a new band — and it means the
Listing → CTA ink-on-ink boundary that #18f recorded as built-as-drawn is
no longer what the default view of `/projects` shows. §2's `/projects`
table is updated. Two views still show the old boundary, as drawn: the
Gallery tab (which hides this band along with the listing) and the Live
tab (which hides it because nothing here is live).

### The tabs

The band carries the two attributes the listing's cards carry, and
`Filters.astro` treats it as one of them with no special case:
`data-listing-view`, so the Gallery tab hides it with the listing; and
`data-project-status="completed"`, so Live hides it and All / Completed
show it. The one script change is `querySelector` → `querySelectorAll`
on `[data-listing-view]`. "Completed" is the only status these photographs
evidence — every frame is a finished building in use — and the only one
claimed.

### The copy

Authored, not transcribed — there is no approved prose for this strand,
the same position #20 and #21 were in. Kicker **"Social & Public
Infrastructure"** is the docs' own name for the strand (KD_INFO §15).
Heading **"Beyond the railway."** Body names the six things in the
photographs and where they are: *"A hospital, a school, a health centre,
a golf course, a residential tower and a road skywalk — K.D. Constructions'
work across the public buildings and amenities of Navi Mumbai."* "Road
skywalk" for Bonkode is #28b's reading of the Company Profile deck
(a skywalk over the Thane–Belapur road, not a railway FOB — which also
answers KD_INFO §7.7's open question: it is not part of the Harbour Line
contract). Locations are "Node · Navi Mumbai", the small card's
"X · Y" meta shape without a client. Spellings are the approved ones —
Ulwe, Karanjade — not the folders' Ulwa / Karanjale.

### The photographs

Cut by `scripts/build-gallery.mjs`, which gained an optional prefix
argument (`node scripts/build-gallery.mjs social-`) so a new group can be
added without re-cutting all 44 existing frames or needing ffmpeg. One
frame per project:

| Tile | Source | Why this frame |
| --- | --- | --- |
| Bonkode FOB | `Bonkode FOB/AX6A7070.JPG` | IMAGE_MAP A9, the whole span with both lift towers over traffic. **Not `WHITE HOUSE FOB 1.jpg`** — that frame is already the Matunga Workshop FOB stand-in (#19b), and the same photograph under two project names would be wrong |
| Ulwe Hospital | `Ulwa Hospital/1.jpg` | 5760×3840, IMAGE_MAP A27 |
| Ulwe CIDCO School | `Ulwa CIDCO School/school.jpg` | The clean frame. `ULWE CIDCO SCHOOL.jpg` is a collage with two inset thumbnails |
| Karanjade Health Care | the folder's one image | — |
| Kharghar Golf Course | `GOLF COURSE NEW.jpg` | IMAGE_MAP A26. `GOLF COURSE.jpg` is also a collage |
| Lush Meadows | `Lush Meadows/AX.JPG` | 5760×3840. PHOTOS.md's "Kailash Developers branding — do not use" ruling predated the confirmation and is retired for this file |

### Things that need an eye

- **The Matunga Workshop FOB stand-in is now a photograph of a project
  that is on the site under its own name.** `project-matunga-workshop-fob.jpg`
  is `Bonkode FOB/WHITE HOUSE FOB 1.jpg` (#19b), honestly captioned as a
  generic canopied walkway. That was defensible when Bonkode was an
  unidentified folder; with a "Bonkode FOB" tile two bands down it invites
  the reader to notice. The right fix is a photograph of the Matunga
  structure (still none — IMAGE_MAP §3); the honest interim is a different
  stand-in, and the Harbour Line FOB frames are the nearest by kind.
  Not changed here — it is the user's call which way to go.
- **`Ulwa Hospital/ULWE HOSPITAL.jpg` and `Karanjade Health Care/Karanjale
  Health Care.jpg` look like the same building** (a white tower with a
  vertical blue glazed column), photographed from two angles. `1.jpg` — a
  different, beige building — was used for the hospital tile, so nothing
  on the site depends on which is which, but one of the two folders is
  probably mislabelled.
- **More frames exist.** Bonkode has eight usable frames (IMAGE_MAP A9–A13)
  and the golf course two more; the band shows one each on purpose. If a
  fuller gallery is wanted, the Gallery tab's group shape (`gallery.ts`)
  is the place — but a group there links to a project page, and these
  have none, so that link would need to become conditional first.
- **The kicker wraps to two lines at phone width.** "Social & Public
  Infrastructure" is the longest kicker on the site; at 390px it breaks
  after "Public". It is the docs' name for the strand and it wraps
  cleanly, but a shorter kicker is a one-string edit if it grates.
- **The Company Profile deck has scope for four of these** (#28b): Bonkode
  skywalk 72 × 3 m; CIDCO Urban Health Centre 20,000 sq ft; the golf-course
  clubhouse; Nesting Tree G+4. None of it went in — the deck is not the
  approved document, and one line of scope on some tiles and none on
  others is the empty-fields problem again. If the company confirms those
  figures, the tile has room for one meta line beneath the location.
- **Positioning.** With this band, `/projects` says K.D. is a railway-led
  EPC contractor with a real social-infrastructure record (KD_INFO §7.13's
  conclusion). The hero sub still says "Indian Railways, urban transit,
  and government infrastructure" — which covers it. Nothing on `/` or
  `/about` mentions the strand; whether it should is a separate question.

### Verification

`npm run build` clean · `check-edit-keys` on `/projects`: all 171 keys
unique, every copy string in its own slot · layout-shift gate: worst CLS
0.0077 · tabs driven at 1440px and 390px: band shown under All and
Completed, hidden under Live and Gallery, listing restored on return ·
lightbox opens from a tile, captions "Bonkode FOB", counts "1 / 6", Next
lands on "Ulwe Hospital", 1600px rendition loads · all six tile images
load after scroll · no horizontal overflow at 390px · editor: signed in,
every new slot marked editable, a caption click in edit mode enters
editing rather than opening the lightbox — nothing written to the content
table.


---

## 31. Steel Fabrication & Erection, in the project list

The user (2026-09-17), after #28 and #28b: "this was about us adding steel
factories in project list but i don't see a single mention of steel
factories." #28 had read the first request ("we don't have that section")
as a missing *capability*, and added it to `/capabilities`, the homepage
card and the source doc's ENGINEERING section. `/projects` was untouched,
so the project list still said nothing about steel. That was the miss.

### What exists to put in a project list

Searched on 2026-09-17: `K.D.Website_Details.md`, the `.docx`, all of
`docs/`, both decks. **No steel factory built for a client appears
anywhere** — no name, client, location or figure. The Company Profile
deck lists "large-span industrial sheds" as a fabrication product type,
with no project attached. What does exist:

- **K.D.'s own steel factory** — the Vindhane plant, now photographed
  (PHOTOS.md B19, #28b).
- **Six listed projects the source doc gives structural steel for** —
  five with tonnage, one (Harbour Line FOBs) with four launch locations.

### What was built

- **A fifth tab, "Steel Fabrication & Erection"**, appended after Gallery
  so no stored tab key moves. It shows the six steel projects, the plant
  card and the ledger, and hides everything else, "Beyond the railway"
  included. `/projects#steel` opens on it. `ProjectEntry.steel` is a
  boolean, invisible to check-edit-keys like `live`.
- **The Vindhane plant card** — full width, the medium tier's build,
  560px tall below 900px so its caption clears the photograph's white sky.
  Links to `/resources`; it is a resource, not a client project, and has
  no status, so Live and Completed hide it.
- **The steel ledger** — the pipeline panel's stat-tile fill: "11,600+ MT"
  (the doc's five tonnages sum to 11,664.88), one row per project with
  its figure, each linking to that project's page. Rows say "Fabrication
  & erection" only where the doc does; LHB and Nhava Sheva & Uran say
  "Structural steel", because that is all the doc says.
- **Inside the ink listing band, not a band of its own.** A light band
  after Listing would meet "Beyond the railway" (mist) light on light —
  DESIGN-SYSTEM §2. The band table is therefore unchanged.

### Things that need an eye

- **"Steel factories", plural.** Only one plant is on record. If there is
  a second yard, or if the user meant factories K.D. *built* for clients,
  each needs at least a name, client, location and one figure to become a
  listing card; with a photograph it can be a full card, without one it
  cannot (the empty-fields rule, #30).
- **Discipline badges were not changed.** Only Matunga Workshop FOB
  carries "Structural Steel"; the other five steel projects do not. Adding
  a fourth chip to Sanpada's small card overflows at 390px without a
  `flex-wrap` on the chip row. The tab does the grouping instead.
- **Tab order.** Appended last for key stability, so it follows Gallery,
  the one tab that is a view rather than a filter. Moving it before
  Gallery renumbers `projects.filters.tabs.3` — check the content table
  for a stored edit on that key first.

### Verification

Build clean · `check-edit-keys` passes on `/projects` (197 keys), `/`,
`/capabilities`, `/resources` · CLS 0.0006 · driven at 1440px and 390px:
All shows 11 cards + ledger + social band; Steel shows 6 projects + plant +
ledger, social hidden; Live hides plant and ledger; `#steel` deep link
activates the tab; no horizontal overflow · all six ledger links and the
plant card's `/resources` link return 200.

## 32. Placeholders on the site — missing content shown, not hidden

The user (2026-09-18) asked why there is no CSR page, was shown the
standing decision (#29's "deliberately left alone", CONTENT.md §CSR,
WEBSITE_INFO.md §14: the source section is a skeleton with a `[To be
added]` bullet, and rule 6 says never ship one), and then set a new
rule: *"all the things that had to be added in their details — add
their page and all that, and where the content will sit write their
[To be Added]… I got scolded because I did not add a page; turns out
they did not provide the content for it."* And: *"all details that we
don't have, mention it in website and in other doc that will remind me
to fill it or remove it before going live."*

So the policy inverts for the **review** period and holds for
**go-live**: a page the brief promises exists now, with the gap drawn on
it where the content will sit, and a gate refuses a launch build while
any gap remains. The client sees what is owed on the page it belongs
to; the developer cannot forget it.

### What was built

- **`/csr`** — InfoPage, `csr` export in `pages.ts`. The three commitments
  the brief words (Workforce Health & Safety, Community Impact,
  Environmental Responsibility) as ordinary cards, then a "Content
  Pending" section of four **pending cards**, one per item in the brief's
  own `[To be added]` bullet. In the nav and the footer — **appended
  last** in both arrays, after Contact, because link *i* is edit key
  `<page>.nav.links.i.label` on every page and index 6 must keep meaning
  Contact. Measured at 1080px, the drawer breakpoint: eight links and the
  CTA on one row, 44px tall, nav right edge at 1032 of 1080.
- **`/hse` Certifications** — a fourth, pending card, "Other
  certifications & certificate details". The brief's Leadership section
  ends on the copywriter's open ask for exactly this. Four cards, so the
  section takes the 2×2 branch InfoPage already had for HSE's
  commitments.
- **`/projects` Beyond the railway** — Kharghar Football Stadium
  (confirmed, no photograph) and Kharghar Centre of Excellence (named,
  unconfirmed), which #30 held back, are now two **pending tiles**
  appended after the six photographed ones. Same 265px box on ink, a
  dashed ghost outline, the badge, a note saying what is needed, the
  name/location caption. No lightbox, no button.
- **The mechanism.** `pending?: string` on `InfoItem` and `SocialProject`
  — the badge label. A pending InfoPage card is the same card with
  `border-dashed` and the project cards' badge chip (teal fill/border,
  DESIGN-SYSTEM §11 "teal is for badges") in ink above the title. Every
  pending element carries `data-pending`. Every pending string is a slot
  with its own key, so check-edit-keys passes unchanged.
- **The gate.** `scripts/check-placeholders.mjs` walks the copy modules
  for `pending` fields and exits 1 while any exist, listing page, title,
  label and key. `npm run check:placeholders`; `npm run build:release`
  runs it before `astro build`. `PRE-LAUNCH.md` is the same list for
  people, with what K.D. must supply and what to do if it does not
  exist, plus three sign-offs (director names/spelling, portraits,
  the Community Impact framing) that are on the site but unverified.
- **Registered:** `/csr` in check-edit-keys PAGES, `KNOWN_PATHS` in
  `editable.ts` (the sanctioned edit — its own comment says to add a
  page there), the sitemap picks it up.

### Deliberately not done

- **No placeholder on the Board.** The brief's Leadership note asks for
  verification, but the site already has all four directors from the
  approved `/about` export; a fifth card would break the ruled 2×2, and a
  portrait slot is a design change. Both are sign-off rows in
  PRE-LAUNCH.md instead.
- **Community Impact kept in the brief's words**, not softened. Rule 8
  (paid contracts are not philanthropy) is a real concern, but the copy
  is the client's own and the resolution is theirs — PRE-LAUNCH.md S3.
- **The 47-item NEEDED.md backlog** was not turned into placeholders.
  Most of it is closed or was never page content. Only what the brief
  itself flags, on the page it belongs to.

### Things that need an eye

- **WEBSITE_INFO.md rule 6** ("never ship a `[To be added]` bullet")
  now reads as a go-live rule enforced by the gate, not a rule against
  the review build. Not edited there — that file is the borrowed
  reference set — but this record and PRE-LAUNCH.md say so.
- **The nav has eight links.** It fits at 1080px with 48px to spare
  on the right. A ninth would not; the next page goes in the footer.
- **`check-placeholders.mjs` only sees modules in its `MODULES` list.**
  A new copy module with pending items must be added there — the
  parallel Vindhane plant session (kd-final-38) was told this and is
  adding `plant-detail.ts`.

### Verification

Build clean · check-edit-keys passes on all nine routes (`/csr` 73 keys,
`/hse` 71, `/projects` 207, `/` 103, `/about` 131, and the other four
unchanged) · check-placeholders lists exactly the seven placeholders
above and exits 1 · nav measured at 1080/1120/1280/1440: eight links on
one row, no wrap, no overflow · `/csr` and `/projects` at 390px: no
horizontal overflow · pending tiles have no lightbox trigger.

## 33. The Vindhane plant has its own page — `/resources/vindhane-plant`

The user (2026-09-18), looking at the plant card #31 put on `/projects`:
*"why doesn't this have its own page."* Then: *"what do other
construction companies do? how do they represent their own factories
and erections? I would like to do the same."*

### Why it had none

#31 framed the plant as "a resource, not a project": no client, no
status, none of `ProjectDetail`'s fields, so it was kept out of
`project-detail.ts` and its card linked to `/resources`, where the
plant is one card in a two-item Facilities list. A 560px hero card
landing at the top of a generic page was the weak point.

### What peers do (searched 2026-09-18)

Large EPC contractors (L&T, Afcons, KEC, Skipper), international
steelwork contractors (Severfield, Walters, Cimolai) and Indian
railway-girder specialists nearest K.D.'s scale (Goodluck India,
Global Steel Company, SKV, Steelinfra):

- **The plant is never filed under Projects.** It lives under About or
  Expertise as *Facilities* / *Manufacturing* / *Infrastructure* (the
  Indian convention) / *Strategic Equipment* — which is what `/resources`
  is. Only L&T gives each facility its own URL.
- **A factsheet, not a story.** Headline figures first — capacity in MT
  per annum, plant area, site count, equipment counts ("20,000 MT per
  annum at our 60,000 sq ft plant"; "153 cranes, 21 piling rigs") —
  then machinery (CNC cutting, SAW/CO2 welding, EOT cranes, trial
  assembly), product types, certifications, a photo or small gallery.
- **Fabrication and erection side by side as separate services**, the
  erection half about launch methods, cranes and live-line work.
- **Proof is a tonnage ledger and client names** — "over 10,000 MT of
  steel bridges", spans "5 m to 63 m".

Offered two shapes — a facility band on `/resources` (what most peers
do; recommended) or a standalone page (the L&T pattern). **The user
chose the standalone page**, and, asked which figures they could
supply, said none yet: *"build without numbers, and leave any numbers
that are necessary as to be added."*

### What was built

- **`src/pages/resources/vindhane-plant.astro`**, four bands (band table
  in DESIGN-SYSTEM §2): the `/projects/[slug]` hero with a back link to
  Resources, "Our Own Plant" kicker, location line, one discipline
  badge and four tiles; a white band with three paragraphs from the
  source doc (§Steel Fabrication & Erection, §INTEGRATED MANUFACTURING
  & RESOURCES — nothing new), two hairline lists ("What the plant
  makes" / "How it is equipped") and a gallery block; an ink band with
  the erection paragraph, the steel ledger's rows each linking to its
  project page, and a "View Steel Projects" button to `/projects#steel`.
  The button lives in the ink band because a CTA band after it would be
  ink on ink.
- **`src/data/plant.ts`** — its own module, no image imports (both Node
  gates load it). Keys are `resources.plant.*`; Nav and SiteFooter take
  `page="resources"`. The ledger rows are imported from `projects.ts`,
  one definition site. Registered in `check-edit-keys.mjs` (prefix
  `resources`), `check-placeholders.mjs` and `editable.ts`.
- **Three `pending` placeholders** (#32's mechanism, drawn on ink the way
  Social.astro draws them and on white the way InfoPage does): *Annual
  capacity* and *Plant area & year* as hero tiles, *Machine inventory*
  as the last equipment row. None of the three figures exists in
  `K.D.Website_Details.md`, `docs/`, or either deck — slide 12 of the
  annual deck says only that RDSO girder certification is *in progress*,
  which is not published (docs/CONTENT.md §Steel Fabrication).
  PRE-LAUNCH.md rows 4a–4c.
- **The two real tiles** are figures already on the site: "11,600+ MT"
  (the #31 ledger total, labelled "across five projects" because it is
  steel delivered, not plant output) and "2 × 650 t" (the Vashi lift).
- **Gallery**: PHOTOS.md B19 (the yard, also the hero) and B20 (the
  welder), cut by `build-gallery.mjs` — B20's foot trimmed 30% so the
  tile's centre crop keeps the face. B21 (EOT crane) is uncaptioned on
  the deck slide and stays out; PRE-LAUNCH.md S4 asks.
- **Links in**: the `/projects` plant card now goes to the page; the
  `/resources` Facilities card gained an "About the plant" link. The RMC
  plant has no page — no photograph, one sentence.

### Things that need an eye

- **Nav highlight.** Nav marks a link active on an exact path match, so
  Resources is not lit on this page — the same as Projects on
  `/projects/<slug>`. A prefix match would fix both; not changed here.
- ~~`check-placeholders` printed the page as `/plant`~~ — fixed the same
  day (#32's session gave MODULES an explicit `route` per export); it
  now prints `/resources/vindhane-plant`.
- **Only two gallery tiles** in a three-column grid. B21 on a yes makes
  three; originals of B19–B20 (PHOTOS.md ask #3) would improve both.

### Verification

Build clean · `check-edit-keys` passes on `/resources/vindhane-plant`
(108 keys), `/resources` (68) and `/projects` (207) · `check-placeholders`
lists the three plant items (10 on the site) · CLS worst 0.0133 against
0.1 · hard-rule greps clean · driven at 1440px and 390px: no horizontal
overflow, lightbox opens on both, every link in `<main>` resolves to
`/resources`, a `/projects/<slug>` page or `/projects#steel`.

---

## 34. Search: the sitemap listed half the site, and every URL on it said localhost

The user asked, before go-live: does the sitemap cover every project and
every image, and will a search for a project's name find its page without
"K.D." in the query? Audited on the built site, then fixed what was
mechanical. What the audit found:

- **Ten of twenty pages were in the sitemap.** `@astrojs/sitemap` writes
  its file from the routes it can see at build time; every page here is
  `prerender = false` (#21), so `/projects/[slug]` was one pattern to it,
  not ten URLs, and **no project page was in the sitemap at all**. The
  crawler would still have found them — every card on `/projects` and on
  the homepage links to its page, and each page has a unique `<title>`,
  meta description, canonical and an `<h1>` that is the project's name —
  but "is it in the sitemap" was a plain no.
- **Every URL said `http://localhost:4322`** — sitemap, canonical,
  `og:url` — because `PUBLIC_SITE_URL` is unset (#13). Deployed like
  that, every page would have told the crawler its canonical copy lives
  on localhost, which is the one address it cannot fetch. Nothing fails;
  the site just never ranks.
- No `robots.txt`, no structured data (docs/SEO.md planned it), no
  `og:image` anywhere (#7). Every content image does carry alt text; the
  one empty `alt` is Lightbox's own `<img>`, which has no `src` until a
  tile is clicked.

**What changed.**

- **`/sitemap.xml` is served, not generated** — `src/pages/sitemap.xml.ts`.
  Static pages come from `import.meta.glob` over `src/pages/**/*.astro`
  (keys only; `[slug]` and `/studio/*` skipped), project pages from
  `projectDetails` with the same `slugify()` the cards use, and each
  project page and the plant page lists its hero and every gallery
  photograph as `<image:image>` — at the exact rendition the page puts
  in its `<img src>` (same `getImage()` call, same sizes), so the crawler
  meets one URL, not two. 20 pages, 57 images. A new static page or a
  new project is in the sitemap by construction. The integration is
  removed (`npm uninstall @astrojs/sitemap`). No `<lastmod>`: nothing
  records when a page changed, and an invented date is acted on.
- **`/robots.txt` is served** — `src/pages/robots.txt.ts`: allow all,
  `Sitemap:` line. **Nothing disallowed, deliberately.** Not `/api/`:
  every page's head script fetches `/api/content` to paint the editor's
  saved copy, and a Googlebot render that cannot reach it indexes the
  built-in text instead of what the site now says. Not `/studio/`: it is
  already `noindex`, and a Disallow line would only announce the path.
- **`npm run build:release` refuses while `PUBLIC_SITE_URL` is unset** —
  `scripts/check-site-url.mjs`, first in the chain, before the
  placeholder gate. It wants an https origin with no path, and rejects
  localhost by name. The one loud failure for the one silent one.
- **JSON-LD on every page** — `Organization` from
  `src/data/organization.ts`, which reads the legal name, switchboard and
  LinkedIn from `home.footer` so they cannot drift; the address is the
  footer's three lines split into `PostalAddress` fields by hand. Its
  header lists what is withheld: ISO as `hasCredential` (no certificate
  numbers — PRE-LAUNCH row 2), `geo` (the Maps link is not a lat/long),
  `founder` (surname spelling is sign-off S1; a wrong spelling in the
  knowledge graph outlives the page), anything RDSO. `BreadcrumbList`
  on `/projects/<slug>` (Home › Projects › title — the nav's label, not
  the back link's "All Projects") and on `/resources/vindhane-plant`.
  The module is not on-page copy, so it is not in check-edit-keys' PAGES.
- **`og:image`** where a page has a hero photograph: home, about,
  projects, every project page, the plant page — the hero at 1551×700,
  the rendition the page already draws. `twitter:card` is
  `summary_large_image` with an image and `summary` without. The six
  InfoPage routes (capabilities, resources, HSE, clients, contact, CSR)
  have no photograph and still no card — #7 stands for them.

**What this does and does not buy.** After `PUBLIC_SITE_URL` is set, the
site deployed and the sitemap submitted in Search Console, a search for
"Sanpada Carshed" or "Matunga Workshop FOB" has a real chance of returning
the project page: the exact phrase is the `<title>`, the `<h1>`, the URL
and the breadcrumb, and the site is the only one describing the work from
the contractor's side. A search for "Panvel–Karjat railway line" will not:
MRVC, Wikipedia and the press own that phrase, and a contractor's page
ranks behind them for it, KD or no KD. That is the shape of every project
name here — the more public the project, the more the query belongs to
its owner. Nothing ranks in the first days after launch regardless.

### Verification

Built with `PUBLIC_SITE_URL=https://www.kdconstructions.net` (the mail
domain; the real origin is the client's to confirm) and served with
`node dist/server/entry.mjs`: `/sitemap.xml` 200, well-formed, 20 `<url>`
and 57 `<image:image>`; the seven image URLs it lists for
`/projects/sanpada-carshed` are exactly the seven non-logo `<img src>`
on that page, and each serves 200 `image/webp`. `/robots.txt` 200 with
the absolute Sitemap line. Both JSON-LD blocks parse; the logo URL
serves. All 20 routes 200. `check-site-url` fails on empty, on http and
on localhost, passes on an https origin. `check-edit-keys` passes on all
ten registered pages. `check-placeholders` unchanged at 10.

---

## 35. A 404 page, and a favicon — the two things the site had from the template

The user asked, 2026-09-18: is there a custom 404 page, and is the favicon
there, given the logo is. Neither was. A wrong address got Astro's bare
404 — a plain "Not found" with no nav, no footer, no way back — and every
tab on every page showed the Astro rocket, because `public/favicon.svg`
and `public/favicon.ico` were the template's own files and BaseLayout
never linked an icon at all (#7 had deferred it).

### The favicon

**Derived, not designed.** The logo is a landscape lockup — monogram,
amber rule, CONSTRUCTIONS wordmark, on mint — and none of that survives a
32px square. What does is the **monogram alone**: the "KD" with its three
amber stripes and the girder detail in the D, cut from the logo's own
pixels and set on a square of the logo's own mint (`#d9f7dd`, read off
the corner; the token is `#D7F8DD`). Nothing is drawn or recoloured. The
one number chosen is the monogram's share of the square's width, 84%,
the usual icon safe zone — letters are wider than tall, so width binds.

`scripts/build-favicon.mjs` (`npm run favicon:build`) reads
`kd_logo.jpg` at the project root — the 1536×1024 original, not the
798px copy the nav draws — finds the monogram by scanning for the first
run of non-mint rows from the top (the rule and the wordmark are the
second and third), builds one square master at source resolution and
resizes it to every output. Nothing is upscaled: the monogram is 575px
wide in the source, the largest icon is 180.

- `public/favicon.ico` — 16, 32 and 48px entries, PNG-encoded inside the
  ICO container (what Astro's own template `.ico` was, at one size).
- `public/apple-touch-icon.png` — 180px, iOS home screen and Safari.
- BaseLayout links both. `public/favicon.svg` (the rocket) is deleted;
  the site has no vector logo to put in its place. **If the client has
  the logo as SVG or AI**, an SVG favicon would be crisper at every size
  and is a five-line change — ask.

### The 404 page — `src/pages/404.astro`, copy in `src/data/not-found.ts`

Astro renders `src/pages/404.astro`, with a 404 status, for every request
its router cannot match. Confirmed against Astro 7.3's own code rather
than the docs: `App.render` sees the router's bodyless 404 (the
`X-Astro-Error` header), hands it to the error handler, which looks up
the `/404` route and renders it with `status = 404`. The dev server does
the same. Direct visits to `/404` also answer 404, set in the frontmatter,
so the address is never a 200 a crawler might keep.

**The `/studio/[key]` guarantee holds.** That page answers a wrong slug
with the router's own bodyless 404 so the response is byte-identical to
any other missing page (see its header). It still is: both go through
the same error handler to the same component, and the built site serves
the same body for `/studio/wrongslug` and `/some/missing/page` — the
only difference is the canonical URL, which echoes the requested path
either way. The page is `prerender = false` like every other page here,
which is also what that header requires (a prerendered `/404` is not in
the server manifest and `Astro.rewrite("/404")` throws).

**Shape: two bands.** nav (ink) → hero (ink: kicker, H1, one sentence,
one primary button) → footer (ink-deep). Exactly InfoPage's hero with
the CTA band's button inside it, the way `/resources/vindhane-plant`
keeps its button inside its last band (#33): a centred CTA band after
the hero would be ink on ink. Left-aligned; the centred kicker is for a
band centred end to end. The hero is `min-h-screen` with its content
centred vertically — `/studio/[key]`'s treatment for a single-purpose
page — because otherwise four lines of hero end a third of the way down
a desktop viewport, the footer follows, and the document's ink ground
shows below it as a third, empty band. Padding is still the hero's
`pt-144 pb-80`, so the H1 clears the fixed nav and a short viewport reads
as flow. Recorded in DESIGN-SYSTEM.md §2.

**Copy is authored, not sourced.** Nothing in `K.D.Website_Details.md`
or the docs covers an error page. Kicker "Error 404", H1 "That page is
not here.", one sentence saying the address may be mistyped or the link
stale and that everything is reachable from the nav, button "Back to the
homepage". Written in the site's voice, and the client's to change — a
sign-off row in PRE-LAUNCH.md (S5).

**Not in-page editable, on purpose.** The editor files an edit under the
URL in the address bar, and on a 404 that is the address that *failed* —
`/nonsense`, not `/404` — so an edit made on the 404 page would be saved
under a path that is not a page and painted nowhere. `/404` is therefore
**not** in `KNOWN_PATHS` (`src/lib/editable.ts`): the server refuses the
save rather than accepting it into a void. The copy still lives in a
module with every text node keyed (`not-found.*`), because those are
house rules and the gates check them; change the words in
`src/data/not-found.ts`.

**Registered** in `scripts/check-edit-keys.mjs` (`/404`) and
`scripts/check-placeholders.mjs`. **Excluded** from the sitemap by name
in `src/pages/sitemap.xml.ts` — `import.meta.glob` would otherwise have
listed it as a page. `noindex`.

### Verification

`npm run build` clean. Built server: `/some/missing/page` 404
`text/html` with the page's title, nav, footer and `noindex`; `/404` 404;
`/studio/wrongslug` 404 with the same body as `/some/missing/page` (diffed
with the path masked). `/favicon.ico` 200 `image/vnd.microsoft.icon`,
three entries confirmed by reading the directory; `/apple-touch-icon.png`
200; `/favicon.svg` 404; both `<link>`s in the head of `/`. Sitemap still
20 URLs, none of them `/404`. `check-edit-keys` on `/404`: 49 slots, all
unique, all leaves, all 49 copy strings verbatim, no orphans.
`check-placeholders` unchanged at 10. Screenshots at 1440 and 390 wide.

---

## 36. A page for every "Beyond the railway" project

The user (2026-09-19), pointing at the eight tiles of the Beyond the railway
band on `/projects`: *"I need a project page for each of these. As for the
info, add any info you need from the md files; if not available fill with
to be added."*

That reverses #30's "no tile links anywhere: there is no page to link to",
and it is the #32 policy applied to a new place: the page exists now, with
every fact nobody has supplied drawn as a visible placeholder, and the
release gate refuses to ship while one remains.

### What the .md files hold for these eight — searched 2026-09-19

`K.D.Website_Details.md` §Further Projects, `KD_INFO.md` §7.12–7.13,
`WEBSITE_INFO.md`, `CONTENT.md`, `PHOTOS.md`, `ASSETS.md`, all of `docs/`,
and this file. For every one: a name, a location, a folder of photographs
(six of eight), and the 2026-08-18 confirmation (seven of eight). No client,
scope or year anywhere. The one source with more is the **Company Profile
deck** that #28b read and logged here, slide 10:

- **"The Bonkode Skywalk"** — *"72×3 m eco-friendly skywalk on the
  Thane–Belapur highway, connecting Bonkode village to the TTC Industrial
  belt."* The slide's first two captions are swapped (this text sits under
  "Premium Clubhouse", the clubhouse text under "The Bonkode Skywalk"); the
  photographs under each heading settle which is which.
- **"Premium Clubhouse"** — *"Kharghar Golf Course Club House showcases
  modern with premium finishing and beautifully landscaped surroundings."*
- **"Healthcare Facility"** — *"CIDCO Urban Health Centre features 20,000
  sq.ft area with fire systems and stack parking, completed within
  stipulated timelines."* **Its photograph is `Ulwa Hospital/1.jpg`** — the
  building on the Ulwe Hospital tile, same curved parapet, same gate. #28b
  had matched this card to Karanjade Health Care by name; the picture puts
  it on Ulwe Hospital, so that is where the facts went.
- Slide 11's **Lush Meadows** line is a sales pitch for the flats ("Escape
  the city's noise…") and says nothing a contractor would; not used. Slide
  11 also shows **"Nesting Tree – Dhruva & Others"**, a G+4 building that
  is on no page of this site — see below.

These went onto the pages (and into `K.D.Website_Details.md` first, which
stays the source of truth) as **sign-off rows**, not placeholders: they are
the company's own words, but from a deck, not the approved brief.
`PRE-LAUNCH.md` S6–S7. "Eco-friendly" was dropped, #28b's call on "some of
the biggest in India": nothing says what makes it so.

### What was built

- **`src/data/social-projects.ts`** — the eight pages' copy, keyed by the
  same `slugify()` of the title the tiles link with. Title, location, hero
  frame and alt text are the tile's own (`projects.social.items`); the
  gallery is the project's group in `gallery.ts`; the chrome is shared. It
  imports no images, so both Node gates load it. It **throws** if a tile
  has no entry, because a tile linking to a page that does not exist is a
  broken link.
- **Four fact tiles on every page**, the plant page's hero grid (#33) —
  **Client · size · Scope of works · Year completed**, always in that
  order, each a figure where one is on record and a `pending` tile saying
  what K.D. must supply where not. No contract value is asked for: values
  are dropped site-wide (KD_INFO §7.1). What is on record: Bonkode's
  72 × 3 m; Ulwe Hospital's client (CIDCO) and 20,000 sq ft.
- **The two unphotographed projects** get a plain ink hero and a "Photograph
  to be added" tile where the gallery's first photograph would sit. The
  **Centre of Excellence** also carries a "To be confirmed" card above
  everything else, and **no paragraph at all** — the page claims nothing
  the company has not confirmed.
- **Galleries** — each project's photographs became a group in
  `gallery.ts`, appended after Sanpada so no key on `/projects` moves. That
  is the one place a project's photographs are defined, so they now also
  appear on the **Gallery tab**, each group heading linking to its page.
  Six new frames cut by `build-gallery.mjs`: three more of Bonkode, the
  clean upper part of the two collages (school, clubhouse) above their
  inset thumbnails, and the fairway. Ulwe Hospital, Karanjade and Lush
  Meadows have one usable frame each, so their galleries are one tile.
- **Left out:** `AX6A7054` (a hoarding with a model's face fills a third of
  it), `AX6A7071` (`AX6A7070` a second later), `WHITE HOUSE FOB X.jpg` (see
  below), `Ulwa Hospital/ULWE HOSPITAL.jpg` (it shows the Karanjade
  building — #30), the Instagram collages and the 357 px exports.
- **`/projects/[slug]` now serves two kinds of page.** The railway template
  moved unchanged into `components/projects/ProjectDetailPage.astro`; the
  new one is `components/projects/SocialProjectPage.astro`; the route
  resolves the slug and renders one. All ten railway pages were diffed
  before and after: identical but for a trailing newline. `detailChrome`
  moved to `src/data/detail-chrome.ts` (import-free, so the Node-loaded
  module can share it) and is re-exported from `project-detail.ts`, so
  nothing that imported it changed.
- **The tiles link.** `Social.astro`'s tiles take the listing cards'
  stretched `<a>`; the Lightbox they used to open is gone from the band
  (the photographs open from each page's gallery and the Gallery tab).
- **Gates.** `check-edit-keys.mjs` registers one route per slug from the
  module (a `pick` field selects the page from the keyed export), so these
  eight pages are gated — the railway pages still are not.
  `check-placeholders.mjs` gained an `each` row that gives every page its
  own route. The sitemap lists the eight pages and their photographs. Not
  added to `KNOWN_PATHS`: no `/projects/<slug>` page is in-page editable,
  and these follow the railway pages.

### Band order

Same as the railway project pages: nav (ink) → hero (ink, + image where
there is one) → overview with gallery (white) → centred CTA (ink) → footer
(ink-deep). DESIGN-SYSTEM §2.

### Things that need an eye

- **32 new placeholders** — 42 on the site. That is what "fill with to be
  added" comes to when four facts are asked of eight projects and almost
  none is on record. The ask to K.D. is short, though: client, size, scope
  and year for each, one line apiece (docs/ASK.md already asked it once),
  plus the stadium's photograph and the Centre of Excellence yes/no.
  `PRE-LAUNCH.md` 5a–5h, one row per page.
- **Ulwe Hospital or Karanjade — which building is which?** The facts
  follow the photograph (S7). If the company says the CIDCO urban health
  centre is the Karanjade building, the two tiles' photographs, the two
  pages' facts and the two `social-*.jpg` files all swap together.
- **The Matunga Workshop FOB stand-in is still a Bonkode photograph** (#30's
  open point). `WHITE HOUSE FOB X.jpg` — the best side-on frame of the
  skywalk — was kept off the Bonkode page because its twin is that
  stand-in; with a Bonkode page one click away, the swap #30 suggested (a
  Harbour Line FOB frame for the Matunga card) is now more pressing. Not
  made here: it changes a railway page the user did not ask about.
- **Nesting Tree – Dhruva & Others** (Company Profile slide 11: "a premium
  G+4 building featuring high-end amenities") is a ninth non-railway project
  with a photograph in the deck and no mention in the brief or the
  confirmation session. Not added. One question closes it.
- **Only the CoE is unconfirmed**, yet it now has a full page. It is
  review-only by construction: its "To be confirmed" card fails the
  release gate like every other placeholder.

### Verification

`npm run build` clean · `check-edit-keys` passes on all eight new routes
(69–74 keys each), `/projects` (226), `/resources/vindhane-plant` and `/` ·
`check-placeholders` lists 42 (the 10 before, 32 new) and exits 1 · CLS
worst 0.0125 on the new pages, 0.0058 on `/projects` · every tile link
answers 200, a tile click lands on its page, the lightbox opens on a
detail page and steps through its own group, the Gallery tab shows 12
groups, an unknown slug still 302s to `/projects` · no horizontal overflow
at 390 px · sitemap 20 → 28 pages, 57 → 75 images.
