# STRUCTURE — Sitemap & Page Architecture

The canonical site map for the K.D. Constructions website.

**Primary source (approved):** `K.D.Website_Details.docx` — approved 2026-08-18. It defines the *content
architecture*: About → History → Vision/Mission/Philosophy → Business Verticals → Projects → CSR → Leadership.
**Structure sources:** `KD Construction website structure.docx` (**Doc A**), `Recommended Website Structure for K.docx` (**Doc B**), `structure of KD Construction.docx` (**Doc C**)
**Facts referenced here live in:** [KD_INFO.md](KD_INFO.md)
**Last updated:** 2026-08-18

> ### Revision 3 — 2026-08-18 · structural consequences of the approved document
>
> The approved doc does not propose a sitemap, but it changes what has to be *in* one:
>
> 1. **Services grows to five engineering verticals** — Signalling & Telecommunication is new and needs
>    its own page. "Mechanical Works" is renamed **Mechanical Engineering**.
> 2. **Projects roughly doubles** — from 5 case studies to **8 delivered/live + 2 awarded**, with three
>    more named but undescribed. The Projects section is now the largest part of the build by a wide margin.
> 3. **`/projects/matunga-z-bridge` becomes `/projects/matunga-workshop-fob`** — pending a naming
>    confirmation, see [KD_INFO §7.2](KD_INFO.md).
> 4. **A "Recently Awarded" status** joins Delivered and Live.
> 5. **Certifications** (ISO 9001/14001/45001 + Rail Chamber) are now real content — they belong on
>    About, HSE, the footer and any tender-facing page.
> 6. **The Metro gallery filter is dead** — no metro project exists.
> 7. **Vision/Mission/Philosophy and Leadership are settled** — approved copy exists for both.

---

## How the source documents relate

| Document | Character | Unique contribution |
| --- | --- | --- |
| **The approved doc** | Company-approved content, ~8 sections | **All facts and all approved prose.** Not a sitemap |
| **Doc A** — *KD Construction website structure* | Deliverable scope, 20–30 pages | Per-section deliverable detail; CMS-ready content spec |
| **Doc B** — *Recommended Website Structure* | Condensed recommendation | **Design direction and competitor benchmarks** (→ [DESIGN.md](DESIGN.md)) |
| **Doc C** — *structure of KD Construction* | Fullest structure | **Word-count targets**, Industries page, SEO framework, blog library (→ [SEO.md](SEO.md)) |

**Reconciliation rule:** Docs A–C set the page inventory; the approved doc sets what goes on the pages and
overrides A–C wherever they disagree about content.

**Total scope: ~22–32 pages, approx. 34,000 words** — up from 32,000, because Projects gained five entries
and Services gained one.

---

## Sitemap

```
/
├── /about
│   ├── /about/journey                       ← "Our History — Three Chapters. One Legacy."
│   ├── /about/leadership                    ← "The Stewards of the Vision."
│   └── /about/why-kd
├── /services                                ← "Business Verticals"
│   ├── /services/civil-engineering
│   ├── /services/track-engineering
│   ├── /services/electrical-engineering
│   ├── /services/mechanical-engineering
│   ├── /services/signalling-telecommunication      ★ NEW
│   ├── /services/railway-infrastructure
│   ├── /services/epc-contracting
│   ├── /services/structural-engineering
│   ├── /services/design-and-build
│   └── /services/turnkey-projects
├── /projects
│   ├── /projects/matunga-workshop-fob              ★ renamed from matunga-z-bridge
│   ├── /projects/sanpada-carshed
│   ├── /projects/matunga-workshop
│   ├── /projects/matunga-lhb-facility              ★ NEW
│   ├── /projects/nhava-sheva-uran-stations         ★ NEW
│   ├── /projects/harbour-line-fobs                 ★ NEW
│   ├── /projects/panvel-karjat-corridor            ★ renamed, LIVE
│   ├── /projects/harbour-line-redevelopment        ← LIVE
│   ├── /projects/solapur-vande-bharat-depot        ★ NEW — awarded
│   └── /projects/lower-parel-redevelopment         ★ NEW — awarded
├── /industries
├── /equipment
├── /fabrication-plant
├── /rmc-plant                                      ★ NEW (or a section of /fabrication-plant)
├── /hse
├── /certifications                                 ★ NEW (or a section of /about and /hse)
├── /sustainability
├── /csr                                            ⚠️ may be deleted
├── /clients
├── /impact
├── /careers
├── /news
│   └── /news/[slug]
└── /contact
```

