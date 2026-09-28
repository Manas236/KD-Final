# SEO — Metadata Framework & Content Strategy

SEO requirements and the planned editorial content library.

**Extracted from:** `structure of KD Construction.docx` (SEO framework, blog library), `KD Construction website structure.docx` (metadata deliverables)
**Facts and slugs referenced here:** [KD_INFO.md](KD_INFO.md) · [STRUCTURE.md](STRUCTURE.md)
**Last updated:** 2026-08-18

> **Status — 2026-09-18.** What of this is on the built site (OPEN-QUESTIONS.md #34): every page has
> a unique title, meta description and canonical; every content image has alt text; `/sitemap.xml` is
> **served** from the page data (20 pages, 57 images as `<image:image>`) and `/robots.txt` points to
> it; `Organization` JSON-LD is on every page and `BreadcrumbList` on project and plant pages;
> `og:image` is the hero on every page that has one. Still open: `PUBLIC_SITE_URL` in production
> (PRE-LAUNCH.md G1 — the release build refuses without it), Search Console submission (G2), a share
> card for the six photograph-less pages (G3), `hasCredential` / `geo` / `founder` in the
> Organization block (see `src/data/organization.ts`). The `z.object` schema below was not adopted:
> pages are `.astro` files reading `src/data/*.ts`, not content collections, and `BaseLayout`'s
> required `title` / `description` props are the equivalent build-time guarantee. The route renames
> below did not happen — the shipped slugs are `slugify()` of the project titles (`src/lib/slug.ts`),
> and nothing has been published under the old ones, so no redirects are owed.
>
> **Revision 3 — 2026-08-18.** The approved document changes what this site can credibly rank for. Three
> new keyword clusters open up (**signalling & telecommunication / Kavach**, **ISO-certified EPC**,
> **Vande Bharat depot**), the project-name cluster doubles, and two route renames need redirect
> planning. Details below.

---

## Per-page requirements

**Every page must ship with all seven of these.** This is stated as a hard requirement in the source
documents — no page is complete without them.

| # | Element | Notes |
| --- | --- | --- |
| 1 | SEO Title | |
| 2 | Meta Description | |
| 3 | Focus Keyword | One primary keyword per page |
| 4 | URL Slug | See the route table in [STRUCTURE.md](STRUCTURE.md) |
| 5 | Schema recommendations | Structured data type per page |
| 6 | Image ALT Text | Every image, not just hero images |
| 7 | Internal Links | Deliberate, not incidental |

The site structure document additionally calls for **FAQ sections** and **image placement
recommendations** as part of the CMS-ready content package.

### Implementation in Astro

Enforce this at the type level rather than by convention — make an incomplete page fail the build:

```ts
// src/content/config.ts — proposed
const seo = z.object({
  title:       z.string().max(60),
  description: z.string().max(160),
  focusKeyword: z.string(),
  ogImage:     z.string().optional(),
  schema:      z.enum(['Organization', 'WebPage', 'Project', 'Service', 'Article', 'Person', 'FAQPage']),
});
```

~~`@astrojs/sitemap` is already installed in [package.json](../package.json) — wire it up so every route
lands in the sitemap automatically.~~ Removed 2026-09-18: with every page server-rendered it could not
see `/projects/[slug]`, so it listed ten pages of twenty. The sitemap is served from
`src/pages/sitemap.xml.ts` instead, from the same data the pages render.

### Route renames — plan redirects now

Two slugs changed with the approved document. If either has already shipped, 301 it:

| Old | New | Why |
| --- | --- | --- |
| `/projects/matunga-z-bridge` | `/projects/matunga-workshop-fob` | ✅ **Confirmed 2026-08-18 🗣 — one structure.** Ship the 301; keep "Matunga Z-Bridge" as body copy and as a target keyword on the FOB page |
| `/projects/panvel-karjat-railway-line` | `/projects/panvel-karjat-corridor` | Approved name is "Panvel–Karjat Suburban Rail Corridor" |
| `/services/mechanical-works` | `/services/mechanical-engineering` | Approved vertical name |
| `/services/electrical-works` | `/services/electrical-engineering` | Approved vertical name |

> If the Z-Bridge turns out to be a **separate** structure, the old slug comes back as its own page
> rather than a redirect. Hold that redirect until the answer arrives.

---

## Schema recommendations by page type

| Page | Schema type |
| --- | --- |
| Home | `Organization` + `WebSite` |
| About / History | `AboutPage` |
| Leadership | `Person` × 4 |
| Service pages | `Service` |
| Project case studies | `CreativeWork` or `Project` + `ImageObject` |
| Clients | `Organization` references |
| News articles | `Article` / `NewsArticle` |
| Contact | `LocalBusiness` + `PostalAddress` |
| Any FAQ block | `FAQPage` |

**`Organization` additions from the approved document** — these are real structured-data wins:

```jsonc
{
  "@type": "Organization",
  "legalName": "Kailashchandra Dilipkumar Constructions Private Limited",
  "foundingDate": "1973",
  "foundingLocation": "Dhule, Maharashtra, India",
  "slogan": "Building excellence, brick by brick.",
  "hasCredential": [                 // ISO 9001:2015, 14001:2015, 45001:2018
    { "@type": "EducationalOccupationalCredential", "credentialCategory": "certification" }
  ],
  "memberOf": { "@type": "Organization", "name": "Chamber of Railway Industries" },
  "founder": { "@type": "Person", "name": "Kailash S. Gindodia" },
  "sameAs": ["https://www.linkedin.com/company/k-d-constructions/"]
}
```

> ⬜ Publish the ISO entries only once certificate numbers arrive — a `hasCredential` block with no
> identifier is weak, and an unverifiable one is worse. `founder` is now safe: the approved leadership
> slide confirms **Kailash S. Gindodia** as Founding Director.
>
> 🟡 `geo` coordinates still need the exact lat/long; the Google Maps share link is in
> [KD_INFO §1](KD_INFO.md).

---

## Keyword themes

Derived from the company's actual positioning in [KD_INFO.md](KD_INFO.md). Validate against real search
volume before committing.

| Cluster | Example targets |
| --- | --- |
| Core identity | EPC contractor Navi Mumbai · infrastructure EPC company Mumbai · full-spectrum EPC contractor India |
| Railway | railway infrastructure contractor India · railway station redevelopment contractor · railway workshop construction · **coach maintenance depot construction** · **carshed construction contractor** |
| **Signalling & telecom ★ new** | **railway signalling and telecommunication contractor · Kavach installation contractor · ATP system installation India** |
| Bridges & FOBs | **foot overbridge construction contractor · FOB launching over running railway line · plate girder FOB erection** |
| Discipline | civil engineering contractor Mumbai · structural steel fabrication Raigad · **ready-mix concrete plant Karjat** · track engineering / P-Way contractor |
| **Credential ★ new** | **ISO 9001 14001 45001 certified construction company · Chamber of Railway Industries member** · Railway Board approved contractor · MUTP-III contractor · RDSO girder manufacturer *(only once certified)* |
| Project-named | Sanpada Carshed · Matunga Workshop · **Matunga LHB facility** · **Nhava Sheva Uran railway station** · Panvel Karjat railway corridor · **Solapur Vande Bharat depot** · **Lower Parel railway redevelopment** |

> ⚠️ **One hard rule, one cleared:**
>
> 1. Do not target "RDSO certified" keywords — certification is **in progress**, and the approved doc does
>    not mention it at all.
> 2. ✅ **Cleared 2026-08-18** 🗣 — Kavach was **installed at Mankhurd station**, so "Kavach installation
>    contractor" may be targeted as a *delivered service*, not merely a capability. Tie the claim to
>    Mankhurd wherever it appears; do not generalise it to the portfolio.
>
> **Best new opportunity:** the project-name cluster. Six newly documented projects with distinctive
> names, real engineering quantities, and almost no competing content — "Matunga LHB coach maintenance
> facility" and "Solapur Vande Bharat maintenance depot" are close to uncontested.

---

## Editorial content library

The source document proposes an ongoing library of **50–100 SEO articles**, seeded with these titles.
Four are added this revision, drawn from what the approved document actually gives K.D. authority on:

| # | Article |
| --- | --- |
| 1 | Future of Railway Infrastructure in India |
| 2 | Smart Cities and EPC Companies |
| 3 | Modern Bridge Construction |
| 4 | Railway Station Redevelopment |
| 5 | Sustainable Construction Practices |
| 6 | BIM in Infrastructure Projects |
| 7 | India's Infrastructure Growth Story |
| 8 | Safety Culture in Construction |
| 9 | Green Building Technologies |
| 10 | Project Management in EPC |
| 11 | ★ **Kavach and the Future of Train Protection in India** |
| 12 | ★ **Building Inside a Live Railway: How FOBs Are Launched Over Running Lines** |
| 13 | ★ **What ISO 9001, 14001 and 45001 Actually Mean on a Construction Site** |
| 14 | ★ **Inside a Vande Bharat Maintenance Depot** |

These feed the **News & Media** section (`/news`). Build it as an Astro content collection from the start,
even with zero articles — the route, schema and sitemap integration should exist before the first post.

### Mapping articles to real credibility

Each seed topic has a matching K.D. project that turns a generic industry article into a first-hand one.
That internal link is the whole point of the library.

| Article | Anchor project |
| --- | --- |
| Railway Station Redevelopment | Harbour Line Redevelopment (4 stations) · Nhava Sheva & Uran |
| Modern Bridge Construction | Matunga Workshop FOB (303 m) · Harbour Line FOBs |
| **Building Inside a Live Railway** | Harbour Line FOBs · Panvel–Karjat box-pushing beneath live OHE |
| Future of Railway Infrastructure in India | Panvel–Karjat, MUTP-III |
| **Kavach and Train Protection** | Signalling & Telecommunication vertical 🗣 *(installed at Mankhurd — cleared)* |
| Safety Culture in Construction | HSE — four pillars + **ISO 45001:2018** |
| **What the ISO standards mean** | The three certifications, with site practice as illustration |
| Green Building Technologies | **ISO 14001:2015** · Matunga Workshop GreenCo Platinum 🟡 |
| **Inside a Vande Bharat Maintenance Depot** | Solapur depot (awarded) · Matunga LHB facility |
| BIM in Infrastructure Projects | Vision 2030 — "digital innovation" ★ |
| Project Management in EPC | Sanpada Carshed · the integrated delivery model ★ |

---

## The labelling rule

This appears in all three structure documents and applies to every article, every service page, and every
statistic:

> **Research-backed additions must be clearly distinguished from information supplied by the company.**

In practice, for this build:

- Company facts → plain prose, backed by [KD_INFO.md](KD_INFO.md) ★ / ✅ entries
- Industry context → a visually distinct callout, with a cited source 🌐
- Proposed/aspirational content → framed as intent ("Vision 2030 targets…"), never as current practice

Getting this wrong on a government-tender-facing website is a real risk, not a stylistic preference. The
four market statistics on *Why K.D.* and the expanded *Sustainability* page are the two places most likely
to breach it — and the **Kavach** sentence is now the third.

---

## Pre-launch checklist

| ✔ | Item |
| --- | --- |
| ☐ | All pages have the seven required SEO elements |
| ☐ | `@astrojs/sitemap` configured and generating |
| ☐ | `robots.txt` present |
| ☐ | Canonical URLs on every route |
| ☐ | **301s in place for the four renamed routes** *(the Z-Bridge 301 is cleared — §48 closed 🗣)* |
| ☐ | OG + Twitter card images per page |
| ☐ | `Organization` schema with logo, address, phone, founder, certifications, social profiles |
| ☐ | `LocalBusiness` schema on Contact *(unblocked; `geo` needs exact lat/long)* |
| ☐ | Every image has meaningful ALT text — using the **approved** project and place spellings (Nhava Sheva, Ulwe) |
| ☐ | Internal linking pass — services ↔ projects ↔ industries ↔ certifications |
| ☐ | No "RDSO certified" phrasing anywhere. **"Kavach installed" is now permitted** 🗣 — at Mankhurd station, and only there |
| ☐ | Google Search Console + Analytics connected |
| ☐ | Google Business Profile for the Vashi office |
| ☐ | Core Web Vitals verified on the photography-heavy pages |

---

## Related documents

- [KD_INFO.md](KD_INFO.md) — **source of truth** for every fact
- [STRUCTURE.md](STRUCTURE.md) — routes and page hierarchy
- [CONTENT.md](CONTENT.md) — approved copy
- [DESIGN.md](DESIGN.md) — visual direction
