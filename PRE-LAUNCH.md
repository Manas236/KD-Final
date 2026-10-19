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

**Last updated:** 2026-10-16 · **47 placeholders on the site** — the number `npm run check:placeholders` prints (46 until 2026-10-16, when the fire drill's date became one, row 2b, OPEN-QUESTIONS.md #53; a search of official public records the same day filled none, #52); the 30 open rows below cover them, several rows holding more than one (19 are on the older "Beyond the railway" project pages, rows 5b–5h; 14 on the eight works from K.D.'s own list of completed works, rows 3c and 7a–7h, which came with 28 on 2026-10-13; 1 on `/careers`, row 6). It was 62 until 2026-10-15, when representative images filled eight tiles and their pages (rows 3a, 3c, 5g, 7a–7f, 7h; OPEN-QUESTIONS.md #48). It was 36 until 2026-10-13: that list first filled the scope of works on two pages (row 5a closed, row 5e halved — 34), then its eight other works each became a project page with its own gaps · **17 sign-offs** (S1–S17; S13 answered 2026-10-16) · **8 go-live configuration rows, 7 still open** (G3 closed 2026-10-12)

---

## Placeholders on the site

| # | Where | Shown as | What K.D. has to supply | If it does not exist |
| --- | --- | --- | --- | --- |
| 1a | `/csr` · Content Pending · card 1 | **Formal CSR programmes** · To be added | What structured CSR activity the company runs or funds, where, since when, annual spend | "Not applicable" (below Companies Act §135 threshold) — delete the card |
| 1b | `/csr` · Content Pending · card 2 | **Community partnerships** · To be added | Local initiatives near Dhule, Navi Mumbai, Raigad; NGOs / trusts / schools / civic bodies worked with | Delete the card |
| 1c | `/csr` · Content Pending · card 3 | **Education & skilling initiatives** · To be added | Apprenticeships, ITI / college tie-ups, worker upskilling, scholarships, site schools — with numbers | Delete the card |
| 1d | `/csr` · Content Pending · card 4 | **CSR committee & governance** · To be added | Whether a CSR committee exists, members, the policy | Delete the card |
| 2 | `/hse` · Certifications · card 4 | **Other certifications & certificate details** · To be added | Certificate numbers, validity dates, certifying bodies for ISO 9001 / 14001 / 45001; any RDSO approval; Rail Chamber membership certificate. **2026-10-16:** the ISO certificates are to be collected from the Vashi office (OPEN-QUESTIONS.md #53). **2026-10-19:** also the **number and validity of the PWD electrical licence**, which Sir confirmed K.D. holds; it now has its own card after this one (card 5), with no number on it (OPEN-QUESTIONS.md #56). Soft copies of the ISO certificates have arrived; whether and how to show them is Sir's call, so nothing from them is on the page | Delete the card — the three ISO cards and the PWD licence card stand |
| 2b | `/hse` · Emergency Preparedness · the fire drill card (card 5), over its clip | **Mohape site** · To be added (the date) | The date of the fire mock drill. K.D.'s HSE executive confirmed the site on 2026-10-16, not the date; the camera's stamp on the photographs reads 31 July 2026, and no document in the repo gives one (OPEN-QUESTIONS.md #53). On a date: put it in the card's `where` (`Mohape site · <date>`) and delete `pending` | Delete `pending`: the card stands with its site only |
| ~~3a~~ | ~~`/projects` · Beyond the railway · tile 7~~ | ~~**Kharghar Football Stadium** · Photograph to be added~~ | ✅ **Closed 2026-10-15** with a **representative image** the user supplied (`Kharghar Football Stadium/`), captioned "Representative image" on the tile and the page header, the same treatment as row 3c (OPEN-QUESTIONS.md #48). Sir's allowance of 2026-10-13 named the eight works of row 3c, not this one: **S15** asks him. A real photograph of the stadium still replaces it | A no at S15 puts the `pending` tile back (the 2026-10-15 commit has it), or deletes the tile and the page (5g) together |
| 3b | `/projects` · Beyond the railway · tile 8 | **Kharghar Centre of Excellence** · To be confirmed | A yes that it is K.D.'s own work, plus one photograph. The facility itself (CIDCO, two pitches, inaugurated 2022) is now on record from public sources; K.D.'s part is not | A no deletes the tile **and** the name from the at-a-glance list in `K.D.Website_Details.md` |
| 3c | `/projects` · Beyond the railway · tile 15 | **Rabale Skywalk** · Image to be added (one tile). The other seven of the eight got their representative images on 2026-10-15, OPEN-QUESTIONS.md #48 | One image per work. There is no photograph of any of them; Sir allows a **generic, representative image**, shown with a small "Representative image" caption on the tile and on the page header. Put each in its own folder at `kd-construction/`, named by the work, as the seven of 2026-10-15 were; it then needs a line in `.gitignore` and in `scripts/build-gallery.mjs` (`representative-<slug>.jpg`) and `file`, `alt` and `representative` on its tile in `src/data/projects.ts`. A real photograph of the work is better still. **Never a photograph of a different K.D. work** | No image: delete the tile and its page (the matching row 7) together, and the work's link on its `/clients` card |
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
| 5e | `/projects/kharghar-golf-course` · hero tile 4 | **Year completed** · To be added | The year the clubhouse was handed over. The scope tile was filled on 2026-10-13: K.D.'s own list of completed works has the contract as "Construction of Club House for golf course at Kharghar", so it reads **Clubhouse · Scope of works** and the overview says K.D. built the clubhouse. Client **CIDCO** and **103 ha** are filled (S8); Sir confirmed CIDCO as the client on 2026-10-19 (S12). No cost is quoted: sources disagree (₹109.65 cr vs ₹50.35 cr) | Delete the tile |
| 5f | `/projects/lush-meadows` · hero tiles 3, 4 + overview card | **Scope of works · Year completed** · To be added; **Figures from a property portal** · To be verified | Scope and year; **and** a check of MahaRERA A51800000454 on the MahaRERA site — the developer (Kailash Developers), 2 & 3 BHK and 711–852 sq ft are Square Yards portal data | Registration does not match: remove the developer and flat tiles and the second half of the paragraph. Checked and matches: delete the card |
| 5g | `/projects/kharghar-football-stadium` · hero tiles 3, 4 | **Scope of works · Year completed** · To be added. (The **Photographs** card closed on 2026-10-15: the page header is now the representative image of row 3a, and the page has no gallery block until real photographs exist) | Scope and year (client **CIDCO** and the **40,000 planned capacity** are filled — S8). Real photographs of the stadium would still replace the representative image and give the page a gallery | Delete each tile K.D. cannot fill. A no at S15 brings the photographs card back with the tile (3a) |
| 5h | `/projects/kharghar-centre-of-excellence` · the whole page | **K.D. Constructions' own work?** · To be confirmed; hero tile 3 **Scope of works** · To be added; **Photographs** · Photograph to be added | First the yes/no (with 3b). On a yes: K.D.'s scope and a photograph — client, pitches, 2022 and the description are now filled from public sources (S8) | A no deletes the page's entry in `src/data/social-projects.ts`, the tile (3b) and the name in `K.D.Website_Details.md` — delete the tile first, or the module refuses to build a tile with no page |
| 6 | `/careers` · Where We Hire · card 2 | **K.D. Constructions on Indeed** · To be added | The URL of K.D. Constructions' company / jobs page on Indeed. (The individual job cards are **not** placeholders: an editor adds and removes them on the page itself in edit mode — "Add a job posting" card, "Remove posting" on each) | Delete the card — the LinkedIn card stands |
| 7a | `/projects/ghansoli-roads-and-services` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c; replaced 2026-10-16 with one without lettering, S15) | The year the work was handed over | Delete the tile |
| 7b | `/projects/kamothe-peripheral-roads` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |
| 7c | `/projects/vashi-station-approach-road` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |
| 7d | `/projects/ulwe-mass-housing-infrastructure` · hero tiles 2, 4 | **Extent of works · Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | Road length, area served or the main quantities; the year | Delete each tile K.D. cannot fill |
| 7e | `/projects/ulwe-sector-8-infrastructure` · hero tiles 2, 4 | **Extent of works · Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c; replaced 2026-10-16 with one without lettering, S15) | Road length, area served or the main quantities; the year | Delete each tile K.D. cannot fill |
| 7f | `/projects/kharghar-33-kv-substation` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |
| 7g | `/projects/rabale-skywalk` · hero tiles 2, 4 + the gallery | **Length & width · Year completed** · To be added; **Image** · Image to be added. (The **Client** tile closed on 2026-10-19: **NMMC**, Sir's answer to S12) | The skywalk's length and width; the year; the image (row 3c) | Delete each tile K.D. cannot fill; with no image, delete the page and its tile (row 3c), and its link on the NMMC card on `/clients` |
| 7h | `/projects/nmmc-school-no-54-and-55` · hero tile 4 | **Year completed** · To be added. (The **Image** card closed on 2026-10-15 with the representative image, row 3c) | The year | Delete the tile |

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
| ~~S12~~ | ~~`/projects/bonkode-fob`, `/projects/kharghar-golf-course`, `/projects/rabale-skywalk` · hero tile 1 (Client); `/clients` · the CIDCO and NMMC cards~~ | ✅ **Answered 2026-10-19 by Sir:** the **Bonkode** and **Rabale** skywalks were for **NMMC**; the **Kharghar golf course clubhouse** was for **CIDCO**. So the Bonkode and golf course pages keep the client they had; the Rabale page's client tile is now **NMMC** (it was a "To be confirmed" placeholder, row 7g); and the three works are linked on `/clients`: Kharghar Golf Course on the CIDCO card, Bonkode FOB and Rabale Skywalk on the NMMC card (OPEN-QUESTIONS.md #56). K.D.'s list of completed works had them the other way round (CIDCO for both skywalks, NMMC for the clubhouse), a filled-down department column | The list (a screenshot, 2026-10-13, OPEN-QUESTIONS.md #44) against the sources behind S8 |
| ~~S13~~ | ~~`/hse` · Emergency Preparedness · the heat-stress and Karjat drill cards (since 2026-10-15 one card each in the drill register, OPEN-QUESTIONS.md #50)~~ | ✅ **Answered 2026-10-16** by K.D.'s HSE executive. (1) Yes: an Emergency Mock Drill, Heat Stress (Heat Stroke), at the **Karjat site**, 08/10/2026; the card now says so. (2) The Karjat drill's times, 14:53, 14:55 and 15:00, are **correct** and stay. (3) **No originals are coming**: the photographs from the report stay as they are (OPEN-QUESTIONS.md #53) | "Heat stress" is the name of the folder the ten photographs came in; nothing in them says so, and nothing names the site. The Karjat details are from the site's own mock drill report of 17 April 2026 (a PDF in the same folder) — a site report, not something written for publication. No name from either is on the site |
| S14 | `/hse` · Emergency Preparedness · the fire drill card (headed by the site's clip) and the snake-bite card, cards 5–6; `/gallery` · Safety on Site · the last 21 photographs | **2026-10-16, answered by K.D.'s HSE executive:** (1) the site is right (**Mohape site**); the date is **not confirmed**, so the card's date is a placeholder, row 2b. (2) The man in the green helmet is **K.D.'s HSE executive**; the captions now say so, by role, no name. (3) The snake-bite drill was at the **Karjat site** on **27 August 2026** (as the card says); its **originals are coming later**, and the photographs stay as they are until then. **Still open: (3), the originals.** The questions were: **For Amritanshu, K.D.'s HSE executive — three questions.** (1) The fire drill: are **Mohape, 31 July 2026** right? Both are read off the GPS camera's stamp on the photographs (14:16 to 14:23, "Poyanje (Mohope), Station Road"). (2) Who is the man in the green helmet who demonstrates the extinguisher? The captions call him "the instructor" and the two in white helmets "supervisors". (3) The snake-bite drill's **original photographs**, if they exist: the only copies are the small ones in the report (416 to 541 px wide, four of them squeezed and stretched back); since 2026-10-15 the clearest, 712 px wide, heads the drill's card on `/hse`, a little enlarged | The fire drill's six points are the HSE team's own seven discussion points (pasted by the user on 2026-10-15). The snake-bite card is the site's mock drill report of 27 August 2026 (RMC Plant, Karjat) and the HSE team's RIGHT rule and don'ts, given in Hindi and put into English. The report names its coordinators and is signed; no name is on the site. OPEN-QUESTIONS.md #47 |
| S15 | `/projects` · Beyond the railway · tile 7 and `/projects/kharghar-football-stadium` · hero; the eight representative images (tiles 7, 9–14, 16) | **For Sir, two questions.** (1) **May the football stadium carry a representative image?** On 2026-10-13 he allowed generated, captioned images for the eight works from K.D.'s own list; the stadium is not one of them, and row 3a asked for a real photograph. On 2026-10-15 the user supplied a generated image for it with seven of the eight, and it is on the site captioned "Representative image" like theirs. A no puts the "Photograph to be added" tile back. (2) **The signs in the images.** All eight show generated lettering and emblems of real bodies: CIDCO (stadium, Vashi, Ulwe Mass Housing), NMMC (the school), MSEDCL's "Mahavitaran" (the substation), brand hoardings, and Marathi place-name boards. Two **contradict their pages**: the Ghansoli image has a board reading "NMMC · Ghansoli Roads & Services" and "Navi Mumbai Municipal Corporation" road signs, and the Ulwe Sector 8 image an NMMC road sign, but both pages give the client as **CIDCO** (and Ulwe is a CIDCO node, not NMMC's area). The caption says the picture is not a photograph; confirm the signs are acceptable, or ask for versions without them, at the least for those two. **2026-10-16:** those two are **replaced** with images that carry no lettering at all, so neither contradicts its page now; question (2) stands for the other six | OPEN-QUESTIONS.md #48, #52, #54 |
| S16 | `/hse` · the whole page, and the four stat tiles under the hero | **For Sir — one sign-off:** `/hse` was rearranged on 2026-10-15, desktop included. The drills are one card each (picture at the head, steps behind a toggle), the Training, Worker Health and Recognition photographs sit beside their cards, and four stat tiles open the page. No fact was removed. **The three tile questions were answered on 2026-10-16** by K.D.'s HSE executive and the tiles corrected (OPEN-QUESTIONS.md #53): 3,00,000 is the **Karjat site's** figure as of **7 March 2026**; the drills are **8+** so far in 2026; the camp was **50** workers and staff, not 88. **Sir's sign-off is still open.** The questions were: **For Amritanshu, K.D.'s HSE executive — three questions on the tiles.** (1) **3,00,000 safe man-hours without a lost-time injury** is read off the Karjat banner ("as on January 2026"; OPEN-QUESTIONS.md #42 already asked): is it right, is there a newer figure, and is there a company-wide one or an LTIFR that should lead instead? (2) **7 site mock drills in 2026** counts the drills on the page: were there more? (3) **88 workers and staff in one medical camp**: right to headline? | The layout was the user's call ("bloated, not arranged", 2026-10-15); the four figures are the page's own, gathered. OPEN-QUESTIONS.md #50 |
| S17 | `/resources/vindhane-plant` · The Plant · the clip beside the four paragraphs | **For Sir, three things.** (1) **Sign off the desktop change:** since 2026-10-15 the plant's own video (a painted girder on a trailer in the yard) plays, silent and looping, in the right half of the band, which was empty; nothing else on the desktop page moved. (2) **Which girder is it?** Name the project and the caption ("A painted girder loaded for dispatch") can say so and link to its page. (3) **The original video**, if there is one: this copy is 640 × 368, likely a forwarded one, and a little soft on a sharp screen | The user's file `Vindhane Plant/Vidhane_Factory.mp4` (OPEN-QUESTIONS.md #51) |

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
