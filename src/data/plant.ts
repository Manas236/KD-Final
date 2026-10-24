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
   answers (OPEN-QUESTIONS.md #65), in place, so no key moved. No
   machine count was given, and none is written or implied here.

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
       five covered areas summed (the row at the end of `machinery` lists
       them). No yard area was given, so none is counted. "11,600+ MT" is
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
      "With fabrication in-house and an owned crane fleet for erection, K.D. controls the " +
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
    },
    machinery: {
      head: "How it is equipped",
      items: [
        { text: "Welding lines" },
        { text: "Bending machinery" },
        { text: "Cutting machinery" },
        { text: "20-tonne EOT crane" },
        /* From the company's labelled photographs, 2026-09-28. */
        { text: "Metalizing shop" },
        { text: "Painting shop" },
        { text: "Diesel generator power for the shops" },
        { text: "Truss and plate girder fabrication" },
        { text: "On-site fabrication where a project calls for it" },
        /* Was the "Machine inventory" placeholder; filled in place on
           2026-10-24 from the plant in-charge (OPEN-QUESTIONS.md #65):
           roles and counts only, no names. Machine counts were not
           given, so the row has none. Each area is held together with
           no-break spaces (\u00a0) so a phone never ends a line on
           "1,500" and starts the next on "sq ft"; edit mode folds them
           to plain spaces (normalizeText in src/lib/editable.ts). */
        {
          text:
            "A team of 33: 4 staff, a 19-person fabrication crew and 10 on civil work. The crew " +
            "covers plate and gas cutting, welding including CO2, core drilling, grinding and " +
            "finishing, and EOT crane operation. Covered areas, 14,800\u00a0sq\u00a0ft in all: " +
            "main workshop 10,000\u00a0sq\u00a0ft, copper slag blasting shop 1,500\u00a0sq\u00a0ft, " +
            "painting area 1,500\u00a0sq\u00a0ft, paint storage room 1,100\u00a0sq\u00a0ft, and a " +
            "700\u00a0sq\u00a0ft storage room for welding materials and machinery.",
        },
      ] as readonly PlantListItem[],
    },

    /* PHOTOS.md B19 and B20 first — the two frames from the annual deck.
       B21 (EOT crane under a trussed shed) is uncaptioned there and
       stays out; 04 and 05 now show the EOT crane in the company's own
       labelled frames anyway. */
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
