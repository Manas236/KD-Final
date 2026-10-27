/* ============================================================
   /projects copy
   ------------------------------------------------------------
   `/projects` arrived the same way `/about` did (see the note at the
   top of DESIGN-SYSTEM.md): a generated export, snapped to Tailwind's
   *default* spacing scale rather than this project's, using default
   palette names (`zinc-700`, `slate-400`, `gray-400`, `gray-800`) in
   place of tokens. The wording below is transcribed from it; the
   layout is rebuilt against DESIGN-SYSTEM.md and OPEN-QUESTIONS.md #5,
   which is the same treatment `/about` got. Do not reword, retitle, or
   "improve" a sentence — flag it in OPEN-QUESTIONS.md instead.

   NO HARDCODED STRINGS IN MARKUP. SLOT KEYS MIRROR THIS OBJECT'S PATH,
   with "projects" as the first segment — see DESIGN-SYSTEM.md §9.

   ---- The chrome is referenced, not retyped ----
   `nav` and `footer` are the SAME OBJECTS as home.ts's — see the note
   in src/data/about.ts, which explains why and what it costs nothing.

   ---- `live` is metadata, not copy ----
   Every `ProjectEntry` carries a `live: boolean`. It is never rendered
   as text — it only drives which cards a filter tab shows — so it is a
   boolean rather than a "live" | "completed" string on purpose:
   scripts/check-edit-keys.mjs walks every STRING leaf in this object
   looking for a slot to render it in, and a boolean is invisible to
   that walk. A string here would need either a slot nobody wants or a
   change to the checker; a boolean needs neither. `Tab.status` is kept
   out of this file for the same reason — see the note in
   src/components/projects/Filters.astro.

   Three real projects here — Matunga Workshop, Sanpada Carshed, Matunga
   Z-Bridge — already appear on the homepage. Their facts (name,
   value, client) are copied by hand rather than imported from home.ts,
   the same way about.ts writes its own STORY_LEAD instead of importing
   home.ts's HERO_SUB even though both describe the same company: this
   page's own export is the source for what it says, and the two are
   free to be transcribed independently.

   RECONCILED AGAINST K.D.Website_Details.md — see OPEN-QUESTIONS.md
   #19b. Per-project ₹ Cr figures that appeared nowhere in the source
   doc (₹165 Cr, ₹48 Cr, ₹21 Cr, ₹358 Cr+, ₹149 Cr+) were replaced with
   the doc's own physical stats (RCC volume, steel tonnage, span
   length) wherever it gave them for that project. Company-wide figures
   — revenue, the Vision 2030 target, the ₹362.90 Cr tender pipeline —
   are doc-grounded or independently cross-verified (OPEN-QUESTIONS.md
   #19) and were left untouched. "Matunga Z-Bridge" is renamed
   "Matunga Workshop FOB": the doc's "Matunga Workshop FOB" (a 303m FOB
   fabricated and erected over a live line at Matunga, Central Railway)
   matches this project's description closely enough that the two are
   treated as the same structure under its doc-given name — see #19b.
   (Renamed back to "Matunga Z-Bridge" 2026-09-29 at the user's request,
   #41.)
   Four projects named in the doc but previously absent from this page
   — Nhava Sheva & Uran Railway Stations, Harbour Line FOBs &
   Trespass-Control, Solapur Vande Bharat Maintenance Depot and Lower
   Parel Railway Redevelopment — were added as new medium/small-tier
   entries, following the existing tier pattern rather than changing it.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink, Stat } from "./home.ts";
import { allGalleries } from "./gallery.ts";

export interface ProjectEntry {
  readonly live: boolean;
  /** Only set when `live` — e.g. "Ongoing" or "Ongoing — 85%+ Complete".
      Empty string when not live, and rendered nowhere: leaves() in
      check-edit-keys.mjs skips empty-string leaves, so no slot is
      expected for it either. */
  readonly statusBadge: string;
  readonly badges: readonly string[];
  readonly title: string;
  readonly meta: string;
  readonly alt: string;
  /** True where K.D.Website_Details.md states structural steel for the
      project — tonnage, or fabrication, launching and erection. It drove
      the "Steel Fabrication & Erection" tab until that became "Plants"
      (2026-10-09) and is kept as a record; a boolean, so
      check-edit-keys.mjs never looks for a slot for it (see `live`). */
  readonly steel?: boolean;
  /** Set on a card whose photograph is a stand-in (another K.D. work's,
      22 Oct 2026, #62): the caption on the tile, the label the "Beyond
      the railway" tiles use for theirs (27 Oct 2026). */
  readonly representative?: string;
}

