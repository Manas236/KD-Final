/* ============================================================
   /projects/[slug] copy — one page per project
   ------------------------------------------------------------
   No design export covers individual project pages — `/projects` is a
   listing, and the user asked for each project to also have its own
   page. See OPEN-QUESTIONS.md #21 for what that means for this
   codebase's usual "transcribed from an arrived export" contract: there
   is no export here, so this is authored directly from
   K.D.Website_Details.md, trimmed for consistency with #19b/#20 rather
   than pasted verbatim.

   Deliberately NOT part of `projects.ts`'s `ProjectEntry` shape. That
   interface is sized for what Listing.astro's cards render (title,
   meta, one line of badges) and scripts/check-edit-keys.mjs expects
   every string on it to have a rendered slot on `/projects` — adding a
   long-form body and a stats list to every card entry would either
   need slots Listing.astro doesn't have, or silently violate the
   contract. A separate module with its own shape avoids both.

   SLUGS ARE COMPUTED, NOT STORED. `slugify()` below is the single
   source for turning a project title into a URL segment, used both to
   build `/projects` card links and to resolve `/projects/[slug]`. See
   `src/lib/slug.ts`.

   ENRICHED 2026-09-17 from the borrowed docs/ folder — see
   OPEN-QUESTIONS.md #29. Only facts the company approved (★) or
   confirmed in person on 2026-08-18 (🗣, per docs/KD_INFO.md rev 4)
   went in; every addition was first written into
   K.D.Website_Details.md, which stays the source of truth. The 🟡
   claims those files hold (Matunga's 1915 / GreenCo heritage, the
   Sanpada inauguration, 425+ train movements) are listed in #29 and
   deliberately NOT here. Where a project gained nothing, its entry is
   untouched. Bodies may now run to three paragraphs; the template maps
   over the array, so no markup changed.
   ============================================================ */
/* Panvel–Karjat's own photograph since 27 Oct 2026, from its gallery: a
   steel girder going in at Chowk, with the RCC box segments for the
   corridor's push-through subways staged in front. Until then the hero
   was a stand-in, the Mankhurd workforce photograph. */
import panvelKarjatImg from "../assets/gallery/panvel-karjat-01.jpg";
import matungaImg from "../assets/project-matunga-workshop.jpg";
import nhavaShevaUranImg from "../assets/project-nhava-sheva-uran.jpg";
import harbourFobImg from "../assets/project-fob-truss-span.jpg";
import harbourRedevImg from "../assets/project-harbour-redevelopment-progress.jpg";
import sanpadaImg from "../assets/project-sanpada-carshed.jpg";
/* The structure's own photograph since 2026-09-28 — it was a Bonkode FOB
   stand-in before (OPEN-QUESTIONS.md #38). */
import matungaFobImg from "../assets/gallery/matunga-workshop-fob-02.jpg";
import matungaLhbImg from "../assets/project-matunga-lhb.jpg";
import solapurImg from "../assets/project-solapur-vande-bharat.jpg";
import lowerParelImg from "../assets/project-lower-parel.jpg";
import { slugify } from "../lib/slug";
import type { ImageMetadata } from "astro";

export interface DetailStat {
  readonly value: string;
  readonly label: string;
}

export interface ProjectDetail {
  readonly slug: string;
  readonly title: string;
  /** Small ink-band label above the H1 — "Ongoing Project", "Signature
      Project" or "Recently Awarded". Not the same string as the
      listing's `statusBadge`, which only exists for live projects. */
  readonly eyebrow: string;
  readonly client: string;
  readonly badges: readonly string[];
  readonly live: boolean;
  readonly statusBadge: string;
  /** The page's meta description — the line a search result prints
      under the title. It was `body[0]` until 2026-10-12, but those
      paragraphs run from 177 to 394 characters and a result stops near
      160; this is the same paragraph cut to 155 at most, with nothing
      in it that the page does not say. */
  readonly description: string;
  readonly body: readonly string[];
  readonly stats: readonly DetailStat[];
  readonly image: ImageMetadata;
  readonly alt: string;
  /** What `image` is, where it is not this project's own photograph
      (22 Oct 2026, OPEN-QUESTIONS.md #62). "stand-in": a K.D. photograph
      of other work, shown until this project's arrives; its `alt` opens
      "Representative image:" and claims no project or place. "render":
      an architect's rendering, so the page's structured data names no
      creator for it (BaseLayout.astro, primaryImage). */
  readonly imageKind?: "stand-in" | "render";
  /** On a stand-in: the caption on the hero, the same label and style as
      the "Beyond the railway" pages' representative images (27 Oct 2026),
      so a visitor sees what the alt text says. Key
      `projects.detail.representative`, as on those pages. */
  readonly representative?: string;
  /** A photograph of this project's own, from its gallery
      (src/assets/gallery/), for the share card in place of a stand-in
      hero. The hero itself does not change. Used only while the
      photograph is on the site (not hidden in the studio). */
  readonly shareFile?: string;
}

