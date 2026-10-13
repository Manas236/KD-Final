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

**Last updated:** 2026-10-13 · **62 placeholders on the site** — the number `npm run check:placeholders` prints; the 30 open rows below cover them, several rows holding more than one (20 are on the older "Beyond the railway" project pages, rows 5b–5h; 28 came on 2026-10-13 with the eight works from K.D.'s own list of completed works — rows 3c and 7a–7h; 1 on `/careers`, row 6). It was 36 until 2026-10-13: that list first filled the scope of works on two pages (row 5a closed, row 5e halved — 34), then its eight other works each became a project page with its own gaps · **13 sign-offs** (S1–S13) · **8 go-live configuration rows, 7 still open** (G3 closed 2026-10-12)

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
| 3c | `/projects` · Beyond the railway · tiles 9–16 | **Ghansoli Roads & Services · Kamothe Peripheral Roads · Vashi Station Approach Road · Ulwe Mass Housing Infrastructure · Ulwe Sector 8 Infrastructure · Kharghar 33 kV Substation · Rabale Skywalk · NMMC School No. 54 & 55** · Image to be added (eight tiles) | One image per work. There is no photograph of any of them; Sir allows a **generic, representative image**, shown with a small "Representative image" caption on the tile and on the page header. Put them in `kd-construction/Civic_Works_AI/`, named by the page's slug (rows 7a–7h give each slug). A real photograph of the work is better still. **Never a photograph of a different K.D. work** | No image: delete the tile and its page (the matching row 7) together, and the work's link on its `/clients` card |
| 4a | `/resources/vindhane-plant` · hero · tile 1 | **Annual capacity** · To be added | Fabrication capacity of the Vindhane plant, in MT per annum (or per month) — the figure every peer facility page leads with | Delete the tile; the two figure tiles stand |
| 4b | `/resources/vindhane-plant` · hero · tile 2 | **Plant area & year** · To be added | Covered shed and yard area (sq ft or acres) and the year the plant was commissioned | Delete the tile |
| 4c | `/resources/vindhane-plant` · How it is equipped · last row | **Machine inventory** · To be added | Number and type of welding sets, cutting lines and further cranes (the 20-tonne EOT crane is now on the page, from K.D.'s LinkedIn); skilled workforce at the plant | Delete the row — the six machinery lines stand |
| 4d | `/resources/rmc-plant-karjat` · hero · tile 1 | **Production capacity** · To be added | Output of the Karjat RMC plant, in m³ per hour or per day | Delete the tile |
| 4e | `/resources/rmc-plant-karjat` · hero · tile 2 | **Plant area & year** · To be added | Site area (sq ft or acres) and the year the plant was commissioned | Delete the tile — with 4d also gone, the hero stands without figures |
| 4f | `/resources/rmc-plant-karjat` · How it is equipped · last row | **Plant specifications** · To be added | Batching plant make and capacity, number of transit mixers and pumps, any on-site testing lab (the enclosure, silos and covered bays are now on the page, from the photographs) | Delete the row — the four equipment lines stand |
| ~~5a~~ | ~~`/projects/bonkode-fob` · hero tile 3~~ | ~~**Scope of works** · To be added~~ | ✅ **Closed 2026-10-13.** K.D.'s own list of completed works has the contract as "Construction of Skywalk at Khairane Bonkode on Thane Belapur Road", so the tile reads **Construction · Scope of works**. Which parts K.D. built itself (foundations, steelwork, cladding, lifts, ramps) is still not on record; add it to the page if K.D. wants it said. The client on this page is now a sign-off: S12 | — |
| 5b | `/projects/ulwe-hospital` · hero tiles 3, 4 | **Scope of works · Year completed** · To be added | What K.D. delivered; the year it was handed over | Delete the tile; CIDCO and 20,000 sq ft stand (but see S7) |
| 5c | `/projects/ulwe-cidco-school` · all four hero tiles | **Client · Built-up area · Scope of works · Year completed** · To be added | Client (CIDCO?); area, floors, classrooms; scope; year handed over | Delete each tile K.D. cannot fill. If all four go, the page is a name, a place and two photographs — decide whether it stays a page or goes back to a tile only |
| 5d | `/projects/karanjade-health-care` · all four hero tiles | **Client · Built-up area · Scope of works · Year completed** · To be added | Client; area and floors; scope; year | As 5c |
| 5e | `/projects/kharghar-golf-course` · hero tile 4 | **Year completed** · To be added | The year the clubhouse was handed over. The scope tile was filled on 2026-10-13: K.D.'s own list of completed works has the contract as "Construction of Club House for golf course at Kharghar", so it reads **Clubhouse · Scope of works** and the overview says K.D. built the clubhouse. Client **CIDCO** and **103 ha** are filled (S8) — but see S12 on the client. No cost is quoted: sources disagree (₹109.65 cr vs ₹50.35 cr) | Delete the tile |
| 5f | `/projects/lush-meadows` · hero tiles 3, 4 + overview card | **Scope of works · Year completed** · To be added; **Figures from a property portal** · To be verified | Scope and year; **and** a check of MahaRERA A51800000454 on the MahaRERA site — the developer (Kailash Developers), 2 & 3 BHK and 711–852 sq ft are Square Yards portal data | Registration does not match: remove the developer and flat tiles and the second half of the paragraph. Checked and matches: delete the card |
| 5g | `/projects/kharghar-football-stadium` · hero tiles 3, 4 + the gallery | **Scope of works · Year completed** · To be added; **Photographs** · Photograph to be added | Scope and year (client **CIDCO** and the **40,000 planned capacity** are filled — S8), and landscape photographs of the stadium — the first becomes the page's header and the tile on `/projects` (row 3a) | No photograph: delete the page, its tile (3a) and its gallery card together — a page with no picture and no facts is the empty-fields case OPEN-QUESTIONS.md #30 warns about |
| 5h | `/projects/kharghar-centre-of-excellence` · the whole page | **K.D. Constructions' own work?** · To be confirmed; hero tile 3 **Scope of works** · To be added; **Photographs** · Photograph to be added | First the yes/no (with 3b). On a yes: K.D.'s scope and a photograph — client, pitches, 2022 and the description are now filled from public sources (S8) | A no deletes the page's entry in `src/data/social-projects.ts`, the tile (3b) and the name in `K.D.Website_Details.md` — delete the tile first, or the module refuses to build a tile with no page |
| 6 | `/careers` · Where We Hire · card 2 | **K.D. Constructions on Indeed** · To be added | The URL of K.D. Constructions' company / jobs page on Indeed. (The individual job cards are **not** placeholders: an editor adds and removes them on the page itself in edit mode — "Add a job posting" card, "Remove posting" on each) | Delete the card — the LinkedIn card stands |
| 7a | `/projects/ghansoli-roads-and-services` · hero tile 4 + the gallery | **Year completed** · To be added; **Image** · Image to be added | The year the work was handed over; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |
| 7b | `/projects/kamothe-peripheral-roads` · hero tile 4 + the gallery | **Year completed** · To be added; **Image** · Image to be added | The year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |
| 7c | `/projects/vashi-station-approach-road` · hero tile 4 + the gallery | **Year completed** · To be added; **Image** · Image to be added | The year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |
| 7d | `/projects/ulwe-mass-housing-infrastructure` · hero tiles 2, 4 + the gallery | **Extent of works · Year completed** · To be added; **Image** · Image to be added | Road length, area served or the main quantities; the year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |
| 7e | `/projects/ulwe-sector-8-infrastructure` · hero tiles 2, 4 + the gallery | **Extent of works · Year completed** · To be added; **Image** · Image to be added | Road length, area served or the main quantities; the year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |
| 7f | `/projects/kharghar-33-kv-substation` · hero tile 4 + the gallery | **Year completed** · To be added; **Image** · Image to be added | The year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |
| 7g | `/projects/rabale-skywalk` · hero tiles 1, 2, 4 + the gallery | **Client** · To be confirmed; **Length & width · Year completed** · To be added; **Image** · Image to be added | The client — S12, for Sir; the skywalk's length and width; the year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |
| 7h | `/projects/nmmc-school-no-54-and-55` · hero tile 4 + the gallery | **Year completed** · To be added; **Image** · Image to be added | The year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c) |

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
| S12 | `/projects/bonkode-fob`, `/projects/kharghar-golf-course`, `/projects/rabale-skywalk` · hero tile 1 (Client); `/clients` · the CIDCO and NMMC cards | **For Sir — one question: who was the client on three works?** The Bonkode skywalk, the Rabale skywalk and the Kharghar golf course clubhouse. K.D.'s list of completed works gives **CIDCO** for both skywalks and **NMMC** for the clubhouse; the site had **NMMC** for Bonkode and **CIDCO** for the golf course. Until Sir answers, all three are treated the same: **none is listed on a client card** on `/clients`; the Bonkode and golf course pages keep the client they had; the Rabale page names no client (a "To be confirmed" tile, row 7g). Each answer is a one-word change in `src/data/social-projects.ts` plus one link on the right card in `src/data/pages.ts` — and if Bonkode is CIDCO's, the last paragraph of its overview ("completed for the Navi Mumbai Municipal Corporation…") changes with it | The list (a screenshot, 2026-10-13, OPEN-QUESTIONS.md #44) against the sources behind S8: the Bonkode skywalk's architect names NMMC as its client; Rabale, like Bonkode, is in NMMC's area; the golf course is CIDCO's own, in Kharghar, outside NMMC's limits. The list's department column runs CIDCO for rows 1–7 and NMMC for rows 10–11, which is what a filled-down column looks like |
| S13 | `/hse` · Emergency Preparedness · the four new photographs and the last two cards | **For Amritanshu, K.D.'s HSE executive — three questions.** (1) Was the drill of 8 October 2026 a heat-stress drill, and at which site? The page gives the date only. (2) May the Karjat drill's scenario and clock times be published (fall 14:53, alarm 14:55, casualty away 15:00)? (3) The original photographs of the Karjat drill, if they exist — the only copies are the small ones inside the report, so that drill has no photograph on `/hse` and five small ones on `/gallery` | "Heat stress" is the name of the folder the ten photographs came in; nothing in them says so, and nothing names the site. The Karjat details are from the site's own mock drill report of 17 April 2026 (a PDF in the same folder) — a site report, not something written for publication. No name from either is on the site |

---

## Go-live configuration (not content — but the site does not rank without it)

These are not placeholders and nothing is marked on the page. They are the
things a search engine needs that only exist at deployment. OPEN-QUESTIONS.md
#34 has the audit.

| # | What | Why it blocks | Done when |
| --- | --- | --- | --- |
| G1 | **`PUBLIC_SITE_URL`** set in the production environment to the real https origin, e.g. `https://www.kdconstructions.net` — no path, no trailing slash | Every canonical, `og:url`, `og:image`, sitemap `<loc>` and the JSON-LD are written against it. Unset, they all say `http://localhost:4322`, which tells the crawler the real domain is a copy of a page it cannot reach | `npm run check:site-url` passes; `npm run build:release` runs it first and refuses otherwise |
| G2 | Submit `https://<origin>/sitemap.xml` in **Google Search Console** (and Bing Webmaster Tools) after the first deploy | The sitemap is served from the site, so it is not "submitted" by building; someone has to hand the URL over once | Search Console shows the sitemap read, 42 URLs discovered (as of 2026-10-13 — fewer if any row 5 or row 7 page is deleted) |
| ~~G3~~ | ~~**Share card for the pages without a photograph**~~ | ~~They have no hero, so no `og:image`; a link to them on WhatsApp or LinkedIn shows text only~~ | ✅ **Done 2026-10-12.** `public/share-card.png` — 1200×630, the logo and the company name on ink — is the `og:image` and `twitter:image` of every page that passes no photograph, with `og:image:width`, `:height` and `:alt`; `twitter:card` is `summary_large_image` on every page. That is thirteen pages, not six: capabilities, careers, clients, company, contact, CSR, HSE, privacy, resources, terms, the two Kharghar project pages still waiting for a photograph, and the 404. Pages with a hero keep theirs. The URL is built on `PUBLIC_SITE_URL` (G1), so it is only right once G1 is. Redraw it with `npm run share-card:build` |
| G4 | `founder` in the Organization JSON-LD (`src/data/organization.ts`) | Withheld until sign-off S1 settles the surname spelling — a wrong spelling in structured data outlives the page | Add the line after S1 |
| G5 | **The tables, and the app user's grants**, on the production database: `db/migrate.sql` run by a database administrator (see "Deploy and migration order" below), then `kd_app` given exactly the grants listed at the foot of that file — SELECT and INSERT on every table, no CREATE, no ALTER | Every write the site makes goes to one of these tables: job cards on `/careers`, applications, text added to project pages, gallery changes, in-page edits. The app no longer creates or changes a table itself, so a table the migration has not made is simply missing | `npm run check:db-flows` passes on the server. **Test server: grants in place, checked 2026-10-12** — see "G5 and G8 on the test server" below |
| G6 | **`SITE_NOINDEX` removed** from the production `.env` | The test server on a bare IP runs with `SITE_NOINDEX=1` (src/lib/staging.ts): every response says `X-Robots-Tag: noindex` and `/robots.txt` disallows everything. Copied to the real domain, the site never enters the index | `npm run check:site-url` passes (it fails while the switch is on); `curl -I https://<origin>/` shows no `X-Robots-Tag` |
| G7 | **Careers email** — `SMTP_USER` / `SMTP_PASS` (a Google Workspace App Password) in the production `.env`, `CAREERS_TO=hr@kdconstructions.net`; an **SPF** TXT record `v=spf1 include:_spf.google.com ~all` on kdconstructions.net and **DKIM** turned on in the Workspace Admin console (the domain had neither SPF as of 2026-10-08) | Without SMTP the "Apply here" form on `/careers` still accepts applications, but they are only kept in `/studio/applications` — nobody at HR is told. Without SPF/DKIM the emails may land in hr@'s spam | Send a test application on `/careers`; it arrives in hr@'s inbox (not spam) with the resume attached, and `/studio/applications` shows it as **Sent** |
| G8 | **`GRANT DELETE ON kd_construction.job_applications TO 'kd_app'@'localhost';`** on the production database (listed at the foot of `db/migrate.sql`) | `/privacy` promises applicants deletion on request and after 24 months. Both are done by the app (the Delete button on `/studio/applications`, and an automatic purge) and both need DELETE. Without it the button says "Could not delete" and old applications are never purged — the policy would be untrue | `npm run check:db-flows` passes: it sends a test application, finds it on `/studio/applications`, deletes it and checks it is gone. **Test server: in place, checked 2026-10-12** — see "G5 and G8 on the test server" below |

### G5 and G8 on the test server — in place, checked 2026-10-12

Both permissions are already there on the test server. Checked read-only on
2026-10-12 by the Claude Code session that runs on that server
(`ip-172-26-8-71`), connected to `kd_construction` as the site's own database
user, `kd_app@localhost`. Nothing was changed.

| Check | Result |
| --- | --- |
| Table `job_posting_events` exists | Yes |
| `kd_app` has SELECT and INSERT on `job_posting_events` (G5) | Yes |
| `kd_app` has DELETE on `job_applications` (G8) | Yes |

G5 and G8 stay in the table above because they are written for the
**production** database, which has to be given the same grants at go-live.

**How this check is run.** By the Claude Code session on the server, not by a
command handed to a person. Anything that has to run on a server is written
as a self-contained prompt for the session there, opening with a box check
(stop unless `hostname` prints `ip-172-26-8-71`); the user relays the prompt
and pastes the report back. The rule is in `CLAUDE.md`. The development PC
cannot do it directly: the server's MySQL is not open to the internet and the
PC holds no SSH key for it.

## Deploy and migration order

The same order on the test server now and on production at launch. The
site's database user, `kd_app`, may only SELECT and INSERT (plus DELETE on
`job_applications`), so the app cannot create or change a table: the schema
has to be in place before the new code starts. Until 2026-10-12 the app ran
`CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` itself, which MySQL refuses to
a user without CREATE and ALTER — even when the table already exists.
Reproduced locally with `kd_app`'s exact grants: applications and project
text blocks failed with "CREATE command denied". All schema statements now
live in `db/migrate.sql`.

**Backups go to `/srv/kd-backups/`, never inside `/srv/kd-site`.** That
covers every copy taken on the server, each named with the time it was taken
(`$(date +%Y%m%d-%H%M)`): the build backup of step 1, `dist.bak-<date-time>`;
a copy of `.env` before it is edited (G1, G6, G7), `.env.bak-<date-time>`; a
database dump, `db-backup-<date-time>.sql`; and a schema snapshot,
`kd-schema-<date-time>.sql`. Keep to those names: the pruning in step 1
recognises only them, and dates each backup by its name.
`/srv/kd-backups/` is owned by `kd`, mode 700; if it is missing, create it
once with `sudo install -d -o kd -m 700 /srv/kd-backups`. The site folder is
a git working tree and is not the place for them: a `.env` copy holds the
database and SMTP passwords, and a dump holds applicants' personal data.
`.gitignore` lists `.env.bak*`, `dist.bak-*/`, `db-backup-*.sql` and
`kd-schema-*.sql` so a stray one never reaches a commit, but that is a
safety net, not leave to keep them there.

1. **Back up the build, then prune old backups.** As `kd`, copy `dist/` to
   `/srv/kd-backups/dist.bak-<date-time>`:
   `cp -a /srv/kd-site/dist /srv/kd-backups/dist.bak-$(date +%Y%m%d-%H%M)`.
   This is the rollback: copy it back over `dist/`
   (`rm -rf /srv/kd-site/dist && cp -a /srv/kd-backups/dist.bak-<date-time> /srv/kd-site/dist`)
   and restart, and the old version runs again. Copy, not move, so the backup
   is still there for a second attempt. If an earlier deploy left a
   `dist.bak-*`, `.env.bak*`, `db-backup-*.sql` or `kd-schema-*.sql` in
   `/srv/kd-site`, move it to `/srv/kd-backups/` at the same time.

   **Only once that copy has succeeded**, prune, still as `kd`, from
   `/srv/kd-site`: `bash scripts/prune-backups.sh /srv/kd-backups`. If the
   copy failed, do not prune; stop and find out why. The script keeps the
   newest 5 `dist.bak-*`, deletes `.env.bak*`, `db-backup-*.sql` and
   `kd-schema-*.sql` older than 30 days but always keeps the newest of each
   kind however old, so there is always a rollback point, and touches
   nothing else — no symbolic link is followed, nothing outside the folder
   is reached. It prints every file it deletes and every one it keeps
   (`--dry-run` prints the same and deletes nothing), and refuses, deleting
   nothing, if the folder is missing or is not `/srv/kd-backups`. The 30-day
   limit keeps backups well inside the 24-month deletion promise in
   `/privacy`: a dump holds job applications. On the deploy that first
   brings the script it is not in the site folder yet at this step, so that
   once, run it right after step 2's pull instead.
2. **Pull.** `git pull --ff-only` in the site folder, as the user that owns
   it. A server only pulls; it never commits (CLAUDE.md). Run `npm ci` only
   if `package-lock.json` changed.
3. **Migrate, as a database administrator — never as `kd_app`.** On an
   Ubuntu server where MySQL's root signs in over the local socket:
   `sudo mysql < db/migrate.sql`; otherwise `mysql -u <admin> -p <
   db/migrate.sql`. Safe to run any number of times. It prints, table by
   table, what it created or found already there, and whether a column had
   to be added. It runs **before** the build because a failed migration
   then leaves the running site untouched; the migrated schema works with
   the old code too, since the migration only adds.
4. **Build.** `npm run build` on the test server; on the real domain
   `npm run build:release`, which also refuses to build while a placeholder
   is left or `PUBLIC_SITE_URL` is wrong (G1). If the build fails, copy
   step 1's backup back from `/srv/kd-backups/` as described there and
   stop: the old process is still running from it.
5. **Restart** the service (`kd-site` on the test server).
6. **Check the five database flows.** `npm run check:db-flows`, run as the
   user that can read `.env`, against the running site. It sends a test
   application, finds and deletes it, adds and removes a paragraph on a
   project page, and adds and removes a job posting — all five must PASS,
   and it cleans up after itself. While it runs, a few seconds, the test
   posting shows on `/careers` and the test paragraph on one project page.
   Where email is set up (G7) it skips the application steps unless given
   `--allow-email`, because the test application would then be emailed to
   HR; on production, tell HR before using it.
7. **Read the service log since the restart.** No line may say
   "command denied".

**First install only** (a new production server): create `/srv/kd-backups/`
as above; run step 3 first, which creates the database and its tables; then
create `kd_app` and give it exactly the grants at the foot of
`db/migrate.sql` — a table-level grant needs the table to exist — and only
then write `.env` and start the site.

**When the schema changes later**, the change goes into `db/migrate.sql`
(create if missing; alter only after an `information_schema` check), a new
table gets its grant line at the foot of that file, and the next deploy runs
it at step 3. The app itself never runs a schema statement (CLAUDE.md).

## Closed on 2026-10-12 — phone layout, share card, descriptions, structured data

None of these was a placeholder or a sign-off; they were faults found by
loading the site on a phone and in a search result. Recorded here so the next
review does not look for them again.

| # | What was wrong | Done | Commit |
| --- | --- | --- | --- |
| 1 | `/about` on a phone: hero quote cut off, the four-across Philosophy and HSE cards overlapping, directors squeezed two to a row | Phone and tablet layout built; desktop untouched | `a94c0c4` |
| 2 | `/company` on a phone: "Kailashchandra" ran off the screen — and so did the `/clients` and `/careers` titles, the same heading | Hero titles scale down below 480px wherever that heading is used; no word is hyphenated or broken | `26b834b` |
| — | Found by the same sweep: the title of all ten railway project pages was cut off mid-word on a phone; the homepage pull-quote pushed the page sideways at 360px; a badge was clipped on two `/projects` cards | Fixed the same way | `722103b` |
| 3 | No preview image for a link to a page without a photograph | G3 above | `589f08b` |
| 4 | Meta descriptions up to 394 characters; a search result cuts off near 160 | 22 rewritten to 155 or less, cut from the old wording with nothing added. All 34 pages now measure 78–155 | `ad9913b` |
| 5 | Nothing told a search engine that the office is a place | `GeneralContractor` (schema.org's LocalBusiness for a construction firm) JSON-LD on `/contact`: name, address, both phone numbers, URL, logo and the map embed's own coordinates — nothing that is not already on the site | `10421ac` |

**How it was checked.** Every route in the sitemap plus the 404 — 35 pages —
loaded at 360, 390, 768 and 1280px wide: no horizontal scroll, no text wider
than its box or clipped by a container, no text drawn over other text, no
broken image, no script error (the 404's own "404" in the console is the page
doing its job). At 1280, 1440 and 1920 every page is element-for-element the
same as `09255e5` — position, size and computed style of all 14,517 elements —
and `/about` and `/company` are pixel-identical at all three.

**Left as found**, because they are outside what was asked: below 360px wide
(a 320px phone) the footer's bottom line is 14px too wide on every page and
three pages have a value that does not fit; `/projects` still has desktop
gutters and a 72px title on a phone, which works but was never tuned; and the
share image of a page *with* a photograph is served as WebP, which some link
previews may not draw.

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