> **Two judgement calls above, both reversible:**
>
> - **`/rmc-plant`** — the RMC plant is now confirmed and owned, and the approved doc gives it equal
>   billing with the fabrication plant under "Integrated Manufacturing & Resources". One paragraph is not
>   a page, though. **Recommendation:** build one page, `/capabilities` or an extended
>   `/fabrication-plant`, covering fabrication + RMC + equipment as the integrated resource story, and
>   split later if the company supplies plant detail.
> - **`/certifications`** — three ISO standards and a Rail Chamber membership do not fill a page either,
>   but tender evaluators look for them explicitly. **Recommendation:** a certifications *block* on
>   `/about` and `/hse` plus a footer badge row now; a standalone page once certificate numbers and PDFs
>   arrive.

### Page inventory

| # | Page | Route | Words | Copy status |
| --- | --- | --- | --- | --- |
| 1 | Home | `/` | 2,500 | Assemble from approved blocks |
| 2 | About Us | `/about` | 2,000 | ★ **complete** |
| 3 | Our History | `/about/journey` | 1,500 | ★ **complete** |
| 4 | Leadership | `/about/leadership` | 2,000 | ★ names/remits complete; ⬜ bios and portraits |
| 5 | Why K.D. Constructions | `/about/why-kd` | 1,500 | ★ "What we have" complete; 🌐 right column needs sources |
| 6 | Business Verticals (hub + 10 children) | `/services` | 3,500 | ★ 5 verticals + 3 resources complete; 🟡 5 legacy child pages unwritten |
| 7 | Projects (hub + 10 pages) | `/projects` | 10,000 | ★ 10 project descriptions complete; ⬜ challenges, methodology, timelines |
| 8 | Industries | `/industries` | 1,200 | ⬜ no copy |
| 9 | Equipment Fleet | `/equipment` | 1,200 | ★ intro complete; 🟡 category counts stale |
| 10 | Fabrication / Resources | `/fabrication-plant` | 1,500 | ★ complete for both plants; ⬜ plant detail |
| 11 | HSE | `/hse` | 1,500 | ✅ four pillars + ★ certifications; ⬜ statistics, training |
| 12 | CSR | `/csr` | 1,500 | ⚠️ skeleton — may be deleted |
| 13 | Sustainability | `/sustainability` | 1,500 | ★ ISO 14001 anchor; 🌐 rest needs Phase 2 |
| 14 | Clients | `/clients` | — | ★ 10 clients named; ⬜ logos |
| 15 | Impact | `/impact` | 1,000 | ★ engineering counters; 🟡 financial chart blocked |
| 16 | Careers | `/careers` | 1,000 | ⬜ entirely unsupplied |
| 17 | News & Media | `/news` | — | ⬜ no articles |
| 18 | Contact | `/contact` | — | ✅ complete |

---

## Page-by-page section breakdown

### 1. Home — `/` · ~2,500 words

| Order | Section | Content source |
| --- | --- | --- |
| 1 | Hero — full-screen railway/FOB photo or video, *"Building Excellence Since 1973"* | KD_INFO §1 |
| 2 | Company introduction — the approved opening paragraph | ★ CONTENT About |
| 3 | Key statistics / animated counters — **50+ years · ₹220 Cr · 50+ units · 3 ISO standards** | KD_INFO §11 |
| 4 | Business verticals — **five**, plus the integrated delivery model strip | KD_INFO §4 |
| 5 | Featured projects — pick 4 of the 8 delivered/live | KD_INFO §7 |
| 6 | Live projects strip — Panvel–Karjat 90%+, Harbour Line 60%+ | KD_INFO §7.8–7.9 |
| 7 | Why K.D. — "What we have / What India needs" two-column callout | KD_INFO §12 |
| 8 | Founding Director's message | 🟡 **text does not exist** — KD_INFO §3 |
| 9 | Integrated resources teaser — fabrication plant · RMC plant · 50+ units | KD_INFO §4.6–4.8 |
| 10 | Safety & certifications — HSE + the three ISO marks | KD_INFO §8 |
| 11 | Client logos | ⬜ **logos missing** — KD_INFO §6 |
| 12 | Vision 2030 | KD_INFO §13 |
| 13 | Contact CTA | KD_INFO §1 |

