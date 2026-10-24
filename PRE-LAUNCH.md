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

**Last updated:** 2026-10-24 · **40 placeholders on the site** — the number `npm run check:placeholders` prints. It was 43 until 2026-10-24, when the Vindhane plant in-charge's answers filled all three on `/resources/vindhane-plant`: capacity, covered area and start, and the team and covered areas (rows 4a–4c, −3; OPEN-QUESTIONS.md #65). It was 45 until the evening of 2026-10-21, when the Rabale Skywalk's photographs, filed with Bonkode's until then, gave it a real tile picture and a gallery (rows 3c and 7g, −2; OPEN-QUESTIONS.md #59). It was 42 until 2026-10-21, when Sir's change pass (OPEN-QUESTIONS.md #58) made the Kharghar Centre of Excellence its own project again, bringing back its tile and its page's three placeholders (rows 3b and 5h reopened, +4), and retired the `/hse` "Other certifications & certificate details" card (row 2, −1). `/company`, `/capabilities`, `/resources`, `/clients` and `/csr` are sections of `/about` since that day (`/about#csr` and so on); the rows below name them that way. It was 47 until 2026-10-19, when Sir's answers (OPEN-QUESTIONS.md #56) filled the Rabale Skywalk's client tile (row 7g) and folded the Kharghar Centre of Excellence into the football stadium, taking its tile and its page's three placeholders with it (rows 3b, 5h). The 25 open rows below (28 until 2026-10-24) cover them, several rows holding more than one (16 are on the older "Beyond the railway" project pages, rows 5b–5g; 13 on the eight works from K.D.'s own list of completed works, rows 3c and 7a–7h; 1 on `/careers`, row 6). Before that: 46 until 2026-10-16, when the fire drill's date became one (row 2b, OPEN-QUESTIONS.md #53); 62 until 2026-10-15, when representative images filled eight tiles and their pages (OPEN-QUESTIONS.md #48); 36 until 2026-10-13, when K.D.'s list of completed works added its eight works · **23 sign-offs** (S1–S23; S12, S13 and S16 answered, S2, S15 and S17 in part; S18, added 2026-10-21 for the plant engineer, answered 2026-10-22; S19 and S20 for Sir, added 2026-10-21; S21 for Sir and S22 for the HSE executive, added 2026-10-22; S23 for the Vindhane plant in-charge, added 2026-10-24) · **4 certificate rows** (C1 and C2 done on the evening of 2026-10-21, C3 and C4 files missing) · **8 go-live configuration rows, 7 still open** (G3 closed 2026-10-12) · **1 launch blocker** from Sir: a lawyer reviews `/privacy` and `/terms` first (S9)

---

## Placeholders on the site

| # | Where | Shown as | What K.D. has to supply | If it does not exist |
| --- | --- | --- | --- | --- |
| 1a | `/about#csr` (was `/csr`) · Content Pending · card 1 | **Formal CSR programmes** · To be added | What structured CSR activity the company runs or funds, where, since when, annual spend | "Not applicable" (below Companies Act §135 threshold) — delete the card |
| 1b | `/about#csr` (was `/csr`) · Content Pending · card 2 | **Community partnerships** · To be added | Local initiatives near Dhule, Navi Mumbai, Raigad; NGOs / trusts / schools / civic bodies worked with | Delete the card |
| 1c | `/about#csr` (was `/csr`) · Content Pending · card 3 | **Education & skilling initiatives** · To be added | Apprenticeships, ITI / college tie-ups, worker upskilling, scholarships, site schools — with numbers | Delete the card |
| 1d | `/about#csr` (was `/csr`) · Content Pending · card 4 | **CSR committee & governance** · To be added | Whether a CSR committee exists, members, the policy | Delete the card |
| ~~2~~ | ~~`/hse` · Certifications · card 4~~ | ~~**Other certifications & certificate details** · To be added~~ | ✅ **Retired 2026-10-21** (OPEN-QUESTIONS.md #58). Sir's own sentence, which he typed into this card on 2026-10-09, now has a card of its own ("Recognition by Indian Tax Authorities", card 6), and the certificates themselves now come as files with their details read off them (rows C1 to C4, below). The card keeps its slot (`retired`), so its keys `hse.sections.1.items.3.*` are never given to other text, and **Sir's saved row on the server is untouched: it simply no longer shows**. What it asked for is now rows C1 to C4: certificate numbers, validity and certifying bodies (ISO), and the PWD licence | — |
| 2b | `/hse` · Emergency Preparedness · the fire drill card (card 5), over its clip | **Mohape site** · To be added (the date) | The date of the fire mock drill. K.D.'s HSE executive confirmed the site on 2026-10-16, not the date; the camera's stamp on the photographs reads 31 July 2026, and no document in the repo gives one (OPEN-QUESTIONS.md #53). On a date: put it in the card's `where` (`Mohape site · <date>`) and delete `pending` | Delete `pending`: the card stands with its site only |
| ~~3a~~ | ~~`/projects` · Beyond the railway · tile 7~~ | ~~**Kharghar Football Stadium** · Photograph to be added~~ | ✅ **Closed 2026-10-15** with a **representative image** the user supplied (`Kharghar Football Stadium/`), captioned "Representative image" on the tile and the page header, the same treatment as row 3c (OPEN-QUESTIONS.md #48). Sir's allowance of 2026-10-13 named the eight works of row 3c, not this one; on **2026-10-19 he allowed it** (S15, OPEN-QUESTIONS.md #56). A real photograph of the stadium still replaces it | — |
| 3b | `/projects` · Beyond the railway · tile 8 | **Kharghar Centre of Excellence** · To be confirmed | A yes that it is K.D.'s own work, plus one photograph. The facility itself (CIDCO, two pitches, inaugurated 2022) is on record from public sources; K.D.'s part is not. **History:** folded into the stadium on 2026-10-19 (Sir, OPEN-QUESTIONS.md #56); **its own project again on 2026-10-21** (Sir, #58), its tile and page back as they were, no image | A no deletes the tile **and** the name from the at-a-glance list in `K.D.Website_Details.md` |
| ~~3c~~ | ~~`/projects` · Beyond the railway · tile 15~~ | ~~**Rabale Skywalk** · Image to be added~~ | ✅ **Closed 2026-10-21** with **real photographs**, not a representative image: the Rabale Skywalk's frames had been filed in `Bonkode FOB/`, and the user sorted them into `Rabale Skywalk/` (OPEN-QUESTIONS.md #59). The tile is the frame that was Bonkode's tile until then; the Bonkode tile is now a Bonkode frame. All eight works of this row now have a picture | — |
| ~~4a~~ | ~~`/resources/vindhane-plant` · hero · tile 1~~ | ~~**Annual capacity** · To be added~~ | ✅ **Filled 2026-10-24** from the Vindhane plant in-charge (WhatsApp, 24 Oct 2026; Sir said on 2026-10-21 that the plant's word can be taken for the plant): the tile reads **100 to 120 MT · Fabrication per month**. Same tile, same place, keys `resources.plant.stats.0.*` (OPEN-QUESTIONS.md #65) | — |
| ~~4b~~ | ~~`/resources/vindhane-plant` · hero · tile 2~~ | ~~**Plant area & year** · To be added~~ | ✅ **Filled 2026-10-24**, same source: **14,800 sq ft · Covered area, fabricating since Sep 2024**. The figure is the five covered areas summed (the row of 4c lists them); no yard area was given, so none is on the page. Sep 2024 is when fabrication started and the first materials were dispatched. Keys `resources.plant.stats.1.*` (#65) | — |
| ~~4c~~ | ~~`/resources/vindhane-plant` · How it is equipped · last row~~ | ~~**Machine inventory** · To be added~~ | ✅ **Filled 2026-10-24**, same source, as a team and covered-areas row: a team of 33 (4 staff, a 19-person fabrication crew, 10 on civil work, by role, no names) and the five covered areas with their sq ft. **No machine count was given** (welding sets, cutting lines, cranes) and none is written or implied; if K.D. sends them, they go in a new row appended after this one, which moves no key. Key `resources.plant.machinery.items.9.text` (#65). **Later the same day** his machine list arrived ("The Vindhane plant in-charge's machine list, 2026-10-24", below): the counts went into the rows they make specific, this row's team and covered areas became two lists of their own below the machinery (`resources.plant.areas.*`, `resources.plant.team.*`), and slot 9 now holds "3 core drill machines" (OPEN-QUESTIONS.md #66) | — |
| 4d | `/resources/rmc-plant-karjat` · hero · tile 1 | **Production capacity** · To be added | Output of the Karjat RMC plant, in m³ per hour or per day. **Ask the RMC plant's own contact** for 4d to 4f, not Vindhane's (2026-10-24) | Delete the tile |
| 4e | `/resources/rmc-plant-karjat` · hero · tile 2 | **Plant area & year** · To be added | Site area (sq ft or acres) and the year the plant was commissioned. Ask the RMC plant's own contact (see 4d) | Delete the tile — with 4d also gone, the hero stands without figures |
| 4f | `/resources/rmc-plant-karjat` · How it is equipped · last row | **Plant specifications** · To be added | Batching plant make and capacity, number of transit mixers and pumps, any on-site testing lab (the enclosure, silos and covered bays are now on the page, from the photographs). Ask the RMC plant's own contact (see 4d) | Delete the row — the four equipment lines stand |
| ~~5a~~ | ~~`/projects/bonkode-fob` · hero tile 3~~ | ~~**Scope of works** · To be added~~ | ✅ **Closed 2026-10-13.** K.D.'s own list of completed works has the contract as "Construction of Skywalk at Khairane Bonkode on Thane Belapur Road", so the tile reads **Construction · Scope of works**. Which parts K.D. built itself (foundations, steelwork, cladding, lifts, ramps) is still not on record; add it to the page if K.D. wants it said. The client on this page is now a sign-off: S12 | — |
| 5b | `/projects/ulwe-hospital` · hero tiles 3, 4 | **Scope of works · Year completed** · To be added | What K.D. delivered; the year it was handed over | Delete the tile; CIDCO and 20,000 sq ft stand (but see S7) |
| 5c | `/projects/ulwe-cidco-school` · all four hero tiles | **Client · Built-up area · Scope of works · Year completed** · To be added | Client (CIDCO?); area, floors, classrooms; scope; year handed over | Delete each tile K.D. cannot fill. If all four go, the page is a name, a place and two photographs — decide whether it stays a page or goes back to a tile only |
| 5d | `/projects/karanjade-health-care` · all four hero tiles | **Client · Built-up area · Scope of works · Year completed** · To be added | Client; area and floors; scope; year | As 5c |
| 5e | `/projects/kharghar-golf-course` · hero tile 4 | **Year completed** · To be added | The year the clubhouse was handed over. The scope tile was filled on 2026-10-13: K.D.'s own list of completed works has the contract as "Construction of Club House for golf course at Kharghar", so it reads **Clubhouse · Scope of works** and the overview says K.D. built the clubhouse. Client **CIDCO** and **103 ha** are filled (S8); Sir confirmed CIDCO as the client on 2026-10-19 (S12). No cost is quoted: sources disagree (₹109.65 cr vs ₹50.35 cr) | Delete the tile |
| 5f | `/projects/lush-meadows` · hero tiles 3, 4 + overview card | **Scope of works · Year completed** · To be added; **Figures from a property portal** · To be verified | Scope and year; **and** a check of MahaRERA A51800000454 on the MahaRERA site — the developer (Kailash Developers), 2 & 3 BHK and 711–852 sq ft are Square Yards portal data | Registration does not match: remove the developer and flat tiles and the second half of the paragraph. Checked and matches: delete the card |
| 5g | `/projects/kharghar-football-stadium` · hero tiles 3, 4 | **Scope of works · Year completed** · To be added. (The **Photographs** card closed on 2026-10-15: the page header is now the representative image of row 3a, and the page has no gallery block until real photographs exist) | Scope and year (client **CIDCO** and the **40,000 planned capacity** are filled — S8). From 2026-10-19 to 2026-10-21 the page also carried the Centre of Excellence's facts; since 2026-10-21 the centre is its own page again (row 5h) and this page is as it was before. Real photographs of the stadium would still replace the representative image and give the page a gallery | Delete each tile K.D. cannot fill |
| 5h | `/projects/kharghar-centre-of-excellence` · the whole page | **K.D. Constructions' own work?** · To be confirmed; hero tile 3 **Scope of works** · To be added; **Photographs** · Photograph to be added | First the yes/no (with 3b). On a yes: K.D.'s scope and a photograph — client, pitches, 2022 and the description are filled from public sources (S8). Reopened 2026-10-21 (OPEN-QUESTIONS.md #58): the page answers 200 again, not a 301 to the stadium | A no deletes the page's entry in `src/data/social-projects.ts`, the tile (3b) and the name in `K.D.Website_Details.md` — delete the tile first, or the module refuses to build a tile with no page |
| 6 | `/careers` · Where We Hire · card 2 | **K.D. Constructions on Indeed** · To be added | The URL of K.D. Constructions' company / jobs page on Indeed. (The individual job cards are **not** placeholders: an editor adds and removes them on the page itself in edit mode — "Add a job posting" card, "Remove posting" on each) | Delete the card — the LinkedIn card stands |
| 7a | `/projects/ghansoli-roads-and-services` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c; replaced 2026-10-16 with one without lettering, S15) | The year the work was handed over | Delete the tile |
| 7b | `/projects/kamothe-peripheral-roads` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |
| 7c | `/projects/vashi-station-approach-road` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |
| 7d | `/projects/ulwe-mass-housing-infrastructure` · hero tiles 2, 4 | **Extent of works · Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | Road length, area served or the main quantities; the year | Delete each tile K.D. cannot fill |
| 7e | `/projects/ulwe-sector-8-infrastructure` · hero tiles 2, 4 | **Extent of works · Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c; replaced 2026-10-16 with one without lettering, S15) | Road length, area served or the main quantities; the year | Delete each tile K.D. cannot fill |
| 7f | `/projects/kharghar-33-kv-substation` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |
| 7g | `/projects/rabale-skywalk` · hero tiles 2, 4 | **Length & width · Year completed** · To be added. (The **Client** tile closed on 2026-10-19: **NMMC**, Sir's answer to S12; the **Image** card on 2026-10-21, with its own photographs, row 3c) | The skywalk's length and width; the year | Delete each tile K.D. cannot fill |
| 7h | `/projects/nmmc-school-no-54-and-55` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |

**If all four CSR cards are deleted** (the CSR section of `/about` since 2026-10-21)**:** the section keeps its three commitments
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
| S1 | `/about` · Company section · Board of Directors (since 2026-10-21 the only board on the site; About's own text-only board is retired) | Names, roles, bios of the four directors, and the surname spelling — the site has **Gindodia**, the brief has **Gindodi** | `K.D.Website_Details.md` §Leadership: *"Please collect the leadership data… or ask Sir for the correct guidance/details before finalising"* (OPEN-QUESTIONS.md #25) |
| S2 | `/about` · Board of Directors | Whether portraits are wanted. The approved design has no portrait slot; adding one is a design change, so this is a question, not a placeholder. **2026-10-21:** answered in effect: Sir asked for the directors to appear once, the version with portraits (OPEN-QUESTIONS.md #58); the portraits themselves are S11 | STRUCTURE.md page inventory: "⬜ bios and portraits" |
| S3 | `/about#csr` (was `/csr`) · Community Impact | Whether K.D. is comfortable presenting contract work (Z-Bridge, station redevelopments) under a CSR heading | WEBSITE_INFO.md rule 8; CONTENT.md §CSR |
| S4 | `/resources/vindhane-plant` · Plant Gallery | Whether the EOT-crane photograph (PHOTOS.md B21, `Vindhane Plant/vindhane-shed-eot-crane.png`) is the Vindhane shed. A yes adds it as the third gallery tile; nothing is on the page until then. **Still open on 2026-10-24:** the plant in-charge's crew list (OPEN-QUESTIONS.md #65) confirms an EOT crane operator at Vindhane, not that this photograph is that shed. **Still open after the afternoon pass (OPEN-QUESTIONS.md #66):** his own two photographs and short video of the crane shed, sent on WhatsApp on 24 Oct to settle this, are not on the development PC (not in `Vindhane Plant/`, and not among the newest WhatsApp files anywhere on it), so nothing could be compared with B21. Once they are in `Vindhane Plant/`, this row is decided on them | It sits on the annual deck's Vindhane slide but is uncaptioned there (PHOTOS.md B21 ⬜; OPEN-QUESTIONS.md #33). Separately: RDSO girder certification is *in progress*, not held, and is deliberately absent from the page (docs/CONTENT.md §Steel Fabrication) |
| S5 | `/404` · the whole page | The wording of the error page — kicker, headline, one sentence, button label. It is authored in the site's voice, not taken from the brief, because no source document covers an error page. Change it in `src/data/not-found.ts` (it is deliberately not in-page editable — OPEN-QUESTIONS.md #35) | Nothing in `K.D.Website_Details.md` or `docs/` describes a 404; the copy is the build's (OPEN-QUESTIONS.md #35) |
| S6 | `/projects/bonkode-fob` and `/projects/kharghar-golf-course` · hero tile and overview | Bonkode: "72 × 3 m", "on the Thane–Belapur road, connecting Bonkode village to the TTC industrial belt". Golf course: "a modern building with premium finishes, set in landscaped grounds". Right as stated? | The company's Company Profile deck, slide 10 — its own words, but not the approved brief, and the slide swaps the two captions (OPEN-QUESTIONS.md #36) |
| S7 | `/projects/ulwe-hospital` · hero tiles 1–2 and overview | That the building on the Ulwe Hospital tile is the deck's "CIDCO Urban Health Centre" — client **CIDCO**, **20,000 sq ft**, fire systems, stack parking, completed on time. If it is the Karanjade building instead, both pages' facts and photographs swap | Attributed by photograph: the deck's picture is `Ulwa Hospital/1.jpg`, but the deck names no node, and an earlier read (#28b) matched it to Karanjade by name. The two folders already disagree about one photograph (#30) |
| S8 | `/projects/bonkode-fob`, `kharghar-golf-course`, `lush-meadows`, `kharghar-football-stadium`, `kharghar-centre-of-excellence` (folded into the stadium's page 2026-10-19, its own page again 2026-10-21) · hero tiles and overviews | Everything added on 2026-09-28: Bonkode (NMMC, 2012, 72 m tubular steel, lifts and ramps, architect THE FIRM); golf course (CIDCO, 103 ha, 18 holes, par 72, 7,137 yd, designer Vijit Nandrajog, reopened April 2026, PGTI); stadium (CIDCO, planned 40,000, FIFA-approved); Centre of Excellence (CIDCO, Sector 33, two pitches inaugurated Jan 2022, AFC Women's Asian Cup / FIFA U-17 Women's World Cup). No page claims the centre is in use — a Jul 2026 FPJ report says it has sat largely unused | Public sources (WorldArchitecture, THE FIRM, CIDCO, Golf Course Architecture, WIFA, Free Press Journal), not K.D. — right facts, but K.D. should see them before they carry its name |
| S9 | `/privacy` and `/terms` · the whole of both pages, and the consent line on the `/careers` form | **LAUNCH BLOCKER (Sir, 2026-10-19): a lawyer reviews both pages before launch**, and the review covers the careers form's 24-month consent line too (OPEN-QUESTIONS.md #56). **Legal review of the wording** by K.D. or its lawyer. They are a first draft (2026-10-09), written to describe what the site actually does, not legal advice. Specifically confirm: the **Grievance Officer** (drafted as "the Head of HR, hr@kdconstructions.net" — the DPDP Act and IT Rules 2011 expect a named contact); the **24-month** retention (if changed, change `RETENTION_MONTHS` in `src/lib/applications.ts` and the careers consent line too); **courts at Mumbai** in the terms; and that the site is on **HTTPS** at launch, which the privacy policy states. Edit in place (keys `privacy.*`, `terms.*`) or in `src/data/legal.ts`, and update the "Last updated" line | Neither page was in the brief or design; added when `/careers` began collecting applicants' personal data |
| S10 | `/about#clients` (was `/clients`) · Railways · WPO, IRCON; Public Sector · FCI | Added 2026-10-09 at the client's request. Say which works were for each — the cards carry only the organisations' names. **2026-10-19, WPO:** Sir's mail (a completion certificate, OCR'd, cut off at the end) is the **Matunga Workshop** contract, so the WPO card links to `/projects/matunga-workshop` and that page names WPO as its client, with three building areas from the certificate (OPEN-QUESTIONS.md #56). **2026-10-21, Sir:** the Indian Railways card is retired, so WPO's card is the one that links Matunga Workshop (and COFMOW's the LHB facilities), and every railway link reads as its page's title (OPEN-QUESTIONS.md #58). **Still for Sir:** confirmation that WPO's work is this contract and not another (the change is one commit and reverts cleanly); IRCON and FCI still list no works | Client feedback, 2026-10-09 |
| S11 | `/about#company` (was `/company`) · Board of Directors · portraits | Sir to confirm the current photos or send alternate photos | Client feedback, 2026-10-09 |
| ~~S12~~ | ~~`/projects/bonkode-fob`, `/projects/kharghar-golf-course`, `/projects/rabale-skywalk` · hero tile 1 (Client); `/clients` · the CIDCO and NMMC cards~~ | ✅ **Answered 2026-10-19 by Sir:** the **Bonkode** and **Rabale** skywalks were for **NMMC**; the **Kharghar golf course clubhouse** was for **CIDCO**. So the Bonkode and golf course pages keep the client they had; the Rabale page's client tile is now **NMMC** (it was a "To be confirmed" placeholder, row 7g); and the three works are linked on `/clients`: Kharghar Golf Course on the CIDCO card, Bonkode FOB and Rabale Skywalk on the NMMC card (OPEN-QUESTIONS.md #56). K.D.'s list of completed works had them the other way round (CIDCO for both skywalks, NMMC for the clubhouse), a filled-down department column | The list (a screenshot, 2026-10-13, OPEN-QUESTIONS.md #44) against the sources behind S8 |
| ~~S13~~ | ~~`/hse` · Emergency Preparedness · the heat-stress and Karjat drill cards (since 2026-10-15 one card each in the drill register, OPEN-QUESTIONS.md #50)~~ | ✅ **Answered 2026-10-16** by K.D.'s HSE executive. (1) Yes: an Emergency Mock Drill, Heat Stress (Heat Stroke), at the **Karjat site**, 08/10/2026; the card now says so. (2) The Karjat drill's times, 14:53, 14:55 and 15:00, are **correct** and stay; **Sir approved keeping them on 2026-10-19** (OPEN-QUESTIONS.md #56). (3) **No originals are coming**: the photographs from the report stay as they are (OPEN-QUESTIONS.md #53) | "Heat stress" is the name of the folder the ten photographs came in; nothing in them says so, and nothing names the site. The Karjat details are from the site's own mock drill report of 17 April 2026 (a PDF in the same folder) — a site report, not something written for publication. No name from either is on the site |
| S14 | `/hse` · Emergency Preparedness · the fire drill card (headed by the site's clip) and the snake-bite card, cards 5–6; `/gallery` · Safety on Site · the last 21 photographs | **2026-10-16, answered by K.D.'s HSE executive:** (1) the site is right (**Mohape site**); the date is **not confirmed**, so the card's date is a placeholder, row 2b. (2) The man in the green helmet is **K.D.'s HSE executive**; the captions now say so, by role, no name. (3) The snake-bite drill was at the **Karjat site** on **27 August 2026** (as the card says); its **originals are coming later**, and the photographs stay as they are until then. **Still open: (3), the originals.** The questions were: **For Amritanshu, K.D.'s HSE executive — three questions.** (1) The fire drill: are **Mohape, 31 July 2026** right? Both are read off the GPS camera's stamp on the photographs (14:16 to 14:23, "Poyanje (Mohope), Station Road"). (2) Who is the man in the green helmet who demonstrates the extinguisher? The captions call him "the instructor" and the two in white helmets "supervisors". (3) The snake-bite drill's **original photographs**, if they exist: the only copies are the small ones in the report (416 to 541 px wide, four of them squeezed and stretched back); since 2026-10-15 the clearest, 712 px wide, heads the drill's card on `/hse`, a little enlarged | The fire drill's six points are the HSE team's own seven discussion points (pasted by the user on 2026-10-15). The snake-bite card is the site's mock drill report of 27 August 2026 (RMC Plant, Karjat) and the HSE team's RIGHT rule and don'ts, given in Hindi and put into English. The report names its coordinators and is signed; no name is on the site. OPEN-QUESTIONS.md #47 |
| S15 | `/projects` · Beyond the railway · tile 7 and `/projects/kharghar-football-stadium` · hero; the eight representative images (tiles 7, 9–14, 16) | **(1) answered 2026-10-19: Sir allows the stadium's representative image; it stays.** (2) is still open (being clarified with Sir, OPEN-QUESTIONS.md #56). **For Sir, two questions.** (1) **May the football stadium carry a representative image?** On 2026-10-13 he allowed generated, captioned images for the eight works from K.D.'s own list; the stadium is not one of them, and row 3a asked for a real photograph. On 2026-10-15 the user supplied a generated image for it with seven of the eight, and it is on the site captioned "Representative image" like theirs. A no puts the "Photograph to be added" tile back. (2) **The signs in the images.** All eight show generated lettering and emblems of real bodies: CIDCO (stadium, Vashi, Ulwe Mass Housing), NMMC (the school), MSEDCL's "Mahavitaran" (the substation), brand hoardings, and Marathi place-name boards. Two **contradict their pages**: the Ghansoli image has a board reading "NMMC · Ghansoli Roads & Services" and "Navi Mumbai Municipal Corporation" road signs, and the Ulwe Sector 8 image an NMMC road sign, but both pages give the client as **CIDCO** (and Ulwe is a CIDCO node, not NMMC's area). The caption says the picture is not a photograph; confirm the signs are acceptable, or ask for versions without them, at the least for those two. **2026-10-16:** those two are **replaced** with images that carry no lettering at all, so neither contradicts its page now; question (2) stands for the other six, and is **being clarified with Sir** (2026-10-19); no change until he answers | OPEN-QUESTIONS.md #48, #52, #54 |
| ~~S16~~ | ~~`/hse` · the whole page, and the four stat tiles under the hero~~ | ✅ **Answered 2026-10-19: Sir approved the /hse layout, desktop included** (OPEN-QUESTIONS.md #56). The note under the tiles is now his own sentence. The question was: **For Sir — one sign-off:** `/hse` was rearranged on 2026-10-15, desktop included. The drills are one card each (picture at the head, steps behind a toggle), the Training, Worker Health and Recognition photographs sit beside their cards, and four stat tiles open the page. No fact was removed. **The three tile questions were answered on 2026-10-16** by K.D.'s HSE executive and the tiles corrected (OPEN-QUESTIONS.md #53): 3,00,000 is the **Karjat site's** figure as of **7 March 2026**; the drills are **8+** so far in 2026; the camp was **50** workers and staff, not 88.  The questions were: **For Amritanshu, K.D.'s HSE executive — three questions on the tiles.** (1) **3,00,000 safe man-hours without a lost-time injury** is read off the Karjat banner ("as on January 2026"; OPEN-QUESTIONS.md #42 already asked): is it right, is there a newer figure, and is there a company-wide one or an LTIFR that should lead instead? (2) **7 site mock drills in 2026** counts the drills on the page: were there more? (3) **88 workers and staff in one medical camp**: right to headline? | The layout was the user's call ("bloated, not arranged", 2026-10-15); the four figures are the page's own, gathered. OPEN-QUESTIONS.md #50 |
| S17 | `/resources/vindhane-plant` · The Plant · the clip beside the four paragraphs | **2026-10-19, Sir:** (1) the desktop layout is **approved**; (2) the girder is for the **Mankhurd FOB**, and the caption read "A girder for the Mankhurd FOB, loaded for dispatch" until **2026-10-21**, when Sir said the plant engineer's word goes for this clip: it read "A girder loaded for dispatch at Vindhane", naming no project, until **2026-10-22**, when it became **"Mankhurd deck"** (S18, OPEN-QUESTIONS.md #58, #61). **Still open: (3), the original video file, which is coming from site staff** (OPEN-QUESTIONS.md #56). The questions were: **For Sir, three things.** (1) **Sign off the desktop change:** since 2026-10-15 the plant's own video (a painted girder on a trailer in the yard) plays, silent and looping, in the right half of the band, which was empty; nothing else on the desktop page moved. (2) **Which girder is it?** Name the project and the caption ("A painted girder loaded for dispatch") can say so and link to its page. (3) **The original video**, if there is one: this copy is 640 × 368, likely a forwarded one, and a little soft on a sharp screen | The user's file `Vindhane Plant/Vidhane_Factory.mp4` (OPEN-QUESTIONS.md #51) |
| ~~S18~~ | ~~`/resources/vindhane-plant` · The Plant · the clip's caption and alt text~~ | ✅ **Answered 2026-10-22** (the user's brief): the caption is **"Mankhurd deck"**, and the alt opens with it ("Mankhurd deck: a long painted steel girder loaded on a multi-axle trailer for dispatch in the Vindhane plant yard, …"); the line above it, "Plant yard, Vindhane", is unchanged (key `resources.plant.clip.title`, OPEN-QUESTIONS.md #61). The question was: **Owner: the plant engineer (via Sir).** Sir, 2026-10-21: the plant engineer's word goes for this clip. Until he gives it, the caption is neutral, "A girder loaded for dispatch at Vindhane", and the alt names no project (key `resources.plant.clip.title`, OPEN-QUESTIONS.md #58). On his word: put his caption in `src/data/plant.ts` (`plant.clip.title`, and `alt` to match) | The 2026-10-19 caption named the Mankhurd FOB on Sir's earlier word (S17) |
| S19 | `/about` · the order of the sections | **For Sir:** "On the About page, the sections now run About, Company, Capabilities, Resources, Clients, CSR. Is this order OK?" A different order is one list (`aboutSections` in `src/data/pages.ts`); no key moves with it | Sir's change pass, 2026-10-21 (OPEN-QUESTIONS.md #58): the About menu's pages became one page, in the order the brief gave |
| S20 | `/hse` · Certifications · the PWD electrical licence card | **For Sir:** "Do we have a scan of the PWD electrical licence to show on the site like the ISO certificates?" With one, it goes in `PWD_Licence/` and gets a "View certificate" button like the others (row C4) | Sir's change pass, 2026-10-21 (OPEN-QUESTIONS.md #58) |
| S21 | `/projects/solapur-vande-bharat-maintenance-depot`, `/projects/lower-parel-railway-redevelopment`, `/projects/panvel-karjat-railway-line`, `/projects/mumbai-harbour-line-station-redevelopment` · hero, and the same four cards on `/projects` | **For Sir:** "Four project pages show a photograph of other K.D. work because we have none of the project itself: Solapur (a Vande Bharat rake in a Matunga shed), Lower Parel (a platform, from the Nhava Sheva folder), Panvel–Karjat (the workforce at Mankhurd) and Harbour Line Station Redevelopment (a station under construction, also from the Nhava Sheva folder). Since 22 Oct 2026 their descriptions for search engines and link previews say 'Representative image'; nothing is written on the page. Can you send a photograph of each project, or confirm these may stay?" A photograph replaces the stand-in (`image` in `src/data/project-detail.ts`, and drop its `imageKind`); a yes may add a visible "Representative image" caption, which is a desktop change | The pre-launch SEO check, 2026-10-22 (OPEN-QUESTIONS.md #19b, #62) |
| S22 | `/gallery` · Safety on Site, and the Gallery tab on `/projects` · photographs `hse-07` to `hse-39` | **For Amritanshu, K.D.'s HSE executive:** "33 photographs from the 75,000 safe man-hours celebration at Mankhurd share four captions, so search engines see the same description up to nine times. If you can tell us who is receiving each certificate (role or crew, no names needed) or anything else that tells one from the next, each gets its own caption. Several look like the same moment taken twice: say which to drop." Captions are changed in `/studio/gallery` (never in code once one is saved there) | The pre-launch SEO check, 2026-10-22: the captions were written in a cycle of four (OPEN-QUESTIONS.md #62) |
| S23 | `/resources/vindhane-plant` · How it is equipped · the row "Bending machinery", and "bending" in the plant's second paragraph | **For the Vindhane plant in-charge (via Sir):** "Your machine list of 24 Oct has no bending machine, but the page has said 'Bending machinery' since it was built, and its paragraph says the plant is 'equipped with welding, bending and cutting machinery'. Is there a bending machine at Vindhane? If yes, what is it and how many; if not, we take the row out and the word out of the paragraph." Until he answers, both stay as they are (keys `resources.plant.machinery.items.1.text`, `resources.plant.body.1`) | His machine list, 2026-10-24 (OPEN-QUESTIONS.md #66). The row and the paragraph came from `K.D.Website_Details.md` (the Vindhane paragraph: "Equipped with welding, bending and cutting machinery") |

---

## Certificates for `/hse` (2026-10-21)

Sir asked (2026-10-21, OPEN-QUESTIONS.md #58) for the certificates to be viewable on `/hse`, watermarked, in a viewer that discourages copying. The viewer and the build are in place. **That evening K.D. sent four PDFs, in `Certificates/`** (a folder the build now reads too, mixed): the three ISO certificates and the CBIC's Certificate of Appreciation. They are on the site since then, viewable from their `/hse` cards (the whole card is clickable) and from the footer's "Certified to" lines on every page (OPEN-QUESTIONS.md #60). Each row closes when its scan is put in its folder (project root, or its parent folder) and `npm run certificates:build` is run, then the details are read off it onto the card (`facts` in `src/data/pages.ts`: "Certificate number", "Certifying body", "Valid until"; an unreadable field is "To be added"), then the site is built. The folders are git-ignored and never served; only the watermarked copy in `src/assets/certificates/` is. **Expiry:** the script warns about any card whose "Valid until" is past or within 60 days. On 2026-10-21 the three ISO certificates are valid until 19 May 2029 (surveillance audits due 19 May 2027 and 2028); no warning. A certificate that is expired or about to expire becomes a launch blocker row here. **The server needs no scan:** the watermarked, scrambled images and `layout.json` are committed in `src/assets/certificates/`; `Certificates/` stays on this PC, git-ignored.

**Viewing stamp (2026-10-24, OPEN-QUESTIONS.md #64):** every certificate opened in the viewer carries "Viewed on kdconstructions.net · " and the visitor's own date, tiled across it, sharp or blurred, so a capture from any device, a phone's screenshot included, is plainly a dated copy from the website. Drawn by the viewer, not the build: no certificate is rebuilt for it; the wording is `certificateViewer.stamp` in `src/data/home.ts`.

| # | Certificate | Folder | Status |
| --- | --- | --- | --- |
| ~~C1~~ | ~~ISO 9001:2015, ISO 14001:2015, ISO 45001:2018 (three)~~ | `Certificates/` | ✅ **Done 2026-10-21.** `KD ISO 9001.pdf`, `KD ISO 14001.pdf`, `KD ISO 45001.pdf`, matched by their own text. QRO Certification LLP, certified 20 May 2026, valid until 19 May 2029; numbers 3050260520168Q, 3050260520170E, 3050260520169HS. All three on their cards as facts, and each opens from its card and its footer line |
| ~~C2~~ | ~~Recognition by Indian Tax Authorities~~ | `Certificates/` | ✅ **Done 2026-10-21.** `E-Certificate-27AACCK5158J1ZA.pdf` (K.D.'s GSTIN): the CBIC's Certificate of Appreciation for prompt GST returns and payment in financial year 2025–26, matched by a line in `scripts/certificates.map.json` (it is an image, no text to read). Sir's sentence stays as the card's body; the issuer and the year are its facts. No validity date on it |
| C3 | CIDCO registration | `CIDCO_Certificate/` | **Missing.** The card is live; nothing about class or category |
| C4 | PWD electrical licence | `PWD_Licence/` | **Missing**, and not yet known to exist as a scan (S20) |

---

## Sir's answers, 2026-10-19

Sir (Shiv Gindodia) answered the open questions on 2026-10-19. The site
changes are in OPEN-QUESTIONS.md #56, one commit each. This is the list,
including the answers that change nothing on the site.

| Question | Sir's answer | On the site |
| --- | --- | --- |
| /hse man-hours note | His own sentence, word for word | `hse.hero.statsNote` |
| PWD electrical licence | K.D. holds one, to execute electrical works | A card on `/hse` (Certifications, card 5), a sentence on `/capabilities`; its number and validity asked for in row 2 |
| Client of three works (S12) | Bonkode and Rabale skywalks NMMC; Kharghar golf course clubhouse CIDCO | Rabale's client tile; three links on `/clients`. S12 closed |
| Kharghar Football Stadium and Centre of Excellence | One project; the stadium's representative image can stay | The centre's tile and page went, its facts are on the stadium's page, its address answers 301 there. Rows 3b and 5h closed; S15 (1) answered |
| WPO's work | A completion certificate: the Matunga Workshop contract | The Matunga Workshop page names WPO, with three building areas; the WPO card on `/clients` links it. S10, in part |
| The Vindhane clip's girder (S17) | For the Mankhurd FOB | The caption names it; no link (the clip tile has none) |
| Karjat drill times (S13) | Keep them | No change: approved |
| Glass drop-down menus | Approved as they are | No change |
| /hse and Vindhane desktop layouts (S16, S17) | Approved | No change. S16 closed; S17 still waits for the original video file, coming from site staff |
| `/privacy` and `/terms` (S9) | A lawyer reviews them before launch, the careers form's 24-month consent line included | No change. **Launch blocker** |
| Bonkode FOB and Rabale Skywalk | Separate works; to be confirmed with site staff | No change: both pages stay |
| ISO certificates | Soft copies received; whether and how to show them is undecided | No change: no number, PDF or validity on the site (row 2) |
| Generated boards in six representative images (S15 (2)) | Being clarified with Sir | No change |
| About menu animation; directors on `/about` vs `/company`; `/clients` link wording (OPEN-QUESTIONS.md #49); the homepage Uran shot | To be discussed with Sir | No change |
| Whether the Matunga Workshop link moves off the Indian Railways card on `/clients` | Sir decides (tonight, 2026-10-19) | No change: it is on both the Indian Railways and the WPO card |

---

## Sir's change pass, 2026-10-21

The changes are in OPEN-QUESTIONS.md #58, one commit each; this is the list.

| What Sir asked | On the site | Rows |
| --- | --- | --- |
| The About menu's pages as one page | `/about` runs About, Company, Capabilities, Resources, Clients, CSR; the old addresses answer 301 to the sections; the directors appear once, with portraits | S19 asks whether the order is right; 1a–1d, S1, S3, S10, S11 now point at `/about` |
| HSE on the bar, CSR under About | Home · About ▾ · Projects ▾ · HSE · Careers · Contact | — |
| The careers form right under the openings | Current openings, Apply Here, Where We Hire, Why K.D., How to Apply | — |
| The revenue figures off the homepage hero | 53 Yrs and 50+ Owned Equipment Units, one row of two | — |
| The Indian Railways card off `/clients`; railway links as page titles | Card retired; WPO and COFMOW carry its two works; four labels changed to the page titles | S10 |
| Matunga Workshop: 2018 to 2021 | A "2018–2021 · Project Period" tile on its page | — |
| The Centre of Excellence its own project again | Its tile and page back, no image; the stadium as before 19 Oct | 3b, 5h reopened |
| A neutral caption for the Vindhane clip | "A girder loaded for dispatch at Vindhane" | S18 (the plant engineer) |
| Certificates viewable, watermarked; a Tax Authorities card; a CIDCO card | Viewer and build in place; two cards added; the old "certificate details" placeholder retired. That evening: four certificates on the site (OPEN-QUESTIONS.md #60) | C1, C2 done; C3, C4, S20 open; row 2 closed |

---

## The Vindhane plant in-charge's machine list, 2026-10-24

Source: K.D.'s Vindhane plant in-charge, on WhatsApp, 24 Oct 2026 (Sir said on
2026-10-21 that the plant's word can be taken for the plant). On
`/resources/vindhane-plant` since the same day, in "How it is equipped";
OPEN-QUESTIONS.md #66 has the change, and each row's edit key.

| As he gave it | On the page |
| --- | --- |
| Electrode welding sets: 6 · MIG (CO2) welding sets: 5 · SFW: 1 machine, full set | 12 welding sets: 6 electrode, 5 CO2 (MIG), 1 SFW |
| Gas cutters: 4 · PUG cutting machines: 2 | 4 gas cutters and 2 PUG cutting machines |
| Core drill machines: 3 | 3 core drill machines |
| Grinding machines (7 inch): 2 | 2 grinding machines (7 inch) |
| Air compressor: 1, full set (with its pressure) | Air compressor, full set (the pressure is left off) |
| Metalizing guns: 2 | Metalizing shop, 2 metalizing guns |
| Painting machines: 3 | Painting shop, 3 painting machines |
| Power: 125 kVA DG set, with MSEB grid supply | 125 kVA diesel generator, with MSEB grid supply |
| (no bending machine) | "Bending machinery" kept as it was: **S23** |

SFW and PUG are written as he wrote them, not expanded. No count beyond his
list is on the page. The two photographs and the video he sent with it are not
on the development PC yet, so they are not on the page and S4 stays open.

---

## Go-live configuration (not content — but the site does not rank without it)

These are not placeholders and nothing is marked on the page. They are the
things a search engine needs that only exist at deployment. OPEN-QUESTIONS.md
#34 has the audit.

| # | What | Why it blocks | Done when |
| --- | --- | --- | --- |
| G1 | **`PUBLIC_SITE_URL`** set in the production environment to the real https origin, e.g. `https://www.kdconstructions.net` — no path, no trailing slash | Every canonical, `og:url`, `og:image`, sitemap `<loc>` and the JSON-LD are written against it. Unset, they all say `http://localhost:4322`, which tells the crawler the real domain is a copy of a page it cannot reach | `npm run check:site-url` passes; `npm run build:release` runs it first and refuses otherwise |
| G2 | Submit `https://<origin>/sitemap.xml` in **Google Search Console** (and Bing Webmaster Tools) after the first deploy | The sitemap is served from the site, so it is not "submitted" by building; someone has to hand the URL over once | Search Console shows the sitemap read, 37 URLs discovered (as of 2026-10-21: the five pages merged into `/about` went, the Centre of Excellence page came back; fewer if any row 5 or row 7 page is deleted) |
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

### At the next deploy: the 2026-10-21 pass (OPEN-QUESTIONS.md #58)

Run on the server by its own Claude Code session, as always (CLAUDE.md). In this order:

1. **Take a database dump first** (`/srv/kd-backups/db-backup-<date-time>.sql`) and the usual build backup (step 1 above).
2. **Before pulling, read-only:** list the `content_edits` rows (latest per key) that this pass touches, so a surprise is known before it happens. None is changed by the pass; the list is for Sir where one now shows differently.
   - `page_path` in `/company`, `/capabilities`, `/resources`, `/clients`, `/csr`: every row. These pages are now sections of `/about`; step 4 copies them there.
   - `/about`: any row on a key starting `company.`, `capabilities.`, `resources.`, `clients.`, `csr.` (the migration skips those keys), and on `about.board.*` (retired: no longer shows).
   - `/`: `home.hero.stats.0.*`, `home.hero.stats.2.*` (retired).
   - `/hse`: `hse.sections.1.items.3.*` (retired: Sir's 2026-10-09 sentence there stops showing, by design, because it has its own card now, `hse.sections.1.items.5.*`). Any other `/hse` row must still name a key on the page.
   - `/clients` (copied to `/about`): `clients.sections.0.items.0.*` (the Indian Railways card, retired), and `clients.sections.0.items.3.links.0.label`, `.3.links.2.label`, `.4.links.0.label`, `.5.links.0.label` (same keys, new labels: a saved row would show over the new label).
   - `/resources/vindhane-plant`: `resources.plant.clip.title` (new neutral caption: a saved row would show over it).
   - `/projects/kharghar-football-stadium`: `projects.detail.body.2` (retired). `/projects/kharghar-centre-of-excellence`: every row (its keys are back). `/projects`: `projects.social.items.7.*` (back).
   - `project_text_events` with `page_slug = 'kharghar-centre-of-excellence'` (they show on that page again), and `gallery_events` / `gallery_uploads` with `target_group = 'Kharghar Centre of Excellence'` (from 2026-10-19 they landed on the stadium; now on the centre's own page).
   - **The Bonkode / Rabale photo split (OPEN-QUESTIONS.md #59):** `gallery_events` rows whose `file` is `social-bonkode-fob.jpg` (now applies to a different, Bonkode, picture), or `bonkode-fob-02`, `-04`, `-07` to `-15`, `-27.jpg` (those files are gone: the rows are skipped), and any row or upload with `target_group = 'Rabale Skywalk'`. `content_edits` on `/projects` with keys `projects.gallery.groups.13.*` to `.15.*` (the Rabale group took index 13, so the Vindhane, RMC and HSE headings moved to 14 to 16) and `projects.social.items.14.pending` / `.note` (gone); on `/projects/rabale-skywalk`, `projects.detail.photoNote.*` (gone).
3. **Pull** to the pushed commit. No schema change in this pass: `db/migrate.sql` is unchanged, so step 3 above reports "already there" throughout.
4. **The saved-edit migration, as the database administrator, after the dump:**
   - dry run, changes nothing: `sudo mysql < db/migrations/2026-10-21-about-merge.sql`
   - then the real run: `sudo mysql -e "SET @kd_apply = 1; SOURCE db/migrations/2026-10-21-about-merge.sql"`
   It only copies rows to `/about` (never moves or deletes), skips a key `/about` already has, and is safe to run twice. Keep both outputs for the report.
5. **Build, restart** (steps 4 and 5 above). Editors hard-refresh once.
6. **After, read-only:** every latest `content_edits` row on `/about`, `/hse`, `/projects/kharghar-football-stadium` and `/projects/kharghar-centre-of-excellence` names a `data-edit` key that is on that page now (none stranded); `/company`, `/capabilities`, `/resources`, `/clients`, `/csr` answer 301 to `/about#<section>`; `/projects/kharghar-centre-of-excellence` answers 200; the sitemap lists 37 URLs; every sitemap page loads.

### At the next deploy: the 2026-10-22 search and share pass (OPEN-QUESTIONS.md #62)

No schema change and no saved-edit migration. Before pulling, read-only: any
`gallery_events` row with `action = 'caption'` on `matunga-workshop-10.jpg` or
`matunga-workshop-31.jpg` (their baseline captions changed; a saved one keeps
showing, which is fine, but say so in the report). After the restart:
`/about/` answers 301 to `/about`, a made-up `/projects/x` answers 404 with the
site's 404 page, `/studio/<slug>` and `/api/content?path=/` answer as before,
and the `og:image` of `/` and of one project page opens as a 1200 × 630 JPEG.

### At the next deploy: the 2026-10-24 Vindhane figures (OPEN-QUESTIONS.md #65)

No schema change and no saved-edit migration. Before pulling, read-only: any
`content_edits` row on `/resources/vindhane-plant` with a key starting
`resources.plant.stats.0.`, `resources.plant.stats.1.` or
`resources.plant.machinery.items.9.`. A row on `.pending`, `.title` or `.body`
under those three was typed into a placeholder and no longer shows (the
placeholders are gone); a row on `.value`, `.label` or `.text` would show over
the new figures. Say which, if any, in the report. After the restart: the page
shows the four figure tiles and no "To be added".

### At the next deploy: the 2026-10-24 Vindhane machine list and layout (OPEN-QUESTIONS.md #66)

No schema change and no saved-edit migration: no key moved. Before pulling,
read-only: any `content_edits` row on `/resources/vindhane-plant` with the key
`resources.plant.machinery.items.0.text`, `.2.text`, `.4.text`, `.5.text`,
`.6.text` or `.9.text`. The first five had their text replaced by the machine
counts, so a saved row on one of them would show the old wording over the
count; `.9.text` is now "3 core drill machines" and was never deployed before,
so it should have none. Say which, if any, in the report. A row on `.7.text` or
`.8.text` is fine: those two rows kept their keys and text and moved to the
foot of "What the plant makes". After the restart: the page shows the four
lists ("What the plant makes", "How it is equipped", "Covered areas", "Team"),
no paragraph among them, and the clip plays.

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