const RAW: readonly (Omit<ProjectDetail, "slug"> & { title: string })[] = [
  {
    title: "Panvel–Karjat Railway Line",
    eyebrow: "Ongoing Project",
    client: "Mumbai Railway Vikas Corporation Limited (MRVC)",
    badges: ["Civil"],
    live: true,
    statusBadge: "Ongoing, 90%+ Complete",
    description:
      "K.D. Constructions is building the stations, platforms, FOBs, subways, roads and " +
      "earthwork of the 29.6 km Panvel–Karjat corridor under MUTP-III.",
    body: [
      "A 29.6 km double-line suburban railway corridor forming part of " +
        "MUTP-III, connecting Panvel with Chikhale, Mohape, Chowk and " +
        "Karjat. K.D. Constructions is executing station buildings, " +
        "service buildings, platforms, COPs, FOBs, subways, RRI " +
        "facilities, booking offices, OHE/PSI infrastructure, roads and " +
        "earthwork across the corridor.",
      "The scope includes subway construction by pushing RCC box " +
        "sections beneath running railway lines with overhead OHE, a " +
        "method chosen because the corridor stays live throughout. The " +
        "project is now over 90% complete.",
    ],
    stats: [
      { value: "29.6 km", label: "Double-Line Corridor" },
      { value: "50,341 m³", label: "RCC" },
      { value: "4,686 MT", label: "Structural Steel" },
      { value: "146,814 m³", label: "Earthwork" },
    ],
    image: panvelKarjatImg,
    alt: "Steel girder lifted in at Chowk on the Panvel–Karjat line by K.D. Constructions, RCC box segments staged in front",
  },
  {
    title: "Matunga Workshop",
    eyebrow: "Signature Project",
    /* COFMOW is the LHB facility's co-client, not this contract's — see
       the entry below, and OPEN-QUESTIONS.md #24.
       2026-10-19: Sir's mail, OCR'd from the contract's completion
       certificate (cut off at the end), names the Workshop Projects
       Organisation of Indian Railways: the same 350 to 575 bogies and
       the same scope as this page. The client line, the three building
       areas below and the scope added to the first paragraph are from
       it; it gives no year (OPEN-QUESTIONS.md #56). */
    client: "Workshop Projects Organisation (WPO), Indian Railways",
    badges: ["Civil", "Mechanical", "Electrical"],
    live: false,
    statusBadge: "",
    description:
      "K.D. Constructions built industrial sheds, admin and training buildings at Matunga " +
      "Workshop for WPO, taking bogie overhauls from 350 to 575 a month.",
    body: [
      "At the historic Matunga Railway Workshop, K.D. Constructions " +
        "executed a multidisciplinary development programme comprising " +
        "industrial sheds, administrative and training facilities, " +
        "traverser infrastructure, underground and overhead water tanks, " +
        "roads, drainage and associated electrical works, supporting " +
        "the augmentation of Bogie Periodic Overhaul (POH) capacity from " +
        "350 to 575 bogies per month. The programme also took in an RCC " +
        "store building, a painting shed and concrete roads, the " +
        "replacement of industrial flooring and roof sheets in the " +
        "shops, and miscellaneous track works.",
      "Civil, structural, electrical and railway-specific works were " +
        "delivered together, as one programme.",
      /* 🗣 2026-08-18: "Which contracts carried S&T? — Matunga only"
         (docs/ASK.md #3). Carried as body copy, not a fourth badge — a
         fourth, long badge would overflow the medium card on /projects,
         and the homepage's "Civil · Mechanical · Electrical" is locked. */
      "The Matunga programme also carried K.D. Constructions' signalling " +
        "& telecommunication works, the one contract in the portfolio " +
        "to do so, integrating railway communication and control " +
        "systems into the modernised workshop.",
    ],
    /* The doc gives this contract one measured outcome and no volumes.
       The RCC, steel and kVA figures that used to sit here are the LHB
       facility's, and have gone with it to its own entry rather than
       being counted twice. The three building areas were appended on
       2026-10-19, from the completion certificate (above): 23,761.11,
       32,333.8 and 5,138 sq ft, rounded to the square foot. The project
       period, 2018 to 2021, is Sir's (21 Oct 2026, OPEN-QUESTIONS.md #58):
       a tile like the others, appended so no stat's key moves, the range
       with the en dash the site already uses for ranges. */
    stats: [
      { value: "350 → 575", label: "Bogies/Month POH Capacity" },
      { value: "23,761 sq ft", label: "G+2 Admin Building" },
      { value: "32,334 sq ft", label: "G+2 Basic Training Centre" },
      { value: "5,138 sq ft", label: "RCC Store Building" },
      { value: "2018–2021", label: "Project Period" },
    ],
    image: matungaImg,
    imageKind: "render",
    alt: "Architectural rendering of the Matunga Workshop administrative building, a K.D. Constructions project",
  },
  {
    /* "Creation of LHB Coach Maintenance Facilities, Matunga" in
       K.D.Website_Details.md — a signature project in its own right that
       had no page until now, and the largest RCC volume in the portfolio.
       Same site as the Matunga Workshop entry above, different contract
       and a different client pairing. See OPEN-QUESTIONS.md #24. */
    title: "Matunga LHB Coach Maintenance Facilities",
    eyebrow: "Signature Project",
    client: "Indian Railways / COFMOW",
    badges: ["Civil", "Mechanical", "Electrical"],
    live: false,
    statusBadge: "",
    description:
      "K.D. Constructions built Matunga's LHB coach maintenance facilities: civil, " +
      "structural, electrical and mechanical works, with 27,090 m³ of RCC.",
    body: [
      "A major multidisciplinary development creating LHB coach " +
        "maintenance facilities at Matunga Workshop, integrating civil, " +
        "structural, electrical and mechanical works, including 2,749 m " +
        "of inspection pit and traverser track.",
      "The facility also incorporated a 6,000 kVA electrical system and " +
        "specialised railway equipment: an 80-tonne CNC traverser, EOT " +
        "cranes and CNC shot-blasting equipment.",
    ],
    /* Six tiles, not four: the doc's two remaining measured figures for
       this contract (pit/traverser track, traverser capacity) were in
       the body but not in the grid. Six fills the 2-column grid in
       three full rows. */
    stats: [
      { value: "27,090 m³", label: "RCC" },
      { value: "1,816 MT", label: "Structural Steel" },
      { value: "6,000 kVA", label: "Electrical System" },
      { value: "3,089 m", label: "BG Track" },
      { value: "2,749 m", label: "Inspection Pit & Traverser Track" },
      { value: "80 t", label: "CNC Traverser" },
    ],
    image: matungaLhbImg,
    alt: "The LHB shed K.D. Constructions built at Matunga Workshop, under its full-length arched roof",
  },
  {
    title: "Nhava Sheva & Uran Railway Stations",
    eyebrow: "Signature Project",
    client: "Central Railway",
    badges: ["Civil"],
    live: false,
    statusBadge: "",
    description:
      "K.D. Constructions built the FOBs, cover-over-platforms, booking and service " +
      "buildings and subways at Nhava Sheva and Uran, on the Nerul–Uran line.",
    body: [
      "As part of the Nerul–Belapur–Seawood–Uran Railway Project, K.D. " +
        "Constructions delivered FOBs, cover-over-platform structures, " +
        "booking and service buildings, subways and associated station " +
        "infrastructure at Nhava Sheva and Uran.",
      /* The doc's "subways at both ends" and the two station-building
         areas were in the stat grid but not the prose. */
      "The project involved 29,421 m³ of RCC and 3,046 MT of structural " +
        "steel, including station buildings of 1,419 m² at Nhava Sheva " +
        "and 2,731 m² at Uran, with subways at both ends. The works also " +
        "included the architectural, finishing and station development " +
        "works.",
    ],
    stats: [
      { value: "29,421 m³", label: "RCC" },
      { value: "3,046 MT", label: "Structural Steel" },
      { value: "1,419 m²", label: "Nhava Sheva Station Building" },
      { value: "2,731 m²", label: "Uran Station Building" },
    ],
    image: nhavaShevaUranImg,
    alt: "Aerial view of a new station on K.D. Constructions' Nhava Sheva and Uran works, platform roof and approach roads",
  },
  {
    title: "Harbour Line FOBs & Trespass-Control",
    eyebrow: "Signature Project",
    /* "Central Railway" is kept on one line (\u00a0): the full MRVC name,
       the site's form on first use since 27 Oct 2026, wraps here. */
    client: "Mumbai Railway Vikas Corporation Limited (MRVC) / Central\u00a0Railway",
    badges: ["Civil"],
    live: false,
    statusBadge: "",
    description:
      "K.D. Constructions fabricated, launched and erected FOBs over running lines at " +
      "four Harbour Line locations, with linkways, subways and boundary walls.",
    body: [
      "A brownfield railway infrastructure project across the " +
        "Sewri–Panvel section of Mumbai's Harbour Line, involving FOBs, " +
        "linkways/highwalks, subways, boundary walls and associated " +
        "trespass-control works.",
      "A key feature was the fabrication, launching and erection of " +
        "FOBs over running railway lines, using both truss and plate " +
        "girder systems across four locations: Vashi–Sanpada, " +
        "Nerul–Seawood, Seawood–Belapur and Khandeshwar–Panvel.",
      /* The two-crane lift was already in the source doc's Steel
         Fabrication & Erection section (from the Company Profile deck,
         OPEN-QUESTIONS.md #28b) but on no project page. The Vashi FOB
         is this contract's Vashi–Sanpada location (docs/KD_INFO.md
         §7.7) — the same structure the page's own photograph shows. */
      "At the Vashi FOB, the structure was lifted into place with two " +
        "650-tonne telescopic cranes. The erection was carried out over " +
        "running railway lines, with the fabrication, launch and final " +
        "alignment all handled in-house.",
    ],
    /* Fourth tile from the doc's own wording, so the 2-column grid no
       longer leaves a gap. */
    stats: [
      { value: "4", label: "Locations" },
      /* Number, space, unit (27 Oct 2026), one unit for the pair: "44.5m +
         24.9m" was as wide as the tile allows, so a second "m" would wrap.
         The spaces before a unit do not break (\u00a0). */
      { value: "44.5 + 24.9\u00a0m", label: "Vashi–Sanpada Spans" },
      { value: "38 + 29.9\u00a0m", label: "Nerul–Seawood Spans" },
      { value: "Truss + Plate", label: "Girder Systems" },
    ],
    image: harbourFobImg,
    alt: "Steel truss foot overbridge built by K.D. Constructions between Vashi and Sanpada, spanning electrified railway tracks",
  },
  {
    title: "Mumbai Harbour Line Station Redevelopment",
    eyebrow: "Ongoing Project",
    client: "Mumbai Railway Vikas Corporation Limited (MRVC)",
    badges: ["Civil"],
    live: true,
    statusBadge: "Ongoing, 60%+ Complete",
    description:
      "K.D. Constructions is building FOBs, elevated decks, skywalks and service " +
      "buildings at GTB Nagar, Chembur, Govandi and Mankhurd while trains keep running.",
    body: [
      "A major brownfield station redevelopment programme across GTB " +
        "Nagar, Chembur, Govandi and Mankhurd, executed within an " +
        "operational railway environment. The scope includes FOBs, " +
        "elevated decks, skywalks, service buildings, improved station " +
        "access and associated infrastructure, including a 10\u00a0m wide FOB " +
        "at Mankhurd.",
      "With railway operations continuing throughout execution, the " +
        "project demands rigorous planning, safety and interface " +
        "management, and is now over 60% complete.",
      /* 45,000+ is the source doc's own CSR figure for "station
         redevelopments", and this is the only one in execution. Kavach
         is 🗣 2026-08-18 ("installed, at Mankhurd station", docs/ASK.md
         #2) — worded to the place, not to this contract, because which
         contract it sat under was left open (ASK.md 🔴 #2). */
      "Together, the redeveloped stations serve 45,000+ commuters a " +
        "day. Mankhurd is also where K.D. Constructions has installed " +
        "Kavach, India's indigenous Automatic Train Protection (ATP) " +
        "system.",
    ],
    stats: [
      { value: "4", label: "Stations" },
      { value: "10\u00a0m", label: "Mankhurd FOB Width" },
      { value: "45,000+", label: "Commuters a Day" },
    ],
    image: harbourRedevImg,
    /* PHOTOS.md B12: a frame from the Nhava Sheva folder, so not one of
       these four stations. Representative until Sir confirms or replaces
       it (#62). */
    imageKind: "stand-in",
    representative: "Representative image",
    alt: "Representative image: a railway station under construction by K.D. Constructions, materials staged trackside",
  },
  {
    title: "Sanpada Carshed",
    eyebrow: "Signature Project",
    client: "Central Railway",
    badges: ["Civil", "Mechanical", "Electrical"],
    live: false,
    statusBadge: "",
    description:
      "K.D. Constructions built Sanpada Carshed's Inspection Shed with three pit lines, " +
      "its Heavy Repair Shed and Administration Building, and laid the P-Way.",
    body: [
      "A comprehensive railway maintenance infrastructure development " +
        "at Sanpada Carshed, comprising an Inspection Shed with three " +
        "pit lines, Heavy Repair Shed, Administration Building, " +
        "Canteen, Time Office, Security Building, Battery Room and " +
        "associated infrastructure.",
      "The project involved substantial civil and structural execution " +
        "alongside P-Way track laying works, creating integrated " +
        "facilities to support efficient railway maintenance and " +
        "operations.",
      /* Added 2026-10-13 from K.D.'s own list of completed works, which
         has Sanpada Carshed as three Central Railway contracts
         (OPEN-QUESTIONS.md #44). Their values are not used: contract
         values are dropped site-wide. */
      "The work ran across three Central Railway contracts. Two were " +
        "under MUTP-II: the extension of the Heavy Repair Shed, Light " +
        "Repair Shed and Inspection Shed over lines 4 to 8, with a " +
        "first floor for the Administration Building, laboratories, " +
        "further buildings and the associated track modification; and " +
        "a second Heavy Repair Shed for EMU rakes. The third delivered " +
        "Inspection Sheds with three and two pit lines and a Feeder " +
        "Shed.",
    ],
    /* Fourth tile: the doc's P-Way track laying — the Track Engineering
       evidence docs/KD_INFO.md §4.2 cites for this project — was in the
       body but not the grid. */
    stats: [
      { value: "11,338 m³", label: "RCC" },
      { value: "1,412 MT", label: "Structural Steel" },
      { value: "3", label: "Inspection Pit Lines" },
      { value: "P-Way", label: "Track Laying Works" },
    ],
    image: sanpadaImg,
    alt: "Aerial view of the Sanpada carshed built by K.D. Constructions, roofed maintenance bays alongside stabling lines",
  },
  {
    title: "Matunga Z-Bridge",
    eyebrow: "Signature Project",
    client: "Central Railway",
    badges: ["Civil", "Structural Steel"],
    live: false,
    statusBadge: "",
    description:
      "K.D. Constructions built the Matunga Z-Bridge, Matunga Workshop's FOB: piling, " +
      "RCC, girders fabricated and erected over a running line, and the roof.",
    body: [
      "The Matunga Z-Bridge, the Matunga Workshop FOB, is a " +
        "strategically located pedestrian infrastructure project at " +
        "Matunga Workshop, involving RCC construction, structural steel " +
        "and girder fabrication, piling, roofing, side glazing and " +
        "finishing works.",
      "K.D. Constructions fabricated the FOB's steel and launched and " +
        "erected it above a running railway line.",
      /* 🗣 2026-08-18: the FOB and the "Matunga Z-Bridge" are one
         structure (docs/ASK.md #1) — which is what released this
         story for the page (docs/CONTENT.md, KD_INFO §7.2). The "lakhs
         of residents" line is also the source doc's own CSR paragraph.
         Titled by its local name since 2026-09-29 (OPEN-QUESTIONS.md
         #41); the doc's "Matunga Workshop FOB" is kept in the first
         line, so both searches land here (docs/SEO.md). */
      "The bridge restored " +
        "the daily link between Matunga East and West after more than a " +
        "year with the original footbridge closed, a crossing relied on " +
        "by lakhs of commuters, students and residents.",
    ],
    stats: [
      { value: "303\u00a0m", label: "FOB Length" },
      { value: "704.88 MT", label: "Structural Steel" },
      { value: "1,584 m³", label: "RCC" },
    ],
    image: matungaFobImg,
    alt: "Aerial view of the Matunga Z-Bridge by K.D. Constructions, its covered deck running the length of the workshop yard",
  },
  {
    title: "Solapur Vande Bharat Maintenance Depot",
    eyebrow: "Recently Awarded",
    /* "Central Railways" in the doc's Recently Awarded entry; "Central
       Railway" — the zone's name — everywhere else in the same doc, on
       /clients and on every other project here. Normalised. */
    client: "Central Railway",
    badges: ["Mechanical"],
    live: true,
    statusBadge: "Recently Awarded",
    description:
      "K.D. Constructions has been awarded the LoA to upgrade and develop the Solapur " +
      "Coaching Depot into a Vande Bharat Train Maintenance Depot.",
    body: [
      "K.D. Constructions has been awarded the Letter of Acceptance " +
        "(LoA) for the Upgradation and Development of the Solapur " +
        "Coaching Depot into a Vande Bharat Train Maintenance Depot.",
      "The project marks an important expansion of our " +
        "multidisciplinary EPC capabilities and will contribute to the " +
        "infrastructure supporting India's next generation of Vande " +
        "Bharat trains.",
    ],
    stats: [{ value: "LoA Awarded", label: "Contract Stage" }],
    image: solapurImg,
    /* PHOTOS.md B1: the Vande Bharat rake in a Matunga shed, not Solapur.
       Representative until Sir confirms or replaces it (#62). */
    imageKind: "stand-in",
    representative: "Representative image",
    alt: "Representative image: K.D. Constructions railway shed work, a Vande Bharat trainset inside a maintenance shed",
  },
  {
    title: "Lower Parel Railway Redevelopment",
    eyebrow: "Recently Awarded",
    client: "Western Railway",
    badges: ["Civil"],
    live: true,
    statusBadge: "Recently Awarded",
    description:
      "K.D. Constructions has been awarded a brownfield railway project at Western " +
      "Railway's Lower Parel Workshop, in a dense and operational urban setting.",
    body: [
      /* "Lower Parel Workshop" is the doc's own name for the site in its
         About paragraph and at-a-glance list; only the Recently Awarded
         entry says just "Lower Parel" (docs/WEBSITE_INFO.md 10b). */
      "A complex brownfield railway infrastructure project at Western " +
        "Railway's Lower Parel Workshop, strengthening our experience in " +
        "delivering modern railway assets within a dense and operational " +
        "urban environment.",
    ],
    stats: [{ value: "Recently Awarded", label: "Contract Stage" }],
    image: lowerParelImg,
    /* PHOTOS.md A10: a platform from the Nhava Sheva folder, not Lower
       Parel. Representative until Sir confirms or replaces it (#62). */
    imageKind: "stand-in",
    representative: "Representative image",
    alt: "Representative image: K.D. Constructions station work, a platform under a full-length canopy",
  },
];

export const projectDetails: readonly ProjectDetail[] = RAW.map((p) => ({
  ...p,
  slug: slugify(p.title),
}));

export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return projectDetails.find((p) => p.slug === slug);
}

/* The chrome every detail page shares. Moved to its own import-free
   module so the "Beyond the railway" project pages, whose copy the Node
   gates load, can share it too — see src/data/detail-chrome.ts. */
export { detailChrome } from "./detail-chrome";
