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
      project — tonnage, or fabrication, launching and erection. Drives
      the "Steel Fabrication & Erection" tab only; a boolean, so
      check-edit-keys.mjs never looks for a slot for it (see `live`). */
  readonly steel?: boolean;
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
    title: "Projects — K.D. Constructions · Portfolio",
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
    backdropAlt: "",
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
     key moves. */
  filters: {
    tabs: ["All Projects", "Ongoing", "Completed", "Gallery", "Steel Fabrication & Erection"] as readonly string[],
  },

  /* One continuous ink band, tallest card first — not the 704/464
     side-by-side grid OPEN-QUESTIONS.md #5 guessed at before this page
     had an export. See #18 for what that guess got right and wrong. */
  listing: {
    featured: {
      live: true,
      statusBadge: "Ongoing — 90%+ Complete",
      badges: ["Civil"],
      steel: true,
      title: "Panvel–Karjat Railway Line",
      meta: "MUTP-III · 29.6 km Corridor",
      body:
        "Delivering direct CSMT–Panvel–Karjat suburban connectivity under " +
        "MUTP-III. Stations: Chikhale, Mohape, Chowk, Karjat.",
      footnote: "4 Stations · January 2026",
      /* No dedicated photograph exists for this project — see
         OPEN-QUESTIONS.md #18. The alt text describes the stand-in
         image actually in the box, not the project, the same way the
         Matunga Z-Bridge card's alt text does — see #19b. */
      alt: "K.D. Constructions workforce on site at Mankhurd",
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
        alt: "Architectural rendering of the Matunga Workshop administrative building",
      },
      {
        live: false,
        statusBadge: "",
        badges: ["Civil"],
        steel: true,
        title: "Nhava Sheva & Uran Railway Stations",
        meta: "Central Railway · 3,046 MT Steel",
        alt: "Aerial view of a new railway station, platform roof and approach roads",
      },
      {
        live: false,
        statusBadge: "",
        badges: ["Civil"],
        steel: true,
        title: "Harbour Line FOBs & Trespass-Control",
        meta: "MRVC · 4 Locations",
        alt: "Steel truss foot overbridge on its piers, spanning electrified railway tracks",
      },
      {
        live: true,
        statusBadge: "Ongoing — 60%+ Complete",
        badges: ["Civil"],
        title: "Mumbai Harbour Line Station Redevelopment",
        meta: "Mumbai Railway Vikas Corporation Ltd · 4 Stations",
        /* Stand-in — no dedicated photograph exists for this project.
           See OPEN-QUESTIONS.md #19b. */
        alt: "Railway station under construction, materials staged trackside",
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
        alt: "The LHB shed at Matunga Workshop under its full-length arched roof",
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
          "Aerial view of the Sanpada carshed, roofed maintenance bays " +
          "alongside stabling lines",
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
        alt: "Aerial view of the Matunga Z-Bridge, its covered deck running the length of the workshop yard",
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
           OPEN-QUESTIONS.md #19b. */
        alt: "Vande Bharat trainset inside a railway maintenance shed",
      },
      {
        live: true,
        statusBadge: "",
        badges: ["Civil"],
        title: "Lower Parel Railway Redevelopment",
        meta: "Western Railway · Recently Awarded",
        /* Stand-in — no dedicated photograph exists. See
           OPEN-QUESTIONS.md #19b. */
        alt: "Railway platform under a full-length station canopy",
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
          "Fabricated steel plate girders laid out in the Vindhane plant yard, a " +
          "Hydra crane alongside and the fabrication shed behind",
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
      "tower and a road skywalk — K.D. Constructions' work across the public " +
      "buildings and amenities of Navi Mumbai.",
    items: [
      {
        title: "Bonkode FOB",
        location: "Bonkode · Navi Mumbai",
        file: "social-bonkode-fob.jpg",
        alt: "Bonkode FOB — glazed skywalk with a lift tower at each end, spanning a busy road with traffic passing beneath",
      },
      {
        title: "Ulwe Hospital",
        location: "Ulwe · Navi Mumbai",
        file: "social-ulwe-hospital.jpg",
        alt: "Ulwe Hospital — the completed hospital building seen from its gate",
      },
      {
        title: "Ulwe CIDCO School",
        location: "Ulwe · Navi Mumbai",
        file: "social-ulwe-cidco-school.jpg",
        alt: "Ulwe CIDCO School — the completed school block, red-and-white elevation",
      },
      {
        title: "Karanjade Health Care",
        location: "Karanjade · Navi Mumbai",
        file: "social-karanjade-health-care.jpg",
        alt: "Karanjade Health Care — the multi-storey health centre with its blue glazed stair column",
      },
      {
        title: "Kharghar Golf Course",
        location: "Kharghar · Navi Mumbai",
        file: "social-kharghar-golf-course.jpg",
        alt: "Kharghar Golf Course — the clubhouse seen across the green",
      },
      {
        title: "Lush Meadows",
        location: "Kharghar · Navi Mumbai",
        file: "social-lush-meadows.jpg",
        alt: "Lush Meadows, Kharghar — the residential tower's entrance porch with the name lettering above it",
      },
      {
        title: "Kharghar Football Stadium",
        location: "Kharghar · Navi Mumbai",
        pending: "Photograph to be added",
        note:
          "Confirmed as K.D. Constructions' own work; no photograph is on record. One " +
          "landscape photograph of the stadium fills this tile.",
      },
      {
        title: "Kharghar Centre of Excellence",
        location: "Kharghar · Navi Mumbai",
        pending: "To be confirmed",
        note:
          "CIDCO's football training centre, pitches inaugurated 2022 — but K.D. " +
          "Constructions' part in it is not yet confirmed, and no photograph is on record. " +
          "A yes and one photograph fill this tile; a no removes it.",
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