export interface FeaturedProject extends ProjectEntry {
  readonly body: string;
  readonly footnote: string;
}

/** One tile in the "Beyond the railway" band — a name, a location and
    a photograph, and deliberately nothing else. See the note on
    `social` below and OPEN-QUESTIONS.md #30. `file` is resolved the
    way gallery.ts's is (src/lib/gallery-images.ts), never imported
    here, because scripts/check-edit-keys.mjs imports this module into
    plain Node. */
export interface SocialProject {
  readonly title: string;
  readonly location: string;
  /** Absent only on a `pending` tile. */
  readonly file?: string;
  readonly alt?: string;
  /** REVIEW-ONLY. A tile with no photograph yet: renders as a labelled
      placeholder instead of an image, so the project's absence is a
      visible question for the client rather than a silent gap. The
      value is the badge label; `note` says what is needed. Filled or
      removed before go-live — PRE-LAUNCH.md, and
      scripts/check-placeholders.mjs fails while any exists. */
  readonly pending?: string;
  readonly note?: string;
  /** Set when `file` is a REPRESENTATIVE image, a generated picture and
      not a photograph of the work, which the client allows for works
      with no photograph on record (OPEN-QUESTIONS.md #44, #48). The
      value is the caption shown on the tile and on the page header. Such
      a picture never goes in a gallery group, on the share card or in
      the image sitemap, where the caption cannot follow it. */
  readonly representative?: string;
}

/** One row of the steel ledger — see `listing.steel` below. `title` is
    the listing card's own title, so slugify() gives the same page. */
export interface SteelLedgerRow {
  readonly title: string;
  readonly figure: string;
  readonly label: string;
}