> **Changed from rev 2:** the counter row leads with certifications instead of revenue growth (the growth
> series is unpublishable); the "Chairman's message" is reframed as a **Founding Director's message** now
> that Kailash S. Gindodia is confirmed in that role; a live-projects strip is added, since two named
> projects now carry credible completion percentages.

### 2. About Us — `/about` · ~2,000 words

Sections, in the approved document's own order:

Company overview ★ · At a glance ★ · Our History (summary, links to `/about/journey`) ★ ·
Vision ★ · Mission ★ · Philosophy + four commitments ★ · Certifications & association ★ · Leadership
(summary, links to `/about/leadership`) ★

> ✅ **This page is fully unblocked.** Every block has approved copy. It is the first page that can be
> built and shipped end to end.

### 3. Our History — `/about/journey` · ~1,500 words

Interactive timeline on the approved three chapters — 1973 Origin · 2004 Formalization · 2017–present
The Modern Era — opening on *"Three Chapters. One Legacy."* and closing on *"Five decades behind us. A
legacy beneath us. The next horizon before us."*

Compact node rail: `1973 → Partnership Firm → Private Limited → Railway Infrastructure → Corporate
Expansion → Vision 2030`

> 🟡 Keep the Vashi HQ **out** of the timeline until the company gives a year — the approved chapters do
> not place it in any chapter.

### 4. Leadership — `/about/leadership` · ~2,000 words

Headline **"The Stewards of the Vision."**, sub-line *"Guided at the helm. Growing with every step."*

Four directors in the approved slide order: **Kailash S. Gindodia (Founding Director)** · Sarita K.
Gindodia · Mohanlal S. Gindodia · **Shiv K. Gindodia (inducted 2017)**.

