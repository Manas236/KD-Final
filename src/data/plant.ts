/* ============================================================
   /resources/vindhane-plant copy — the Vindhane steel fabrication plant
   ------------------------------------------------------------
   Added at the user's request on 2026-09-18 — see OPEN-QUESTIONS.md
   #33. No design export covers a facility page; this is authored from
   K.D.Website_Details.md (§Steel Fabrication & Erection, §INTEGRATED
   MANUFACTURING & RESOURCES) and shaped the way peer contractors
   present an owned plant: a factsheet (location, figures, machinery,
   products), a gallery, and the erection side beside it with the
   projects as proof. Nothing here is a new fact — every figure is
   already on /projects or /capabilities.

   WHY A MODULE OF ITS OWN. The plant is K.D.'s own facility, not a
   client project, so it has none of the fields `ProjectDetail` is
   built on (client, status, live) and would have to fake them to sit
   in project-detail.ts. And this file imports NO IMAGES, on purpose:
   scripts/check-edit-keys.mjs and scripts/check-placeholders.mjs load
   it straight into Node. The hero image is imported by the page; the
   gallery names files in src/assets/gallery/ the way gallery.ts does.

   THE FIGURES A FACILITY PAGE LEADS WITH. Every peer opens with
   capacity, plant area and the year it started; none of the three was
   in the source doc, the docs/ folder or either deck (searched
   2026-09-18), so they were `pending` items — the review-only
   placeholder from OPEN-QUESTIONS.md #32 — PRE-LAUNCH.md rows 4a–4c.
   All three were filled on 2026-10-24 from the plant in-charge's
   answers (OPEN-QUESTIONS.md #65), in place, so no key moved. His
   machine list followed the same day (#66): every count on the page is
   his, and none beyond his list is written or implied.

   KEYS. The page renders under the `resources` prefix (it is a child
   of /resources, and Nav/SiteFooter write `resources.nav.*` there), so
   every key on it is `resources.plant.<path>` — distinct from the
   `resources.<path>` keys /resources itself uses, and on a different
   page path in any case.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink } from "./home.ts";
import { projects } from "./projects.ts";
import { vindhanePlantPhotos } from "./gallery.ts";

/** A hero tile: either a figure and what it counts (DESIGN-SYSTEM
    §4.1), or a placeholder for one the company has not supplied. */
export type PlantStat =
  | { readonly value: string; readonly label: string; readonly pending?: undefined }
  | { readonly pending: string; readonly title: string; readonly body: string };

/** A row in the products / machinery lists: a plain line, or a
    placeholder for the inventory the company has not supplied. */
export type PlantListItem =
  | { readonly text: string; readonly pending?: undefined }
  | { readonly pending: string; readonly title: string; readonly body: string };

/** A row in the covered-areas / team lists: what is counted, and the
    figure, drawn on the right. */
export type PlantFigure = { readonly label: string; readonly value: string };

