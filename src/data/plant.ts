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

   THE FIGURES A FACILITY PAGE LEADS WITH ARE NOT ON RECORD. Every peer
   opens with capacity in MT per annum, plant area and the year it was
   commissioned; none of the three appears in the source doc, the docs/
   folder or either deck (searched 2026-09-18). They are on the page as
   `pending` items — the review-only placeholder from OPEN-QUESTIONS.md
   #32 — so the client sees exactly which numbers are missing, and
   `npm run check:placeholders` fails until each is filled or removed.
   PRE-LAUNCH.md carries the same three rows.

   KEYS. The page renders under the `resources` prefix (it is a child
   of /resources, and Nav/SiteFooter write `resources.nav.*` there), so
   every key on it is `resources.plant.<path>` — distinct from the
   `resources.<path>` keys /resources itself uses, and on a different
   page path in any case.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink } from "./home.ts";
import { projects } from "./projects.ts";
import type { GalleryPhoto } from "./gallery.ts";

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

export const plant = {
  meta: {
    title: "Vindhane Steel Fabrication Plant — K.D. Constructions",
    description:
      "K.D. Constructions' in-house steel fabrication plant at Vindhane, Uran, Raigad — girders, " +
      "trusses, FOBs, cover-over-platforms, roofing systems and industrial sheds, fabricated " +
      "on welding, bending and cutting lines and erected by an owned crane fleet.",
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
      "Fabricated steel plate girders laid out in the Vindhane plant yard, a " +
      "Hydra crane alongside and the fabrication shed behind",

    /* Two figures the record supports, two it does not. "11,600+ MT" is
       the steel ledger's total on /projects (the doc's five tonnages sum
       to 11,664.88) and is labelled as what it is — steel delivered on
       projects, not plant output. "2 × 650 t" is the Vashi FOB lift, the
       one erection figure the doc gives. */
    stats: [
      {
        pending: "To be added",
        title: "Annual capacity",
        body: "Fabrication capacity of the Vindhane plant, in MT per annum or per month.",
      },
      {
        pending: "To be added",
        title: "Plant area & year",
        body: "Covered shed and open yard area, in sq ft or acres, and the year the plant was commissioned.",
      },
      { value: "11,600+ MT", label: "Structural steel across five projects" },
      { value: "2 × 650 t", label: "Telescopic cranes, Vashi FOB lift" },
    ] as readonly PlantStat[],

    overviewKicker: "The Plant",
    body: [
      "K.D. Constructions' in-house steel fabrication facility at Vindhane, Uran, Raigad, " +
        "gives the company direct control over structural steel production — quality, " +
        "cost and delivery schedules — for railway structures, bridges, FOBs, girders, " +
        "cover-over-platforms, steel roofing systems, large-span industrial sheds and " +
        "other structural works.",
      "The plant is equipped with welding, bending and cutting machinery and fabricates " +
        "in both truss and plate girder systems. Where a project calls for it, fabrication " +
        "also moves on site.",
      /* K.D.'s own LinkedIn posts, supplied by the user on 2026-09-28.
         No length is on record for the girder, so none is given. */
      "A 20-tonne EOT crane, now fully operational, makes heavy lifts safer and material " +
        "handling faster — and the plant has recently fabricated the longest girder in its " +
        "history.",
      "With fabrication in-house and an owned crane fleet for erection, K.D. controls the " +
        "full chain from shop floor to final alignment — which matters most where a launch " +
        "happens within a live railway environment with overhead OHE.",
    ],

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
    },
    machinery: {
      head: "How it is equipped",
      items: [
        { text: "Welding lines" },
        { text: "Bending machinery" },
        { text: "Cutting machinery" },
        { text: "20-tonne EOT crane" },
        { text: "Truss and plate girder fabrication" },
        { text: "On-site fabrication where a project calls for it" },
        {
          pending: "To be added",
          title: "Machine inventory",
          body:
            "Number and type of welding sets, cutting lines and EOT cranes, and the plant's " +
            "skilled workforce.",
        },
      ] as readonly PlantListItem[],
    },

    /* PHOTOS.md B19 and B20 — the two confirmed frames of the plant.
       B21 (EOT crane under a trussed shed) sits on the same slide of the
       annual deck but is uncaptioned there, so whether it is this shed
       is unconfirmed and it stays out until the company says. */
    galleryKicker: "Plant Gallery",
    gallery: [
      { file: "vindhane-plant-01.jpg", caption: "Fabricated plate girders laid out in the yard, Hydra crane alongside" },
      { file: "vindhane-plant-02.jpg", caption: "Welder at a wire-feed welding set inside the fabrication shed" },
    ] as readonly GalleryPhoto[],
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
        "crane fleet — including over running railway lines with overhead OHE. At the Vashi " +
        "FOB the structure was lifted into place with two 650-tonne telescopic cranes; on " +
        "the Harbour Line, FOBs were launched at four locations, with spans of 44.5 m + " +
        "24.9 m at Vashi–Sanpada and 38 m + 29.9 m at Nerul–Seawood.",
      ledgerHead: "Structural steel, by project",
      items: projects.listing.steel.ledger.items,
      button: { label: "View Steel Projects", href: "/projects#steel" } as NavLink,
    },
  },
} as const;

export type PlantCopy = typeof plant;
