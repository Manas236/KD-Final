# DESIGN — Brand & Visual Direction

The visual system for the K.D. Constructions website: a **premium industrial aesthetic**.

**Extracted from:** `Recommended Website Structure for K.docx` (the only source document with design direction)
**Content this design carries:** [CONTENT.md](CONTENT.md) · **Facts:** [KD_INFO.md](KD_INFO.md)
**Last updated:** 2026-08-18

> **Revision 3 — 2026-08-18.** The approved document does not specify design, but it changes what the
> design has to hold: a **third project status** (Recently Awarded), a **quantities stat strip** on every
> project page, a **certification badge row**, **five** verticals instead of four, and a corrected
> leadership order. Component notes updated at the foot of this file.

---

## Direction

> "For K.D. Constructions, I recommend a premium industrial aesthetic."

The design has to carry the same register as the copy in [CONTENT.md](CONTENT.md) — restrained, weighty,
confident without shouting. Deep navy does the gravity; construction orange does the emphasis, sparingly.
Photography does the persuading.

**The approved copy is more technical than the earlier drafts**: 27,090 m³ of RCC, 704.88 MT of steel,
44.5 m spans, 350 → 575 bogies per month. The design's job is to make those numbers legible and
impressive rather than burying them in paragraphs. Numbers are the proof on this site; treat them as a
first-class component, not as inline text.

---

## Palette

| Role | Colour | Hex | Notes |
| --- | --- | --- | --- |
| Primary | Deep Navy Blue | `#0B2C52` | Headers, hero overlays, footer, section grounds |
| Accent | Construction Orange | `#F28C28` | CTAs, active states, counters, timeline markers, rules |
| Neutral | White | `#FFFFFF` | Primary page background |
| Neutral | Light Gray | *(unspecified)* | Section alternation, card grounds, borders |

> 🟡 The source specifies "Light Gray" without a hex value. A neutral cool gray in the `#F4F6F8` /
> `#E8ECF0` range sits correctly against `#0B2C52` — confirm or pick during the design pass.

### Accessibility check

- `#0B2C52` on white → **12.9:1** — passes AAA for all text sizes.
- White on `#0B2C52` → **12.9:1** — passes AAA. Safe for hero overlays and the footer.
- `#F28C28` on white → **2.3:1** — **fails WCAG AA for body text.** Use orange for large display text
  (24px+ bold), fills, icons and borders only. For orange CTAs, put **navy or near-black text on the
  orange fill** (`#0B2C52` on `#F28C28` ≈ 5.6:1, passes AA), never white.
- `#F28C28` on `#0B2C52` → **5.6:1** — passes AA. Good for accent text on dark sections.

### Suggested Tailwind v4 tokens

```css
@theme {
  --color-kd-navy: #0b2c52;
  --color-kd-navy-deep: #071d38;
  --color-kd-orange: #f28c28;
  --color-kd-orange-dark: #d4761a;
  --color-kd-gray: #f4f6f8;
  --color-kd-gray-mid: #e8ecf0;
  --color-kd-gray-border: #d3dae2;
}
```

---

## Typography

| Use | Typeface | Source |
| --- | --- | --- |
| Headings | **Montserrat** or **Poppins** | Specified |
| Body | **Inter** | Specified |

**Recommendation:** Montserrat for headings. Its wider, geometric capitals read as infrastructure-grade at
large display sizes; Poppins skews friendlier and lighter, which pulls against the tone of the approved
copy.

**Add a tabular-figures rule.** The approved content is dense with aligned numerals — quantity strips,
counter rows, project tables. Set `font-variant-numeric: tabular-nums` on every numeric component so
columns line up and counters do not jitter while animating.

---

## Photography

> "Large, high-resolution images of railway projects, bridges, fabrication facilities, and heavy machinery"

| Subject | Used for | Have it? |
| --- | --- | --- |
| Railway projects | Hero, project pages, railway service pages | ✅ Matunga Workshop (97 images) |
| Bridges / FOBs | Homepage hero, FOB project pages | ✅ Vashi FOB (15 + RAW) — the strongest set |
| Stations | Nhava Sheva & Uran, Harbour Line, Panvel–Karjat | 🟡 13 images for two stations; nothing for the other six |
| Fabrication facilities | Vindhane plant page, capability sections | ⬜ **none** |
| RMC plant | Integrated resources | ⬜ **none** |
| Heavy machinery | Equipment fleet catalogue, Why K.D. | ⬜ **none** |
| Safety / people | HSE page | ✅ 51 images, Mankhurd |
| Directors | Leadership page | 🟡 ~300 px crops from the approved slide — placeholder only |

The homepage hero is specified as a **full-screen railway bridge photo or video**. Two viable candidates
exist: the **Vashi FOB** set (a steel truss FOB spanning live tracks — exactly the specified subject) and
the **Vande Bharat trainset inside Matunga Workshop** at 6000×4000.