> ⚠️ Kailash and Mohanlal's roles were previously recorded the wrong way round — see
> [KD_INFO §3](KD_INFO.md#3-leadership--corrected). Build from the corrected table.
>
> Layout follows [afcons.com/management](https://afcons.com/management) per DESIGN.md. ⬜ Portraits and
> 150–250-word biographies are still missing; the slide's ~300 px circular crops are placeholder grade.

### 5. Why K.D. Constructions — `/about/why-kd` · ~1,500 words

Two-column: **What we have ★** (legacy · full-spectrum EPC · integrated resources · ISO certifications ·
live-railway delivery) against **What India needs 🌐** (NIP/GatiShakti · PPP · CAGR · smart-city standards),
with the right column visibly labelled as industry research.

### 6. Business Verticals — `/services` · ~3,500 words

Hub page opens with the approved integrated-EPC intro and closes with the **One Integrated Delivery
Model** strip.

**Engineering — five verticals (all ★ approved copy):**

| Child page | Route | Copy status |
| --- | --- | --- |
| Civil Engineering | `/services/civil-engineering` | ★ approved paragraph |
| Track Engineering | `/services/track-engineering` | ★ approved paragraph + P-Way/BG-track evidence |
| Electrical Engineering | `/services/electrical-engineering` | ★ approved paragraph + 6,000 kVA evidence |
| Mechanical Engineering | `/services/mechanical-engineering` | ★ approved paragraph + OEM/DLP capability |
| **Signalling & Telecommunication** | `/services/signalling-telecommunication` | ★ **new** — approved paragraph incl. Kavach |

**Integrated Manufacturing & Resources (all ★):** Steel Fabrication · Ready-Mix Concrete · Heavy Equipment
& Machinery. Present as capabilities on the hub, linking to `/fabrication-plant` and `/equipment` — not as
verticals.

**Legacy child pages from Docs A–C, still unwritten 🟡:** EPC Contracting · Railway Infrastructure ·
Structural Engineering · Design & Build · Turnkey Projects.

> **Recommendation:** ship the five approved verticals first and treat the five legacy pages as phase 2.
> "Railway Infrastructure" is named as a core capability in the approved doc and is the strongest
> candidate of the five — the rest risk becoming thin, keyword-shaped pages with no company content
> behind them.
>
> ⚠️ `/services/electrical-works` and `/services/mechanical-works` from rev 2 are renamed above to match
> the approved vertical names. If either route has already shipped, redirect rather than break it.

### 7. Projects — `/projects` · ~10,000 words

Hub: searchable/filterable gallery.

**Revised filters** — the approved portfolio, not Docs B/C's guesses:
**Stations · Bridges & FOBs · Workshops & Depots · Corridors · Live · Recently Awarded**

> 🗑️ **Drop the "Metro" filter.** There is no metro project. "Buildings" is also weak now — the
> approved portfolio is railway-led, and the non-railway work (golf course, football stadium, centre of
> excellence) is named but undescribed.

**Case-study template** — unchanged, but the approved doc fills more of it than before:

| Block | Status |
| --- | --- |
| Project Overview | ★ approved paragraph for all 10 |
| Client | ★ all 10 |
| Scope of Work | ★ all 10 |
| **Key quantities** | ★ **new block** — RCC m³, steel MT, earthwork m³, spans, track m. This is the strongest evidence on the site; give it a dedicated stat strip |
| Engineering Challenges | 🟡 not in any document — needs interviews |
| Construction Methodology | 🟡 partly answered ★ (box-pushing beneath live OHE; truss vs plate-girder FOB launching) — the rest needs interviews |
| Timeline | ⬜ dates in no document |
| Outcomes / Impact | ★ for most |
| Gallery | ⬜ photography missing for 6 of 10 |

**Status badges:** Delivered · **Live** (with %) · **Recently Awarded**.

### 8. Industries — `/industries` · ~1,200 words

Build on the four evidenced rows: **Railways · Government & public sector · Urban infrastructure ·
Sports & recreational / institutional** (the three Kharghar projects). Ports and education are named
via JNPT and Balbharati but have no project behind them yet. See [KD_INFO §15](KD_INFO.md#15-industries-served).

### 9. Equipment Fleet — `/equipment` · ~1,200 words

Approved intro + category catalogue. **50+ units** is the headline figure.

> 🟡 The per-category itemisation sums to 27+. Present categories **without** implying the list is
> exhaustive, or get refreshed counts first.

### 10. Fabrication & Integrated Resources — `/fabrication-plant` · ~1,500 words

Vindhane steel fabrication ★ · **RMC plant, Karjat ★** · heavy equipment ★ · the integrated delivery model ★.
Demonstrated fabrication tonnage per project is the strongest available proof: 704.88 MT · 1,412 MT ·
1,816 MT · 3,046 MT · 4,686 MT.

> ⬜ Plant capacity, area, machinery and workforce still missing for both plants.
> 🟡 RDSO certification "in progress" is **not** in the approved doc. Confirm before using, and never
> imply certification is held.

### 11. HSE — `/hse` · ~1,500 words

Safety culture ★ · four pillars ✅ · **certifications ★** · environmental protection ✅ · training ⬜ ·
statistics ⬜.

> The three ISO standards transform this page from assertion to evidence. Lead with them.

### 12. CSR — `/csr` · ~1,500 words ⚠️

The approved doc carries the CSR skeleton **with the writer's "not final copy" note still attached** — the
gap is confirmed for a third time, not closed.

> **Plan for this page to be deleted.** Unless the company returns real CSR activity, drop `/csr` and fold
> the worker-welfare and environmental material into `/hse`, where it is already true. Never ship a
> `[To be added]` bullet, and do not present paid contracts as philanthropy.

### 13. Sustainability — `/sustainability` · ~1,500 words

- **From the company ★:** ISO 14001:2015 certified environmental management · "sustainable infrastructure"
  in the approved vision · HSE environmental stewardship practices
- **Research-backed, clearly labelled 🌐:** ESG · green construction · carbon reduction · sustainable
  materials · rainwater harvesting · BIM-enabled construction

### 14. Clients — `/clients`

Ten named clients ★ — Indian Railways · Central Railway · Western Railway · MRVC · CIDCO · NMMC · JNPT ·
Balbharati · COFMOW · Maharashtra PWD. ⬜ Logos and display permission.

### 15. Impact — `/impact` · ~1,000 words

Lead with **engineering scale** (RCC, steel, earthwork, spans, corridor km) rather than financials — the
approved doc supplies the former in detail and confirms only two points of the latter.

> ⚠️ No revenue chart until [KD_INFO §10](KD_INFO.md#10-financial-performance) is resolved.

### 16. Careers — `/careers` · ~1,000 words

⬜ Entirely unsupplied. Doc A: any employment information not supplied must be marked as suggested content.

### 17. News & Media — `/news`

⬜ No articles. Build the collection and route anyway — see [SEO.md](SEO.md).

### 18. Contact — `/contact`

Contact form · office location · map embed · business / career / tender enquiry CTAs.
✅ Address, phones, emails and map link received. 🟡 Exact lat/long; enquiry routing labels.

---

## Recommended navigation

**Primary nav:** About · Services · Projects · Equipment · HSE · Careers · Contact

**Mega-menu contents**

- **About** → Our History · Leadership · Why K.D. · Certifications · Impact · Clients
- **Services** → the five engineering verticals, then Integrated Resources (Fabrication · RMC · Equipment)
- **Projects** → Signature (6) · Live (2) · Recently Awarded (2) · Full gallery · Industries

**Utility / footer:** Fabrication & RMC · Sustainability · CSR *(if it survives)* · News & Media ·
Tender Enquiries · Vendor Registration · **ISO 9001 / 14001 / 45001 badges** · Rail Chamber membership

---

## Content model (Astro)

| Collection | Powers | Entries |
| --- | --- | --- |
| `projects` | `/projects/[slug]`, homepage featured, gallery filters | **10** *(was 5)* |
| `services` | `/services/[slug]`, homepage verticals | **5 approved** + 5 legacy 🟡 |
| `directors` | `/about/leadership` | 4 |
| `equipment` | `/equipment` catalogue | 6–7 categories |
| `timeline` | `/about/journey` | 3 chapters |
| `clients` | `/clients`, homepage logo strip | **10** *(was 6)* |
| `certifications` | About, HSE, footer badges | **3 + 1 membership** ★ new |
| `news` | `/news/[slug]` | 0 so far |
| `stats` | Counter rows on `/`, `/impact` | ~8 |

Suggested `projects` frontmatter, shaped by what the approved doc actually supplies:

```ts
{
  title, slug, client: string[], status: 'delivered' | 'live' | 'awarded',
  progress?: number,          // 90, 60
  programme?: string,         // 'MUTP-III', 'Nerul–Belapur–Seawood–Uran'
  quantities?: {              // the approved doc's strongest content
    rccM3?: number, steelMT?: number, earthworkM3?: number,
    trackM?: number, spanM?: string, areaM2?: number,
  },
  valueCr?: number,           // 🟡 earlier docs only — render only if present
  disciplines: string[],      // civil, mechanical, electrical, s&t, track
}
```

> Make `valueCr` optional and **omit the field from the card when absent** rather than rendering a blank —
> six of the ten projects have no approved value.

---

## Project scope — the two research phases

### Phase 1 — Company research ★ **complete**

Company profile · history · vision & mission · core values · timeline · directors · leadership · business
verticals · clients · project portfolio · equipment · HSE · certifications · financial highlights ·
future roadmap.

> The approved document closes this phase. What remains is not research but **collection**: portraits,
> biographies, certificate copies, plant specifications, photography, and the financial series.

### Phase 2 — Industry research ⬜ *(not started)*

EPC industry · railway infrastructure · **signalling & train protection (Kavach)** · civil engineering ·
sustainable construction · smart cities · PM Gati Shakti · NIP · **PPP models** · BIM · ESG ·
infrastructure investment trends.

> Two additions this revision — Kavach/ATP and PPP — both because the approved doc puts K.D. in those
> conversations directly.
>
> **Standing rule from every source document:** research-backed additions must be clearly distinguished
> from company-supplied information, everywhere they appear.

---

## Related documents

- [KD_INFO.md](KD_INFO.md) — **source of truth** for every fact
- [CONTENT.md](CONTENT.md) — approved copy, ready to place
- [NEEDED.md](NEEDED.md) — what is still outstanding
- [DESIGN.md](DESIGN.md) — brand direction and benchmarks
- [SEO.md](SEO.md) — metadata framework and blog library
