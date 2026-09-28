/* ============================================================
   /projects/<slug> copy — the "Beyond the railway" projects
   ------------------------------------------------------------
   One page for each tile of the Beyond the railway band on /projects
   (projects.social) — at the user's request on 2026-09-19, with the
   instruction to use whatever the project's .md files hold and to
   mark everything else "To be added". OPEN-QUESTIONS.md #36.

   UPDATE 2026-09-28: the user supplied public-source research on five
   of these (Bonkode FOB, Kharghar Golf Course, Lush Meadows, Kharghar
   Football Stadium, Kharghar Centre of Excellence) — client, size,
   year and a description, but never K.D.'s own scope, which stays a
   `pending` tile on every page. Each entry notes its sources and the
   research's own caveats. What follows is the original record.

   WHAT IS KNOWN, AND FROM WHERE. For six of the eight, the source doc
   (K.D.Website_Details.md §Further Projects) gives a name, a location
   and a folder of photographs — nothing else; the company confirmed
   them as its own work on 2026-08-18 and deferred the rest. The
   Company Profile deck (slide 10, read in OPEN-QUESTIONS.md #28b) adds
   a line of scope for three of them — the Bonkode skywalk, the golf
   course clubhouse, and a CIDCO urban health centre whose photograph
   is the Ulwe Hospital tile's building. Those lines are on the pages
   and are sign-off rows S6–S7 in PRE-LAUNCH.md: the deck is the
   company's own, but it is not the approved brief.

   WHAT IS NOT KNOWN IS DRAWN. Every page carries the same four facts
   in its hero — Client · size · Scope of works · Year completed — each
   one either a figure or a `pending` tile saying what the company has
   to supply. No contract value is asked for: values are dropped
   site-wide (docs/KD_INFO.md §7.1). The two projects with no
   photograph carry a "Photograph to be added" card where the gallery
   would be; the unconfirmed one carries a "To be confirmed" card
   first. All of it is review-only: scripts/check-placeholders.mjs
   lists every `pending` here and refuses a release build while one
   remains (OPEN-QUESTIONS.md #32), and PRE-LAUNCH.md rows 5a–5h say
   what closes each page.

   ONE DEFINITION SITE. Title, location, hero file and alt text are the
   /projects tile's own (projects.social.items); the gallery is the
   project's group in gallery.ts, which also feeds the Gallery tab; the
   chrome is detail-chrome.ts. This module adds only what the tile does
   not have. Every tile must have an entry below — build() throws
   otherwise, because a tile that links to a page that does not exist
   is a broken link.

   NO IMAGE IMPORTS, on purpose: scripts/check-edit-keys.mjs and
   scripts/check-placeholders.mjs load this module straight into Node.
   `detail.file` names a derivative in src/assets/gallery/ and is
   resolved by the page (src/lib/gallery-images.ts).

   KEYS. `socialPages[slug]` is the whole copy of one page, shaped the
   way the gate expects: `nav` and `footer` render as `projects.nav.*`
   / `projects.footer.*` (Nav and SiteFooter take page="projects", as
   on every /projects/<slug> page), and everything else is
   `projects.detail.<path>` — the same plain keys the railway project
   pages use, which cannot collide because each page is its own path.
   ============================================================ */
import { home } from "./home.ts";
import { projects } from "./projects.ts";
import type { SocialProject } from "./projects.ts";
import { getGallery } from "./gallery.ts";
import type { GalleryPhoto } from "./gallery.ts";
import { detailChrome } from "./detail-chrome.ts";
import { slugify } from "../lib/slug.ts";

/** A hero tile: a figure and what it counts (DESIGN-SYSTEM §4.1), or a
    placeholder for one the company has not supplied — the same union
    plant.ts uses for the Vindhane plant's tiles. */
export type FactTile =
  | { readonly value: string; readonly label: string; readonly pending?: undefined }
  | { readonly pending: string; readonly title: string; readonly body: string };

/** A review-only card in the white band: `pending` is the badge label. */
export interface PendingNote {
  readonly pending: string;
  readonly title: string;
  readonly body: string;
}