export const plant = {
  meta: {
    title: "Vindhane Steel Fabrication Plant | K.D. Constructions",
    description:
      "K.D. Constructions' own steel fabrication plant at Vindhane, Uran, Raigad: " +
      "girders, trusses, FOBs, cover-over-platforms, roofing and industrial sheds.",
  },
  nav: home.nav,
  footer: home.footer,

  plant: {
    backLabel: "Resources",
    eyebrow: "Our Own Plant",
    title: "Vindhane Steel Fabrication Plant",
    location: "Vindhane, Uran · Raigad, Maharashtra",
    badges: ["Steel Fabrication & Erection"],
    /* The hero is PHOTOS.md B19, the same frame as the /projects card —
       imported by the page, not here (see the note above). */
    alt:
      "Fabricated steel plate girders in the yard of K.D. Constructions' Vindhane plant, a " +
      "Hydra crane alongside",

    /* Tiles 1 and 2 are the plant in-charge's figures, 2026-10-24
       (OPEN-QUESTIONS.md #65): capacity per month as given, and the
       five covered areas summed (the `areas` list below gives each). No
       yard area was given, so none is counted. "11,600+ MT" is
       the steel ledger's total on /projects (the doc's five tonnages sum
       to 11,664.88) and is labelled as what it is — steel delivered on
       projects, not plant output. "2 × 650 t" is the Vashi FOB lift, the
       one erection figure the doc gives. */
    stats: [
      { value: "100 to 120 MT", label: "Fabrication per month" },
      { value: "14,800 sq ft", label: "Covered area, fabricating since Sep 2024" },
      { value: "11,600+ MT", label: "Structural steel across five projects" },
      { value: "2 × 650 t", label: "Telescopic cranes, Vashi FOB lift" },
    ] as readonly PlantStat[],

    overviewKicker: "The Plant",
    body: [
      "K.D. Constructions' in-house steel fabrication facility at Vindhane, Uran, Raigad, " +
        "gives the company direct control over the quality, cost and delivery schedules of " +
        "structural steel production for railway structures, bridges, FOBs, girders, " +
        "cover-over-platforms, steel roofing systems, large-span industrial sheds and " +
        "other structural works.",
      "The plant is equipped with welding, bending and cutting machinery and fabricates " +
        "in both truss and plate girder systems. Where a project calls for it, fabrication " +
        "also moves on site.",
      /* K.D.'s own LinkedIn posts, supplied by the user on 2026-09-28.
         No length is on record for the girder, so none is given. */
      "A 20-tonne EOT crane, now fully operational, makes heavy lifts safer and material " +
        "handling faster, and the plant has recently fabricated the longest girder in its " +
        "history.",
      "With fabrication in-house and an owned crane fleet for erection, K.D. Constructions controls the " +
        "full chain from shop floor to final alignment, which matters most where a launch " +
        "happens within a live railway environment with overhead OHE.",
    ],
    /* The plant's own video, received 2026-10-15 (Vindhane Plant/
       Vidhane_Factory.mp4): the camera walks the length of a painted
       girder set on a trailer by crane, the lift gallery photograph 06
       shows. Drawn beside the paragraphs above as an /hse clip tile:
       public/video/<video>.mp4 with a .jpg poster, silent, looping.
       2026-10-19, Sir: the girder is for the Mankhurd foot-over-bridge
       (on the Mumbai Harbour Line Station Redevelopment page), and the
       caption named it (OPEN-QUESTIONS.md #56).
       2026-10-21, Sir: the plant engineer's word goes for this clip, so
       until he gives the caption it names no project: the title and the
       alt say only what the clip shows (OPEN-QUESTIONS.md #58;
       PRE-LAUNCH.md has the row for his caption).
       2026-10-22: the caption is "Mankhurd deck", and the alt opens
       with it (PRE-LAUNCH.md S18, OPEN-QUESTIONS.md #61). Later the same
       day it was cut to 125 characters or less, and names no place as
       where the girder was made (#62). */
    clip: {
      video: "vindhane-girder-dispatch",
      alt:
        "Mankhurd deck: a long painted steel girder on a multi-axle trailer, held on a crane's " +
        "chain in K.D. Constructions' plant yard",
      where: "Plant yard, Vindhane",
      title: "Mankhurd deck",
    },

    products: {
      head: "What the plant makes",
      items: [
        { text: "Foot overbridges (FOBs)" },
        { text: "Bridges and plate girders" },
        { text: "Trusses" },
        { text: "Cover-over-platform structures" },
        { text: "Steel roofing systems" },
        { text: "Large-span industrial sheds" },
      ] as readonly PlantListItem[],
      /* Since 2026-10-24 this column ends on machinery rows 7 and 8
         ("Truss and plate girder fabrication", "On-site fabrication where
         a project calls for it"): they say how the plant works rather
         than what it is equipped with, and with them here the two columns
         run 8 and 10 rows instead of 6 and 12 (OPEN-QUESTIONS.md #66).
         They stay in `machinery.items`, so their edit keys do not move. */
      machineryRows: [7, 8] as const,
    },
    machinery: {
      head: "How it is equipped",
      /* Counts from the plant in-charge, 2026-10-24 (OPEN-QUESTIONS.md
         #66), as he gave them: SFW and PUG are his words and are not
         expanded, the compressor's pressure is left out, and no count
         beyond his list is written. Each count went into the row it makes
         specific (0, 2, 4, 5, 6), which keeps its key. "Bending machinery"
         is not in his list; it stays as it was until K.D. says (PRE-LAUNCH.md
         S23). A count and its noun, and "with MSEB grid supply", are held
         together with no-break spaces (\u00a0), so a phone breaks rows 0
         and 6 at a comma and never strands "1" or "supply" (edit mode folds
         them to plain spaces, normalizeText in src/lib/editable.ts). */
      items: [
        { text: "12 welding sets: 6\u00a0electrode, 5\u00a0CO2\u00a0(MIG), 1\u00a0SFW" },
        { text: "Bending machinery" },
        { text: "4 gas cutters and 2 PUG cutting machines" },
        { text: "20-tonne EOT crane" },
        /* The three shops from the company's labelled photographs,
           2026-09-28; their counts and the grid supply from #66. */
        { text: "Metallising shop, 2 metallising guns" },
        { text: "Painting shop, 3 painting machines" },
        { text: "125\u00a0kVA diesel generator, with\u00a0MSEB\u00a0grid\u00a0supply" },
        /* 7 and 8 are drawn under "What the plant makes"
           (products.machineryRows). */
        { text: "Truss and plate girder fabrication" },
        { text: "On-site fabrication where a project calls for it" },
        /* Row 9 was the team and covered areas in one paragraph from
           the morning of 2026-10-24 (#65), never deployed; they are the
           `areas` and `team` lists now (#66), and 9 to 11 are his other
           machines. */
        { text: "3 core drill machines" },
        { text: "2 grinding machines (7 inch)" },
        { text: "Air compressor, full set" },
      ] as readonly PlantListItem[],
      /* The order this column draws its rows in, as indexes into
         `items`, the way about.ts orders the board: cutting, drilling and
         grinding beside welding, the compressor beside the paint shops,
         power last. Display only, so every row keeps its key. */
      order: [0, 2, 9, 10, 1, 3, 4, 5, 11, 6] as const,
    },

    /* The covered areas and the team, from the plant in-charge on
       2026-10-24 (OPEN-QUESTIONS.md #65). Until #66, later that day, they
       were one paragraph at the foot of "How it is equipped"; now they
       are a pair of lists of their own below it, the figure on the
       right. Roles and counts only: his answers named the people, and no
       name goes on the site. The five areas are as he gave them and sum
       to the total, which is also hero tile 2; "Welding and machinery
       store" is his "storage room for welding materials and machinery",
       short enough to sit on one line beside its figure on a phone. The
       team's three counts sum to 33. */
    areas: {
      head: "Covered areas",
      items: [
        { label: "Main workshop", value: "10,000 sq ft" },
        { label: "Copper slag blasting shop", value: "1,500 sq ft" },
        { label: "Painting area", value: "1,500 sq ft" },
        { label: "Paint storage room", value: "1,100 sq ft" },
        { label: "Welding and machinery store", value: "700 sq ft" },
      ] as readonly PlantFigure[],
      total: { label: "Total", value: "14,800 sq ft" } as PlantFigure,
    },
    team: {
      head: "Team",
      items: [
        { label: "Staff", value: "4" },
        { label: "Fabrication crew", value: "19" },
        { label: "Civil work", value: "10" },
      ] as readonly PlantFigure[],
      total: { label: "Total", value: "33" } as PlantFigure,
      /* The crew's trades, one line under the list. */
      note: "Crew trades: cutting, welding, core drilling, grinding, finishing and EOT crane operation.",
    },

    /* PHOTOS.md B19 and B20 first — the two frames from the annual deck.
       B21 (EOT crane under a trussed shed), uncaptioned there, is 16;
       17, the plant in-charge's own photograph of 24 Oct 2026, shows
       the same crane and shed, which settled PRE-LAUNCH.md S4
       (OPEN-QUESTIONS.md #66). */
    galleryKicker: "Plant Gallery",
    /* Captions live in gallery.ts, shared with /gallery and the /projects
       Gallery tab. */
    gallery: vindhanePlantPhotos,
    lightbox: {
      previous: "Previous",
      next: "Next",
      close: "Close",
    },

    /* The erection half, with the projects as proof. The rows are the
       steel ledger's own — one definition site, in projects.ts — each
       linking to its project page. */
    erection: {
      kicker: "Fabrication & Erection",
      heading: "From shop floor to final alignment.",
      body:
        "Girders and trusses fabricated at Vindhane are launched and erected by K.D.'s own " +
        "crane fleet, including over running railway lines with overhead OHE. At the Vashi " +
        "FOB the structure was lifted into place with two 650-tonne telescopic cranes; on " +
        "the Harbour Line, FOBs were launched at four locations, with spans of 44.5 m + " +
        "24.9 m at Vashi–Sanpada and 38 m + 29.9 m at Nerul–Seawood.",
      ledgerHead: "Structural steel, by project",
      items: projects.listing.steel.ledger.items,
      /* /projects (All): the steel ledger lists every steel project there.
         The #steel tab became "Plants" on 2026-10-09. */
      button: { label: "View Steel Projects", href: "/projects" } as NavLink,
    },
  },
} as const;

export type PlantCopy = typeof plant;