> ⬜ **Six of the ten approved projects have no photography at all**, and neither plant has been
> photographed. The gap moved rather than closed with revision 3 — see [ASSETS.md](ASSETS.md#coverage-against-the-approved-portfolio).

---

## Motion

| Effect | Applies to |
| --- | --- |
| Smooth scroll effects | Global |
| Animated counters | Homepage statistics, Impact page, **project quantity strips** |
| Project reveal transitions | Projects gallery, featured projects |
| Interactive timelines | Our History — the three-chapter timeline |
| **Progress meters** | **Live project completion — 90%+ and 60%+** |

Honour `prefers-reduced-motion` on all of them. Counters render their final value immediately when motion
is reduced, never stay at zero; progress meters render filled, not empty.

---

## Competitor benchmarks

| Company | Study it for |
| --- | --- |
| **Larsen & Toubro** | Overall structure and corporate presence |
| **Afcons Infrastructure** | Project presentation and railway expertise |
| **Bechtel** | Modern layout and case-study storytelling |
| **Tata Projects** | Service organization and professional engineering branding |

> The stated goal: "a world-class corporate website that reflects K.D. Constructions' 53-year legacy and
> positions it alongside leading EPC companies."

**Afcons is the reference for the leadership page.** The approved document points directly at
[afcons.com/management](https://afcons.com/management) as the layout to match: portrait, full name, formal
designation, and a 150–250 word biography per person. We have four names, four one-line remits, and only
placeholder-grade portraits — so the layout is decided and the content is not. See
[NEEDED §12–13](NEEDED.md).

**Afcons is also the positioning foil.** Afcons leads with *scale and global footprint*; K.D.'s counter is
*regional trust + full-spectrum EPC + owned resources*. Build it as a homepage two-column "What we have /
What India needs" strip, with the right-hand column visibly labelled as industry research rather than
company claim. Source: [KD_INFO §12](KD_INFO.md#12-strategic-position).

> **Sharpened by the approved document.** The left column is materially stronger than it was: five
> engineering verticals including signalling & telecom, two owned plants, 50+ owned units, three ISO
> certifications, and demonstrated delivery inside live railway environments. That is a real
> differentiation argument now, not a consolation one.

---

## Component notes

| Component | Requirements |
| --- | --- |
| Hero | Full-viewport media, navy overlay for text contrast, single primary CTA |
| Stat counter row | 4–7 tiles, animated on scroll into view, orange numerals on white or navy, tabular figures |
| **Quantity strip** ★ | **New.** Per project: RCC m³ · steel MT · earthwork m³ · span m · track m. Compact, monospaced-numeral row directly beneath the project hero. This is the approved content's strongest asset — give it prominence, not a footnote |
| Project card | Image, name, client, scope chips, **status badge**, quantity highlight. **Value is optional** — six of ten projects have no approved ₹ figure, so the card must look complete without it |
| **Progress meter** ★ | **New.** Live projects carry a completion percentage (90%+, 60%+). Show the figure with an "as of" date beside it — the number will go stale |
| **Certification badge row** ★ | **New.** ISO 9001:2015 · 14001:2015 · 45001:2018 · Chamber of Railway Industries. Footer and About page. Monochrome marks on light gray; hold until the certificate marks arrive |
| Timeline | Three chapters, expandable; compact node rail for mobile |
| Vertical grid | **Five** engineering verticals, not four — check the grid maths (a 5-up row breaks awkwardly; 3+2 or a 5-column scroller both work) |
| Equipment catalogue | Filterable by category, count badge per category. **Do not show a computed total** — the itemisation sums to 27+ against an approved 50+ |
| Director card | Portrait, name, role, one-line remit. Order: Kailash · Sarita · Mohanlal · Shiv |
| Client logo strip | Monochrome logos on light gray, colour on hover. **Ten clients now, not six** — check the strip holds ten without shrinking them into illegibility |
| Section divider | Thin orange rule — the accent's most frequent job |

### Status badge colours

Three states now, not two:

- **Delivered** — navy on light gray
- **Live** — white on orange, with a pulse dot and the completion percentage
- **Recently Awarded** ★ — outline only, navy border and text, no fill. Visually quieter than Delivered on
  purpose: these projects are contracted, not built, and the design should not let a reader confuse the two.

---

## Related documents

- [KD_INFO.md](KD_INFO.md) — **source of truth** for every fact
- [STRUCTURE.md](STRUCTURE.md) — what each page contains
- [CONTENT.md](CONTENT.md) — the copy this design carries
- [ASSETS.md](ASSETS.md) — what photography exists
- [SEO.md](SEO.md) — metadata and content strategy