interface SocialDetailSource {
  /** Must match the tile's title in projects.social.items exactly. */
  readonly title: string;
  /** The kicker above the H1 — the project's sector, in the docs' own
      strand names (docs/KD_INFO.md §15, docs/WEBSITE_INFO.md). */
  readonly eyebrow: string;
  /** Always four, so the 2×2 grid is full: Client · size · Scope of
      works · Year completed, in that order on every page. */
  readonly facts: readonly [FactTile, FactTile, FactTile, FactTile];
  readonly body: readonly string[];
  /** Cards above the paragraphs — the unconfirmed project's question,
      and Lush Meadows' portal-data check. */
  readonly notes?: readonly PendingNote[];
}

const TBA = "To be added";

const SOURCES: readonly SocialDetailSource[] = [
  {
    title: "Bonkode FOB",
    eyebrow: "Urban Infrastructure",
    /* Client, year, structure and access from the research the user
       supplied on 2026-09-28 (WorldArchitecture; the architect THE
       FIRM's own project page): NMMC — not CIDCO — designed 2010,
       completed 2012. K.D.'s own scope is still not on record. */
    facts: [
      { value: "NMMC", label: "Client" },
      /* Company Profile deck, slide 10, and WorldArchitecture agree. The
         deck's first two captions are swapped — "The Bonkode Skywalk"
         sits over the clubhouse text and "Premium Clubhouse" over this
         one — but the pictures under each heading settle which is which. */
      { value: "72 × 3 m", label: "Skywalk, Length × Width" },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered — foundations, steelwork, cladding, lifts and ramps, or part of that.",
      },
      { value: "2012", label: "Year completed" },
    ],
    body: [
      /* The deck's "eco-friendly" is dropped: nothing says what makes it
         so, the same call #28b made on "some of the biggest in India". */
      "Spanning the six-lane Thane–Belapur Road, the Bonkode foot-over-bridge gives the " +
        "people of Bonkode village a safe crossing to the TTC industrial belt, where many of " +
        "them work.",
      "The 72-metre tubular steel structure, clad in glass and ACP, has a lift and a ramp on " +
        "each side for full accessibility, with glazed, naturally lit landings designed to " +
        "keep out the rain while allowing cross-ventilation.",
      /* "White House FOB" is the source doc's own name for it
         (§Further Projects). */
      "Known locally as the White House FOB, it was completed for the Navi Mumbai Municipal " +
        "Corporation in 2012 and conceived as a prototype for the corporation's other crossings.",
    ],
  },
  {
    title: "Ulwe Hospital",
    eyebrow: "Healthcare",
    /* Company Profile deck, slide 10, "Healthcare Facility": "CIDCO
       Urban Health Centre features 20,000 sq.ft area with fire systems
       and stack parking, completed within stipulated timelines." Its
       photograph is this tile's building (`Ulwa Hospital/1.jpg`) — same
       elevation, same gate. #28b read the card as Karanjade's by name;
       the picture says otherwise. PRE-LAUNCH.md S7 asks. */
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "20,000 sq ft", label: "Facility Area" },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered — civil and structural works, finishes, fire systems, services, or part of that.",
      },
      { pending: TBA, title: "Year completed", body: "The year the building was handed over." },
    ],
    body: [
      "A CIDCO urban health centre at Ulwe, Navi Mumbai — a 20,000 sq ft facility with " +
        "fire-protection systems and stack parking, completed within its stipulated timeline.",
    ],
  },
  {
    title: "Ulwe CIDCO School",
    eyebrow: "Education",
    facts: [
      {
        pending: TBA,
        title: "Client",
        body: "Who the school was built for — CIDCO, as its name suggests, or another body.",
      },
      { pending: TBA, title: "Built-up area", body: "Built-up area, floors and number of classrooms." },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered — the whole building, or civil and structural works only.",
      },
      { pending: TBA, title: "Year completed", body: "The year the school was handed over." },
    ],
    body: ["A completed school building at Ulwe, Navi Mumbai, delivered by K.D. Constructions."],
  },
  {
    title: "Karanjade Health Care",
    eyebrow: "Healthcare",
    facts: [
      {
        pending: TBA,
        title: "Client",
        body: "The authority or organisation the health centre was built for.",
      },
      { pending: TBA, title: "Built-up area", body: "Built-up area and number of floors." },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered — the whole building, or civil and structural works only.",
      },
      { pending: TBA, title: "Year completed", body: "The year the building was handed over." },
    ],
    body: [
      "A multi-storey health care building at Karanjade, Navi Mumbai, delivered by K.D. Constructions.",
    ],
  },
  {
    title: "Kharghar Golf Course",
    eyebrow: "Sports & Recreation",
    /* The course facts are from the research the user supplied on
       2026-09-28 (CIDCO's own page; Golf Course Architecture). NO COST:
       one source gives ₹109.65 cr for the 2021 upgrade, CIDCO's page
       ₹50.35 cr (likely the original 9-hole build), and values are
       dropped site-wide in any case (docs/KD_INFO.md §7.1). The year
       stays open: April 2026 is when the course reopened, not
       necessarily when K.D.'s package was handed over. */
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "103 ha", label: "Course, 18 holes, par 72" },
      {
        pending: TBA,
        title: "Scope of works",
        body: "Whether K.D. Constructions built the clubhouse only, or the course works — greens, drainage, retention ponds — as well.",
      },
      {
        pending: TBA,
        title: "Year completed",
        body: "The year K.D.'s package was handed over. The course reopened as 18 holes in April 2026 — say whether that is the work K.D. did.",
      },
    ],
    body: [
      "Set across 103 hectares of green hills in Sector 22, opposite Kharghar's Central Park, " +
        "CIDCO's Kharghar Valley Golf Course has been upgraded from 9 to 18 international-" +
        "standard holes and reopened in April 2026.",
      "The par-72, 7,137-yard layout, designed by Vijit Nandrajog of Golf Design India, works " +
        "with the valley's natural ridges, streams and rock outcrops, and its drainage and " +
        "retention-pond system is built for Mumbai's heavy monsoon. The course has hosted a " +
        "PGTI event.",
      /* Company Profile deck, slide 10 ("Premium Clubhouse") — the
         company's own description, kept as it words it; the detention
         pond is CIDCO's. */
      "Its clubhouse is a modern building with premium finishes, set in landscaped grounds " +
        "beside the greens, with a detention pond for flood control.",
    ],
  },
  {
    title: "Lush Meadows",
    eyebrow: "Residential",
    /* The deck's slide 11 carries Lush Meadows too, but its line is a
       sales pitch for the flats ("Escape the city's noise…"), not a
       contractor's description, and nothing of it is used. */
    /* Developer, flat types and sizes are PORTAL DATA (Square Yards,
       supplied by the user on 2026-09-28, which lists the project as
       "Kailash Lush Meadows"). The research itself says to check the
       RERA number on MahaRERA before using any of it, so the page
       carries a "To be verified" card until someone has. */
    facts: [
      { value: "Kailash Developers", label: "Developer" },
      { value: "2 & 3 BHK", label: "Homes, 711–852 sq ft" },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered — the whole building, or civil and structural works only.",
      },
      { pending: TBA, title: "Year completed", body: "The year the building was completed." },
    ],
    body: [
      "Lush Meadows is a completed residential project at Kharghar, Navi Mumbai, offering 2 and " +
        "3 BHK homes, with landscaped central green spaces, children's play areas and indoor " +
        "recreation.",
    ],
    notes: [
      {
        pending: "To be verified",
        title: "Figures from a property portal",
        body:
          "The developer, flat types and sizes come from a property-portal listing under " +
          "MahaRERA A51800000454. Check that registration on MahaRERA, and confirm what " +
          "K.D. Constructions built here, before launch.",
      },
    ],
  },
  {
    title: "Kharghar Football Stadium",
    eyebrow: "Sports & Recreation",
    /* From the research the user supplied on 2026-09-28 (WIFA; Free
       Press Journal). The stadium is PLANNED at 40,000 — the copy says
       so and does not call it complete. */
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "40,000", label: "Planned capacity" },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered on the stadium — earthworks, pitch, stands, structure, or part of that.",
      },
      { pending: TBA, title: "Year completed", body: "The year K.D.'s works were handed over." },
    ],
    body: [
      "Part of the Football Maharashtra Centre of Excellence developed by CIDCO in Kharghar, " +
        "the stadium is planned as a 40,000-capacity, FIFA-approved venue anchoring one of the " +
        "region's largest sports complexes.",
      "The wider complex brings together training pitches, a high-performance centre, a golf " +
        "course, a rugby stadium and a shooting range.",
    ],
  },
  {
    /* Named ★ in the brief's at-a-glance list (docs/KD_INFO.md §7.12).
       The facility's facts are now on record from the research the user
       supplied on 2026-09-28 (WIFA; Free Press Journal); K.D.'s part in
       it is not, so the "To be confirmed" card stays. The same FPJ
       article (Jul 2026) reports the facility largely unused for years:
       nothing here claims use or athlete numbers. */
    title: "Kharghar Centre of Excellence",
    eyebrow: "Sports & Recreation",
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "2", label: "Training pitches" },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered — the pitches, the buildings, site works, or part of that.",
      },
      { value: "2022", label: "Pitches inaugurated" },
    ],
    body: [
      "The Football Maharashtra Centre of Excellence is CIDCO's high-performance football " +
        "facility in Sector 33, Kharghar.",
      "Its two world-class training pitches were inaugurated in January 2022 and served as " +
        "training venues for the AFC Women's Asian Cup and the FIFA U-17 Women's World Cup, " +
        "both held in India that year.",
    ],
    notes: [
      {
        pending: "To be confirmed",
        title: "K.D. Constructions' own work?",
        body:
          "The facility's facts are from public sources; K.D. Constructions' part in it is not " +
          "yet confirmed. A yes keeps this page and fills the scope; a no removes the page and " +
          "its tile on the Projects page.",
      },
    ],
  },
];

