# PRE-LAUNCH — placeholders that must be filled or removed before go-live

**Rule:** nothing marked *To be added* ships. During review the site shows every
piece of content K.D. Constructions has not yet supplied as a **visible
placeholder** — a dashed card or tile carrying a "TO BE ADDED" badge — so the
client sees the gap where the content belongs instead of finding a page missing
(OPEN-QUESTIONS.md #32). This file is the list of them. It must be **empty**
before launch.

**The mechanical check:** `npm run check:placeholders` lists every placeholder
on the site and fails while one exists. `npm run build:release` runs it first
and refuses to build a launch bundle with any remaining. Run it before every
client review too — it is the fastest way to say what is still owed.

**How to close a row:** either the content arrives — replace the placeholder
item in `src/data/<page>.ts` with real copy and delete its `pending` field — or
K.D. confirms it does not exist — delete the item. Then run
`npm run check:placeholders` and `npm run check:keys` for that page, and strike
the row here.

**Last updated:** 2026-09-29 · **34 placeholders on the site** (1 on the new `/careers` page, row 6) (22 of them on the eight "Beyond the railway" project pages, rows 5a–5h — down from 32 after the public-source research of 2026-09-28) · **9 sign-offs** · **8 go-live configuration rows**

---

## Placeholders on the site

| # | Where | Shown as | What K.D. has to supply | If it does not exist |
| --- | --- | --- | --- | --- |
| 1a | `/csr` · Content Pending · card 1 | **Formal CSR programmes** · To be added | What structured CSR activity the company runs or funds, where, since when, annual spend | "Not applicable" (below Companies Act §135 threshold) — delete the card |
| 1b | `/csr` · Content Pending · card 2 | **Community partnerships** · To be added | Local initiatives near Dhule, Navi Mumbai, Raigad; NGOs / trusts / schools / civic bodies worked with | Delete the card |
| 1c | `/csr` · Content Pending · card 3 | **Education & skilling initiatives** · To be added | Apprenticeships, ITI / college tie-ups, worker upskilling, scholarships, site schools — with numbers | Delete the card |
| 1d | `/csr` · Content Pending · card 4 | **CSR committee & governance** · To be added | Whether a CSR committee exists, members, the policy | Delete the card |
| 2 | `/hse` · Certifications · card 4 | **Other certifications & certificate details** · To be added | Certificate numbers, validity dates, certifying bodies for ISO 9001 / 14001 / 45001; any RDSO approval; Rail Chamber membership certificate | Delete the card — the three ISO cards stand |
| 3a | `/projects` · Beyond the railway · tile 7 | **Kharghar Football Stadium** · Photograph to be added | One landscape photograph of the completed stadium | It is confirmed work, so the tile stays only if a photograph arrives — otherwise delete (empty-fields rule, OPEN-QUESTIONS.md #30) |
| 3b | `/projects` · Beyond the railway · tile 8 | **Kharghar Centre of Excellence** · To be confirmed | A yes that it is K.D.'s own work, plus one photograph. The facility itself (CIDCO, two pitches, inaugurated 2022) is now on record from public sources; K.D.'s part is not | A no deletes the tile **and** the name from the at-a-glance list in `K.D.Website_Details.md` |
| 4a | `/resources/vindhane-plant` · hero · tile 1 | **Annual capacity** · To be added | Fabrication capacity of the Vindhane plant, in MT per annum (or per month) — the figure every peer facility page leads with | Delete the tile; the two figure tiles stand |
| 4b | `/resources/vindhane-plant` · hero · tile 2 | **Plant area & year** · To be added | Covered shed and yard area (sq ft or acres) and the year the plant was commissioned | Delete the tile |
| 4c | `/resources/vindhane-plant` · How it is equipped · last row | **Machine inventory** · To be added | Number and type of welding sets, cutting lines and further cranes (the 20-tonne EOT crane is now on the page, from K.D.'s LinkedIn); skilled workforce at the plant | Delete the row — the six machinery lines stand |
| 4d | `/resources/rmc-plant-karjat` · hero · tile 1 | **Production capacity** · To be added | Output of the Karjat RMC plant, in m³ per hour or per day | Delete the tile |
| 4e | `/resources/rmc-plant-karjat` · hero · tile 2 | **Plant area & year** · To be added | Site area (sq ft or acres) and the year the plant was commissioned | Delete the tile — with 4d also gone, the hero stands without figures |
| 4f | `/resources/rmc-plant-karjat` · How it is equipped · last row | **Plant specifications** · To be added | Batching plant make and capacity, number of transit mixers and pumps, any on-site testing lab (the enclosure, silos and covered bays are now on the page, from the photographs) | Delete the row — the four equipment lines stand |
| 5a | `/projects/bonkode-fob` · hero tile 3 | **Scope of works** · To be added | What K.D. delivered (foundations, steelwork, cladding, lifts, ramps). Client **NMMC** and year **2012** are now filled from public sources (S8) | Delete the tile; the other three stand |
| 5b | `/projects/ulwe-hospital` · hero tiles 3, 4 | **Scope of works · Year completed** · To be added | What K.D. delivered; the year it was handed over | Delete the tile; CIDCO and 20,000 sq ft stand (but see S7) |
| 5c | `/projects/ulwe-cidco-school` · all four hero tiles | **Client · Built-up area · Scope of works · Year completed** · To be added | Client (CIDCO?); area, floors, classrooms; scope; year handed over | Delete each tile K.D. cannot fill. If all four go, the page is a name, a place and two photographs — decide whether it stays a page or goes back to a tile only |
| 5d | `/projects/karanjade-health-care` · all four hero tiles | **Client · Built-up area · Scope of works · Year completed** · To be added | Client; area and floors; scope; year | As 5c |
| 5e | `/projects/kharghar-golf-course` · hero tiles 3, 4 | **Scope of works · Year completed** · To be added | Clubhouse only, or the course works (greens, drainage, ponds) too; the year K.D.'s package was handed over — the course reopened as 18 holes in April 2026, but that may not be K.D.'s date. Client **CIDCO** and **103 ha** are filled (S8). No cost is quoted: sources disagree (₹109.65 cr vs ₹50.35 cr) | Delete each tile K.D. cannot fill |
| 5f | `/projects/lush-meadows` · hero tiles 3, 4 + overview card | **Scope of works · Year completed** · To be added; **Figures from a property portal** · To be verified | Scope and year; **and** a check of MahaRERA A51800000454 on the MahaRERA site — the developer (Kailash Developers), 2 & 3 BHK and 711–852 sq ft are Square Yards portal data | Registration does not match: remove the developer and flat tiles and the second half of the paragraph. Checked and matches: delete the card |
| 5g | `/projects/kharghar-football-stadium` · hero tiles 3, 4 + the gallery | **Scope of works · Year completed** · To be added; **Photographs** · Photograph to be added | Scope and year (client **CIDCO** and the **40,000 planned capacity** are filled — S8), and landscape photographs of the stadium — the first becomes the page's header and the tile on `/projects` (row 3a) | No photograph: delete the page, its tile (3a) and its gallery card together — a page with no picture and no facts is the empty-fields case OPEN-QUESTIONS.md #30 warns about |
| 5h | `/projects/kharghar-centre-of-excellence` · the whole page | **K.D. Constructions' own work?** · To be confirmed; hero tile 3 **Scope of works** · To be added; **Photographs** · Photograph to be added | First the yes/no (with 3b). On a yes: K.D.'s scope and a photograph — client, pitches, 2022 and the description are now filled from public sources (S8) | A no deletes the page's entry in `src/data/social-projects.ts`, the tile (3b) and the name in `K.D.Website_Details.md` — delete the tile first, or the module refuses to build a tile with no page |
| 6 | `/careers` · Where We Hire · card 2 | **K.D. Constructions on Indeed** · To be added | The URL of K.D. Constructions' company / jobs page on Indeed. (The individual job cards are **not** placeholders: an editor adds and removes them on the page itself in edit mode — "Add a job posting" card, "Remove posting" on each) | Delete the card — the LinkedIn card stands |

**If all four `/csr` cards are deleted:** the page keeps its three commitments
and the Content Pending section goes. Then decide whether `/csr` stays at all —
CONTENT.md and WEBSITE_INFO.md §14 recommend folding it into `/hse` if there is
no formal programme, because rule 8 (paid contracts are not philanthropy)
weighs on the "Community Impact" card. That is the client's call: ask.

---

## Sign-offs (content is on the site; K.D. has to confirm it)

These are not placeholders — nothing is marked on the page — but the source
document says the content is unverified, so they need a yes before launch.

| # | Where | What to confirm | Source of the doubt |
| --- | --- | --- | --- |
| S1 | `/about` · Board of Directors | Names, roles, bios of the four directors, and the surname spelling — the site has **Gindodia**, the brief has **Gindodi** | `K.D.Website_Details.md` §Leadership: *"Please collect the leadership data… or ask Sir for the correct guidance/details before finalising"* (OPEN-QUESTIONS.md #25) |
| S2 | `/about` · Board of Directors | Whether portraits are wanted. The approved design has no portrait slot; adding one is a design change, so this is a question, not a placeholder | STRUCTURE.md page inventory: "⬜ bios and portraits" |
| S3 | `/csr` · Community Impact | Whether K.D. is comfortable presenting contract work (Z-Bridge, station redevelopments) under a CSR heading | WEBSITE_INFO.md rule 8; CONTENT.md §CSR |
| S4 | `/resources/vindhane-plant` · Plant Gallery | Whether the EOT-crane photograph (PHOTOS.md B21, `Vindhane Plant/vindhane-shed-eot-crane.png`) is the Vindhane shed. A yes adds it as the third gallery tile; nothing is on the page until then | It sits on the annual deck's Vindhane slide but is uncaptioned there (PHOTOS.md B21 ⬜; OPEN-QUESTIONS.md #33). Separately: RDSO girder certification is *in progress*, not held, and is deliberately absent from the page (docs/CONTENT.md §Steel Fabrication) |
| S5 | `/404` · the whole page | The wording of the error page — kicker, headline, one sentence, button label. It is authored in the site's voice, not taken from the brief, because no source document covers an error page. Change it in `src/data/not-found.ts` (it is deliberately not in-page editable — OPEN-QUESTIONS.md #35) | Nothing in `K.D.Website_Details.md` or `docs/` describes a 404; the copy is the build's (OPEN-QUESTIONS.md #35) |
| S6 | `/projects/bonkode-fob` and `/projects/kharghar-golf-course` · hero tile and overview | Bonkode: "72 × 3 m", "on the Thane–Belapur road, connecting Bonkode village to the TTC industrial belt". Golf course: "a modern building with premium finishes, set in landscaped grounds". Right as stated? | The company's Company Profile deck, slide 10 — its own words, but not the approved brief, and the slide swaps the two captions (OPEN-QUESTIONS.md #36) |
| S7 | `/projects/ulwe-hospital` · hero tiles 1–2 and overview | That the building on the Ulwe Hospital tile is the deck's "CIDCO Urban Health Centre" — client **CIDCO**, **20,000 sq ft**, fire systems, stack parking, completed on time. If it is the Karanjade building instead, both pages' facts and photographs swap | Attributed by photograph: the deck's picture is `Ulwa Hospital/1.jpg`, but the deck names no node, and an earlier read (#28b) matched it to Karanjade by name. The two folders already disagree about one photograph (#30) |
| S8 | `/projects/bonkode-fob`, `kharghar-golf-course`, `lush-meadows`, `kharghar-football-stadium`, `kharghar-centre-of-excellence` · hero tiles and overviews | Everything added on 2026-09-28: Bonkode (NMMC, 2012, 72 m tubular steel, lifts and ramps, architect THE FIRM); golf course (CIDCO, 103 ha, 18 holes, par 72, 7,137 yd, designer Vijit Nandrajog, reopened April 2026, PGTI); stadium (CIDCO, planned 40,000, FIFA-approved); Centre of Excellence (CIDCO, Sector 33, two pitches inaugurated Jan 2022, AFC Women's Asian Cup / FIFA U-17 Women's World Cup). No page claims the centre is in use — a Jul 2026 FPJ report says it has sat largely unused | Public sources (WorldArchitecture, THE FIRM, CIDCO, Golf Course Architecture, WIFA, Free Press Journal), not K.D. — right facts, but K.D. should see them before they carry its name |
| S9 | `/privacy` and `/terms` · the whole of both pages | **Legal review of the wording** by K.D. or its lawyer. They are a first draft (2026-10-09), written to describe what the site actually does, not legal advice. Specifically confirm: the **Grievance Officer** (drafted as "the Head of HR, hr@kdconstructions.net" — the DPDP Act and IT Rules 2011 expect a named contact); the **24-month** retention (if changed, change `RETENTION_MONTHS` in `src/lib/applications.ts` and the careers consent line too); **courts at Mumbai** in the terms; and that the site is on **HTTPS** at launch, which the privacy policy states. Edit in place (keys `privacy.*`, `terms.*`) or in `src/data/legal.ts`, and update the "Last updated" line | Neither page was in the brief or design; added when `/careers` began collecting applicants' personal data |
| S10 | `/clients` · Railways · WPO, IRCON; Public Sector · FCI | Added 2026-10-09 at the client's request. Say which works were for each — the cards carry only the organisations' names | Client feedback, 2026-10-09 |
| S11 | `/company` · Board of Directors · portraits | Sir to confirm the current photos or send alternate photos | Client feedback, 2026-10-09 |

---

## Go-live configuration (not content — but the site does not rank without it)

These are not placeholders and nothing is marked on the page. They are the
things a search engine needs that only exist at deployment. OPEN-QUESTIONS.md
#34 has the audit.

| # | What | Why it blocks | Done when |
| --- | --- | --- | --- |
| G1 | **`PUBLIC_SITE_URL`** set in the production environment to the real https origin, e.g. `https://www.kdconstructions.net` — no path, no trailing slash | Every canonical, `og:url`, `og:image`, sitemap `<loc>` and the JSON-LD are written against it. Unset, they all say `http://localhost:4322`, which tells the crawler the real domain is a copy of a page it cannot reach | `npm run check:site-url` passes; `npm run build:release` runs it first and refuses otherwise |
| G2 | Submit `https://<origin>/sitemap.xml` in **Google Search Console** (and Bing Webmaster Tools) after the first deploy | The sitemap is served from the site, so it is not "submitted" by building; someone has to hand the URL over once | Search Console shows the sitemap read, 28 URLs discovered (as of 2026-09-19 — fewer if any row 5 page is deleted) |
| G3 | **Share card for the six pages without a photograph** — capabilities, resources, HSE, clients, contact, CSR | They have no hero, so no `og:image`; a link to them on WhatsApp or LinkedIn shows text only. Pages with a hero already use it. Needs one designed 1200×630 card, or a decision to reuse the home hero | A `src/assets` card exists and `InfoPage`'s routes pass it to `BaseLayout` — or the client says text-only is fine (OPEN-QUESTIONS.md #7) |
| G4 | `founder` in the Organization JSON-LD (`src/data/organization.ts`) | Withheld until sign-off S1 settles the surname spelling — a wrong spelling in structured data outlives the page | Add the line after S1 |
| G5 | **`job_posting_events` table** created on the production database, with `GRANT SELECT, INSERT` for the app user — both statements are in `db/schema.sql` | The `/careers` job cards live in it. Without it the page still loads (it shows "No openings listed right now"), but adding a posting in edit mode fails with "Could not save" | Sign in, turn on Edit text on `/careers`, add a test posting, see it appear, remove it |
| G6 | **`SITE_NOINDEX` removed** from the production `.env` | The test server on a bare IP runs with `SITE_NOINDEX=1` (src/lib/staging.ts): every response says `X-Robots-Tag: noindex` and `/robots.txt` disallows everything. Copied to the real domain, the site never enters the index | `npm run check:site-url` passes (it fails while the switch is on); `curl -I https://<origin>/` shows no `X-Robots-Tag` |
| G7 | **Careers email** — `SMTP_USER` / `SMTP_PASS` (a Google Workspace App Password) in the production `.env`, `CAREERS_TO=hr@kdconstructions.net`; an **SPF** TXT record `v=spf1 include:_spf.google.com ~all` on kdconstructions.net and **DKIM** turned on in the Workspace Admin console (the domain had neither SPF as of 2026-10-08) | Without SMTP the "Apply here" form on `/careers` still accepts applications, but they are only kept in `/studio/applications` — nobody at HR is told. Without SPF/DKIM the emails may land in hr@'s spam | Send a test application on `/careers`; it arrives in hr@'s inbox (not spam) with the resume attached, and `/studio/applications` shows it as **Sent** |
| G8 | **`GRANT DELETE ON kd_construction.job_applications TO 'kd_app'@'localhost';`** on the production database (also in `db/schema.sql`) | `/privacy` promises applicants deletion on request and after 24 months. Both are done by the app (the Delete button on `/studio/applications`, and an automatic purge) and both need DELETE. Without it the button says "Could not delete" and old applications are never purged — the policy would be untrue | Send a test application, open `/studio/applications`, Delete → Confirm delete; the row disappears and stays gone after a reload |

## Where the placeholder mechanism lives

- `pending?: string` on `InfoItem` (`src/data/pages.ts`) and on `SocialProject`
  (`src/data/projects.ts`) — the value is the badge label. `PlantStat` and
  `PlantListItem` in `src/data/plant.ts` carry the same field for the
  Vindhane plant page's tiles and rows; `FactTile` and `PendingNote` in
  `src/data/social-projects.ts` for the "Beyond the railway" project pages.
- Rendered by `src/components/InfoPage.astro` (dashed card + badge),
  `src/components/projects/Social.astro` (ink tile + badge + note) and
  `src/pages/resources/vindhane-plant.astro` (both treatments, on its ink hero
  and its white lists) and `src/components/projects/SocialProjectPage.astro`
  (the same two, on its hero tiles and its white overview and gallery). All carry `data-pending` for the scanner.
- `scripts/check-placeholders.mjs` walks every copy export in its `MODULES`
  list, one row per export with the route it renders on. **Add a row there
  when you add a page**, or its placeholders are invisible to the gate.
- The pattern is described in DESIGN-SYSTEM.md §9 (review-only, never a design
  element).

The wider list of everything ever asked of K.D. — 47 items, most now closed —
is `docs/NEEDED.md`. This file is only what is *visible on the site*.