export const projects = {
  /* Head only — nothing in the export specifies a title or a meta
     description, same as OPEN-QUESTIONS.md #7. Assembled the same way:
     the hero sub, which is the one sentence here that says what the
     page is. */
  meta: {
    /* House format since 22 Oct 2026; the longer line is the share title. */
    title: "Projects | K.D. Constructions",
    ogTitle: "Projects | K.D. Constructions · Portfolio",
    description:
      "Five decades. Six disciplines. A growing national footprint across " +
      "Indian Railways, urban transit, and government infrastructure.",
  },

  /* Shared chrome. Same strings as the homepage, different slot keys —
     see the note at the top of this file. */
  nav: home.nav,
  footer: home.footer,

  hero: {
    kicker: "Portfolio",
    heading: "Our Work",
    sub:
      "Five decades. Six disciplines. A growing national footprint across " +
      "Indian Railways, urban transit, and government infrastructure.",
    /* Was "" until 22 Oct 2026. Behind aria-hidden: for search engines
       and the share card. */
    backdropAlt: "Uran railway station, a K.D. Constructions project for Central Railway",
    stats: [
      { value: "29.6 km", label: "Panvel–Karjat Ongoing Corridor" },
      { value: "₹362.90 Cr", label: "Pipeline (3 Tenders)" },
    ] as readonly Stat[],
  },

  /* The tab row under the hero. Only the labels are copy; which view
     each tab shows is a fixed mapping the component owns — see the note
     in Filters.astro. "Gallery" was added at the user's request and is
     not in the export; so was "Steel Fabrication & Erection"
     (OPEN-QUESTIONS.md #31), appended last so no existing tab's slot
     key moves. On 2026-10-09 the client had that fifth tab replaced by
     "Plants" — the Vindhane and Karjat plant cards. */
  filters: {
    tabs: ["All Projects", "Ongoing", "Completed", "Gallery", "Plants"] as readonly string[],
  },

  /* One continuous ink band, tallest card first — not the 704/464
     side-by-side grid OPEN-QUESTIONS.md #5 guessed at before this page
     had an export. See #18 for what that guess got right and wrong. */
  listing: {
    featured: {
      live: true,
      statusBadge: "Ongoing, 90%+ Complete",
      badges: ["Civil"],
      steel: true,
      title: "Panvel–Karjat Railway Line",
      meta: "MUTP-III · 29.6 km Corridor",
      body:
        "Delivering direct CSMT–Panvel–Karjat suburban connectivity under " +
        "MUTP-III. Stations: Chikhale, Mohape, Chowk, Karjat.",
      footnote: "4 Stations · January 2026",
      /* The project's own photograph since 27 Oct 2026, the frame its
         page's hero uses (a girder going in at Chowk). Until then a
         stand-in, the Mankhurd workforce photograph (#18, #62). */
      alt: "Steel girder lifted in at Chowk on the Panvel–Karjat line by K.D. Constructions, RCC box segments staged in front",
    } as FeaturedProject,

    medium: [
      {
        live: false,
        statusBadge: "",
        badges: ["Civil", "Mechanical", "Electrical"],
        title: "Matunga Workshop",
        /* Was "1,816 MT Steel" — that tonnage belongs to the LHB coach
           maintenance facility, a separate contract in the doc, which now
           has its own entry below. See OPEN-QUESTIONS.md #24. */
        meta: "Indian Railways · POH 350 → 575 Bogies/Month",
        alt: "Architectural rendering of the Matunga Workshop administrative building, a K.D. Constructions project",
      },
      {
        live: false,
        statusBadge: "",
        badges: ["Civil"],
        steel: true,
        title: "Nhava Sheva & Uran Railway Stations",
        meta: "Central Railway · 3,046 MT Steel",
        alt: "Aerial view of a new station on K.D. Constructions' Nhava Sheva and Uran works, platform roof and approach roads",
      },
      {
        live: false,
        statusBadge: "",
        badges: ["Civil"],
        steel: true,
        title: "Harbour Line FOBs & Trespass-Control",
        meta: "MRVC · 4 Locations",
        alt: "Steel truss foot overbridge built by K.D. Constructions between Vashi and Sanpada, spanning electrified railway tracks",
      },
      {
        live: true,
        statusBadge: "Ongoing, 60%+ Complete",
        badges: ["Civil"],
        title: "Mumbai Harbour Line Station Redevelopment",
        meta: "Mumbai Railway Vikas Corporation Ltd · 4 Stations",
        /* Stand-in — no dedicated photograph exists for this project.
           See OPEN-QUESTIONS.md #19b. Said to be one since 22 Oct 2026
           (#62); PHOTOS.md has the frame from the Nhava Sheva folder. */
        alt: "Representative image: a railway station under construction by K.D. Constructions, materials staged trackside",
        representative: "Representative image",
      },
      {
        /* A signature project the doc has always carried ("Creation of LHB
           Coach Maintenance Facilities, Matunga") that no page had until
           now — its quantities were being shown on the Matunga Workshop
           card instead. Titled the way every other entry here is: the
           doc's name, shortened to a card-length noun phrase. Appended
           rather than slotted in beside the other Matunga work, so no
           existing card's index — and therefore no stored edit key —
           moves. See OPEN-QUESTIONS.md #24. */
        live: false,
        statusBadge: "",
        badges: ["Civil", "Mechanical", "Electrical"],
        steel: true,
        title: "Matunga LHB Coach Maintenance Facilities",
        meta: "Indian Railways / COFMOW · 27,090 m³ RCC",
        alt: "The LHB shed K.D. Constructions built at Matunga Workshop, under its full-length arched roof",
      },
    ] as readonly ProjectEntry[],

    small: [
      {
        live: false,
        statusBadge: "",
        badges: ["Civil", "Mechanical", "Electrical"],
        steel: true,
        title: "Sanpada Carshed",
        /* Client corrected Indian Railways -> Central Railway, per the
           doc's own Signature Projects entry. See OPEN-QUESTIONS.md #19. */
        meta: "Central Railway · 11,338 m³ RCC",
        alt:
          "Aerial view of the Sanpada carshed built by K.D. Constructions, roofed maintenance " +
          "bays alongside stabling lines",
      },
      {
        live: false,
        statusBadge: "",
        badges: ["Civil", "Structural Steel"],
        steel: true,
        title: "Matunga Z-Bridge",
        /* The Matunga Workshop FOB. Was titled that per #19b; renamed back
           to the name it is known by at the user's request 2026-09-29
           (OPEN-QUESTIONS.md #41). Its own photograph since 2026-09-28
           (#38), no longer a stand-in. */
        meta: "Central Railway · 303m Span",
        alt: "Aerial view of the Matunga Z-Bridge by K.D. Constructions, its covered deck running the length of the workshop yard",
      },
      {
        live: true,
        /* The small tier's own markup never renders statusBadge — see
           Listing.astro — so "Recently Awarded" is carried in `meta`
           instead of invented as a new small-tier badge slot. */
        statusBadge: "",
        badges: ["Mechanical"],
        title: "Solapur Vande Bharat Maintenance Depot",
        meta: "Central Railway · Recently Awarded",
        /* Stand-in — Matunga's own Vande Bharat trainset photo, honestly
           captioned as what it shows rather than as Solapur. See
           OPEN-QUESTIONS.md #19b. Said to be representative since 22 Oct
           2026 (#62). */
        alt: "Representative image: K.D. Constructions railway shed work, a Vande Bharat trainset inside a maintenance shed",
        representative: "Representative image",
      },
      {
        live: true,
        statusBadge: "",
        badges: ["Civil"],
        title: "Lower Parel Railway Redevelopment",
        meta: "Western Railway · Recently Awarded",
        /* Stand-in — no dedicated photograph exists. See
           OPEN-QUESTIONS.md #19b. Said to be representative since 22 Oct
           2026 (#62); PHOTOS.md has the frame from the Nhava Sheva folder. */
        alt: "Representative image: K.D. Constructions station work, a platform under a full-length canopy",
        representative: "Representative image",
      },
    ] as readonly ProjectEntry[],

    /* Steel Fabrication & Erection — at the user's request
       (OPEN-QUESTIONS.md #31). Two entries at the foot of the listing,
       inside the ink band rather than as a band of their own: a new light
       band here would sit against "Beyond the railway" (mist), light on
       light, which DESIGN-SYSTEM §2 forbids.

       `plant` is K.D.'s own steel factory, not a client project — so it
       has no status and links to its own facility page,
       /resources/vindhane-plant (#33; until then it linked to /resources).
       Scope and machinery are the source doc's (from the Company Profile
       deck, #28b); the photograph is PHOTOS.md B19.

       `ledger` is the source doc's own per-project steel figures, each
       row linking to its project page. The total is their sum, 11,664.88
       MT, rounded down. Rows say "fabrication & erection" only where the
       doc does (Panvel–Karjat, Sanpada, Matunga FOB); LHB and Nhava Sheva
       & Uran are stated as "structural steel" and say exactly that.
       Harbour Line has no tonnage in the doc, so its row carries the four
       launch locations instead. */
    steel: {
      plant: {
        badge: "Our Own Plant",
        title: "Vindhane Steel Fabrication Plant",
        meta: "Vindhane · Raigad",
        body:
          "Girders, trusses, FOBs, cover-over-platforms, steel roofing systems and " +
          "large-span industrial sheds, fabricated in-house on welding, bending and " +
          "cutting lines.",
        alt:
          "Fabricated steel plate girders in the yard of K.D. Constructions' Vindhane plant, a " +
          "Hydra crane alongside",
      },
      ledger: {
        kicker: "Steel Fabrication & Erection",
        value: "11,600+ MT",
        body:
          "Structural steel delivered across five projects, including FOBs " +
          "fabricated, launched and erected over running railway lines.",
        items: [
          { title: "Panvel–Karjat Railway Line", figure: "4,686 MT", label: "Fabrication & erection" },
          { title: "Nhava Sheva & Uran Railway Stations", figure: "3,046 MT", label: "Structural steel" },
          { title: "Matunga LHB Coach Maintenance Facilities", figure: "1,816 MT", label: "Structural steel" },
          { title: "Sanpada Carshed", figure: "1,412 MT", label: "Fabrication & erection" },
          { title: "Matunga Z-Bridge", figure: "704.88 MT", label: "303 m FOB erected over a running line" },
          { title: "Harbour Line FOBs & Trespass-Control", figure: "4 Locations", label: "FOBs launched over running lines" },
        ] as readonly SteelLedgerRow[],
      },
    },

    /* The Karjat RMC plant's card, beside Vindhane's under the "Plants"
       tab (2026-10-09). Same words as its own page, src/data/rmc-plant.ts;
       `file` is the page's hero frame, resolved by Listing.astro. */
    rmcPlant: {
      badge: "Our Own Plant",
      title: "RMC Plant, Karjat",
      meta: "Karjat · Raigad",
      body:
        "Ready-mix concrete batched under cover on our own plant, for greater control over " +
        "quality, consistency, availability and project scheduling.",
      file: "rmc-plant-01.jpg",
      alt: "K.D. Constructions' batching plant at Karjat under its red steel cladding, aggregate stockpiles in front",
    },

    /* Not a project — the one non-photographic entry in the band, and
       never filtered by the tabs above (see Listing.astro: it carries
       no `data-project-status`). Built on the ink-band "stat tile" fill
       (DESIGN-SYSTEM §4.1) rather than the white-band "story figure"
       pattern (about/Story.astro), because this band is ink and that
       one is a solid kd-ink fill meant for a light band. */
    pipeline: {
      kicker: "Active Pipeline",
      value: "₹362.90 Cr",
      body: "Three tenders currently in active quotation.",
      link: { label: "Growing National Footprint", href: "/about" } as NavLink,
    },
  },

  /* The Gallery tab's view — see components/projects/Gallery.astro. Not
     in the export; added at the user's request. The groups are the same
     objects the project pages use (src/data/gallery.ts), so a caption
     has one definition site. The two plants are appended after the
     projects (2026-09-28), so no project group changes index. */
  gallery: {
    kicker: "Gallery",
    heading: "Our projects, on site.",
    groups: allGalleries,
    lightbox: {
      previous: "Previous",
      next: "Next",
      close: "Close",
    },
  },

  /* Beyond the railway — projects/Social.astro, the mist band between
     the listing and the closing CTA. Not in the export; added at the
     user's request (OPEN-QUESTIONS.md #30) from the borrowed docs/
     folder, which records the company confirming these as its own
     work on 2026-08-18 and supplying nothing else — no client, scope
     or year. So each tile is a NAME, a LOCATION and a PHOTOGRAPH and
     nothing more: no badges, no meta stat, no page behind it, and no
     row in `listing`, whose cards all carry facts these do not have.
     Kharghar Football Stadium (confirmed, no photograph) and Kharghar
     Centre of Excellence (named, not confirmed) were held back until
     2026-09-18; they are now the two `pending` tiles at the end of the
     list — appended, so the six photographed tiles keep their edit
     keys — after the owner asked that every missing item be visible on
     the site during review (OPEN-QUESTIONS.md #32, PRE-LAUNCH.md #3).
     The spellings are the approved ones (Ulwe, Karanjade), not the
     source folders' (Ulwa, Karanjale). Every entry has a place in
     K.D.Website_Details.md §Further Projects. */
  social: {
    kicker: "Social & Public Infrastructure",
    heading: "Beyond the railway.",
    body:
      "A hospital, a school, a health centre, a golf course, a residential " +
      "tower and a road skywalk: K.D. Constructions' work across the public " +
      "buildings and amenities of Navi Mumbai.",
    items: [
      {
        title: "Bonkode FOB",
        location: "Bonkode · Navi Mumbai",
        file: "social-bonkode-fob.jpg",
        alt: "Bonkode FOB by K.D. Constructions: an enclosed tubular skywalk on steel lattice trestles over a landscaped median",
      },
      {
        title: "Ulwe Hospital",
        location: "Ulwe · Navi Mumbai",
        file: "social-ulwe-hospital.jpg",
        alt: "Ulwe Hospital, built by K.D. Constructions, seen from its gate",
      },
      {
        title: "Ulwe CIDCO School",
        location: "Ulwe · Navi Mumbai",
        file: "social-ulwe-cidco-school.jpg",
        alt: "Ulwe CIDCO School by K.D. Constructions: the completed school block, red-and-white elevation",
      },
      {
        title: "Karanjade Health Care",
        location: "Karanjade · Navi Mumbai",
        file: "social-karanjade-health-care.jpg",
        alt: "Karanjade Health Care by K.D. Constructions: the multi-storey health centre with its blue glazed stair column",
      },
      {
        title: "Kharghar Golf Course",
        location: "Kharghar · Navi Mumbai",
        file: "social-kharghar-golf-course.jpg",
        alt: "Kharghar Golf Course clubhouse seen across the green, a K.D. Constructions project",
      },
      {
        title: "Lush Meadows",
        location: "Kharghar · Navi Mumbai",
        file: "social-lush-meadows.jpg",
        alt: "Lush Meadows, Kharghar, by K.D. Constructions: the residential tower's entrance porch with its name lettering",
      },
      /* Confirmed work, no photograph on record. Since 2026-10-15 its tile
         is a representative image the user supplied, like the civic works
         below it (OPEN-QUESTIONS.md #48). Sir allowed it on 2026-10-19
         (PRE-LAUNCH.md S15, OPEN-QUESTIONS.md #56). A real photograph
         replaces it. */
      {
        title: "Kharghar Football Stadium",
        location: "Kharghar · Navi Mumbai",
        file: "representative-kharghar-football-stadium.jpg",
        alt: "Kharghar Football Stadium, representative image: a football pitch with floodlights and a covered stand, wooded hills behind",
        representative: "Representative image",
      },
      /* Folded into the stadium on 2026-10-19 (retired, its page a 301 to
         the stadium's) and its own project again on 2026-10-21, at Sir's
         word both times: the tile is back in its own slot, so its keys
         (projects.social.items.7.*) are the ones it had, and so is its page
         (OPEN-QUESTIONS.md #56, #58). Still no image, so still pending. */
      {
        title: "Kharghar Centre of Excellence",
        location: "Kharghar · Navi Mumbai",
        pending: "To be confirmed",
        note:
          "CIDCO's football training centre, pitches inaugurated 2022. But K.D. " +
          "Constructions' part in it is not yet confirmed, and no photograph is on record. " +
          "A yes and one photograph fill this tile; a no removes it.",
      },
      /* Eight works from K.D.'s own list of completed works, appended
         2026-10-13 at the client's direction — one tile and one page
         each (OPEN-QUESTIONS.md #44). No photograph of any is on record.
         The client allows a generic, representative image for these,
         marked as one; until each arrives its tile is a `pending` tile
         like the one above them. Never a photograph of a different work.
         2026-10-15: seven arrived (OPEN-QUESTIONS.md #48), each tile now
         `file` + `representative`. 2026-10-21: Rabale needs none. Its
         photographs had been filed with Bonkode's; the user sorted them
         into their own folder, so its tile is a real photograph, the
         frame that was Bonkode's tile until then (OPEN-QUESTIONS.md #59). */
      {
        title: "Ghansoli Roads & Services",
        location: "Ghansoli · Navi Mumbai",
        file: "representative-ghansoli-roads-and-services.jpg",
        alt: "Ghansoli Roads & Services, representative image: a concrete road with a paved footpath, street lights and towers",
        representative: "Representative image",
      },
      {
        title: "Kamothe Peripheral Roads",
        location: "Kamothe · Navi Mumbai",
        file: "representative-kamothe-peripheral-roads.jpg",
        alt: "Kamothe Peripheral Roads, representative image: a divided city road lined with trees, traffic both ways, at sunset",
        representative: "Representative image",
      },
      {
        title: "Vashi Station Approach Road",
        location: "Sanpada · Navi Mumbai",
        file: "representative-vashi-station-approach-road.jpg",
        alt: "Vashi Station Approach Road, representative image: a busy road leading to Vashi railway station at sunset",
        representative: "Representative image",
      },
      {
        title: "Ulwe Mass Housing Infrastructure",
        location: "Ulwe · Navi Mumbai",
        file: "representative-ulwe-mass-housing-infrastructure.jpg",
        alt: "Ulwe Mass Housing Infrastructure, representative image: a divided road between residential towers",
        representative: "Representative image",
      },
      {
        title: "Ulwe Sector 8 Infrastructure",
        location: "Ulwe · Navi Mumbai",
        file: "representative-ulwe-sector-8-infrastructure.jpg",
        alt: "Ulwe Sector 8 Infrastructure, representative image: a new concrete road being finished, kerbs being set beside it",
        representative: "Representative image",
      },
      {
        title: "Kharghar 33 kV Substation",
        location: "Kharghar · Navi Mumbai",
        file: "representative-kharghar-33-kv-substation.jpg",
        alt: "Kharghar 33 kV Substation, representative image: an outdoor substation of transformers behind its gate",
        representative: "Representative image",
      },
      {
        title: "Rabale Skywalk",
        location: "Rabale · Navi Mumbai",
        file: "social-rabale-skywalk.jpg",
        alt: "Rabale Skywalk by K.D. Constructions: glazed skywalk with a lift tower at each end, spanning a busy road",
      },
      {
        title: "NMMC School No. 54 & 55",
        location: "Rabale · Navi Mumbai",
        file: "representative-nmmc-school-no-54-and-55.jpg",
        alt: "NMMC School No. 54 & 55, representative image: two school buildings with sports courts between them, behind the entrance gate",
        representative: "Representative image",
      },
    ] as readonly SocialProject[],
  },

  cta: {
    kicker: "Next Horizon",
    headline: "Three tenders in active quotation. Total pipeline: ₹362.90 Cr.",
    button: { label: "Learn About Us", href: "/about" } as NavLink,
  },
} as const;

export type ProjectsCopy = typeof projects;
export default projects;
