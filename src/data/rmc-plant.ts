/* ============================================================
   /resources/rmc-plant-karjat copy — the Karjat ready-mix concrete plant
   ------------------------------------------------------------
   Added at the user's request on 2026-09-28, the sibling of
   /resources/vindhane-plant (src/data/plant.ts) and built to the same
   shape: hero with figures, overview, two hairline lists, gallery,
   then an ink band before the footer.

   ALMOST NOTHING IS ON RECORD. The source doc gives the plant one
   sentence (K.D.Website_Details.md §Ready-Mix Concrete) and KD_INFO.md
   §4.7 confirms only that it is owned, at Karjat, and ready-mix. Every
   line below is that sentence, the capability it names, or a `pending`
   placeholder (OPEN-QUESTIONS.md #32) — capacity, area, year and the
   batching equipment counts. `npm run check:placeholders` fails until
   each is filled or removed; PRE-LAUNCH.md has the rows. The
   photographs arrived 2026-09-28 (#38); what they plainly show — the
   enclosure, the silos, the covered bays — is now on the page.

   NO IMAGES are imported here, for the same reason as plant.ts: the
   check scripts load this file straight into Node. The gallery and the
   hero name files in src/assets/gallery/ (rmc-plant-*.jpg).

   KEYS are `resources.rmc.*` — the page renders under the `resources`
   prefix, as the Vindhane page does with `resources.plant.*`.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink } from "./home.ts";
import type { GalleryPhoto } from "./gallery.ts";
import type { PlantListItem, PlantStat } from "./plant.ts";

export const rmcPlant = {
  meta: {
    title: "Karjat RMC Plant — K.D. Constructions",
    description:
      "K.D. Constructions' own ready-mix concrete plant at Karjat, Raigad — concrete supply " +
      "with greater control over quality, consistency, availability and project scheduling.",
  },
  nav: home.nav,
  footer: home.footer,

  rmc: {
    backLabel: "Resources",
    eyebrow: "Our Own Plant",
    title: "RMC Plant — Karjat",
    location: "Karjat · Raigad, Maharashtra",
    badges: ["Ready-Mix Concrete"],
    /* The hero is gallery frame rmc-plant-01.jpg, resolved by the page. */
    file: "rmc-plant-01.jpg",
    alt: "The Karjat batching plant under its red steel cladding, aggregate stockpiles in front",

    stats: [
      {
        pending: "To be added",
        title: "Production capacity",
        body: "Output of the Karjat plant, in cubic metres per hour or per day.",
      },
      {
        pending: "To be added",
        title: "Plant area & year",
        body: "Site area, in sq ft or acres, and the year the plant was commissioned.",
      },
    ] as readonly PlantStat[],

    overviewKicker: "The Plant",
    body: [
      "K.D. Constructions' own ready-mix concrete plant at Karjat strengthens the company's " +
        "concrete supply, with greater control over quality, consistency, availability and " +
        "project scheduling — reducing dependence on external suppliers.",
      /* From the company's labelled photographs, 2026-09-28 ("Covered RMC
         plant", "RMC plant coverage construction", "Silos", "TM loading"). */
      "The plant works fully under cover: batching, cement handling and transit-mixer " +
        "loading all happen inside a clad steel shed, with cement held in twin silos on site.",
      "Alongside the steel fabrication plant at Vindhane and a self-owned fleet of 50+ heavy " +
        "equipment units, it is part of the integrated resource base behind K.D.'s end-to-end " +
        "turnkey execution.",
    ],

    supplies: {
      head: "What the plant gives our projects",
      items: [
        { text: "Control over concrete quality" },
        { text: "Consistency from pour to pour" },
        { text: "Availability when the site needs it" },
        { text: "Supply planned around the project schedule" },
        { text: "Less dependence on external suppliers" },
      ] as readonly PlantListItem[],
    },
    equipment: {
      head: "How it is equipped",
      items: [
        /* What the photographs show; the counts are still pending. */
        { text: "Batching plant enclosed in a clad steel shed" },
        { text: "Twin cement silos" },
        { text: "Covered cement-bulker unloading bay" },
        { text: "Covered transit-mixer loading bay" },
        {
          pending: "To be added",
          title: "Plant specifications",
          body:
            "Batching plant make and capacity, number of transit mixers and concrete pumps, and " +
            "any on-site testing lab.",
        },
      ] as readonly PlantListItem[],
    },

    galleryKicker: "Plant Gallery",
    /* The company's labelled set, received 2026-09-28 — captions follow
       its file names (OPEN-QUESTIONS.md #38). */
    gallery: [
      { file: "rmc-plant-01.jpg", caption: "The batching plant under its red cladding, aggregate stockpiles in front" },
      { file: "rmc-plant-02.jpg", caption: "The plant fully enclosed, seen across the yard" },
      { file: "rmc-plant-03.jpg", caption: "Inside the covered shed: a transit mixer loading at left, a cement bulker at right" },
      { file: "rmc-plant-04.jpg", caption: "A transit mixer loading under the batching plant" },
      { file: "rmc-plant-05.jpg", caption: "A cement bulker unloading into the covered bay" },
      { file: "rmc-plant-06.jpg", caption: "The cement silos lifted into place by mobile crane" },
      { file: "rmc-plant-07.jpg", caption: "The twin cement silos during erection" },
      { file: "rmc-plant-08.jpg", caption: "Cladding the plant enclosure, a mobile crane lifting steel" },
      { file: "rmc-plant-09.jpg", caption: "The strip-curtained loading bay inside the shed" },
    ] as readonly GalleryPhoto[],
    lightbox: {
      previous: "Previous",
      next: "Next",
      close: "Close",
    },

    closing: {
      kicker: "Integrated Resources",
      heading: "Concrete on our own schedule.",
      body:
        "With concrete, steel and heavy equipment all under its own control, K.D. Constructions " +
        "delivers from the first foundation to final commissioning with fewer outside dependencies.",
      button: { label: "Our Capabilities", href: "/capabilities" } as NavLink,
    },
  },
} as const;

export type RmcPlantCopy = typeof rmcPlant;