/* Where a project has no photograph at all, the gallery block holds
   this card instead — the same label the project's /projects tile
   carries. */
function photoNote(title: string): PendingNote {
  return {
    pending: "Photograph to be added",
    title: "Photographs",
    body:
      `Landscape photographs of the ${title.replace(/^Kharghar /, "").toLowerCase()}. ` +
      "The first becomes this page's header image and the project's tile on the Projects page.",
  };
}

function build(item: SocialProject) {
  const src = SOURCES.find((s) => s.title === item.title);
  if (!src) {
    throw new Error(`social-projects.ts: no page entry for the /projects tile "${item.title}"`);
  }
  const photos: readonly GalleryPhoto[] = getGallery(item.title)?.photos ?? [];
  const place = item.location.replace(/ · /g, ", ");

  return {
    meta: {
      title: `${item.title} — K.D. Constructions`,
      description: src.body[0] ?? `${item.title}, ${place}.`,
    },
    nav: home.nav,
    footer: home.footer,
    detail: {
      backLabel: detailChrome.backLabel,
      eyebrow: src.eyebrow,
      title: item.title,
      location: item.location,
      /* The /projects tile's frame and alt text. Absent on a project with
         no photograph: the hero is then plain ink. */
      file: item.file,
      alt: item.alt,
      facts: src.facts,
      overviewKicker: detailChrome.overviewKicker,
      notes: src.notes ?? [],
      body: src.body,
      galleryKicker: detailChrome.galleryKicker,
      gallery: photos,
      photoNote: photos.length === 0 ? photoNote(item.title) : undefined,
      /* Only rendered where there is something to open. */
      lightbox: photos.length > 0 ? detailChrome.lightbox : undefined,
      ctaKicker: detailChrome.ctaKicker,
      ctaHeadline: detailChrome.ctaHeadline,
      ctaButton: detailChrome.ctaButton,
    },
  };
}

export type SocialPageCopy = ReturnType<typeof build>;

/** Every Beyond the railway project's page copy, keyed by the same
    slugify() of its title that the /projects tile links with. */
export const socialPages: Readonly<Record<string, SocialPageCopy>> = Object.fromEntries(
  projects.social.items.map((item) => [slugify(item.title), build(item)])
);

export function getSocialPage(slug: string): SocialPageCopy | undefined {
  return Object.hasOwn(socialPages, slug) ? socialPages[slug] : undefined;
}
