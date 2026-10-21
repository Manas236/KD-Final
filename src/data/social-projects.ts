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

   UPDATE 2026-10-13: K.D.'s own list of completed works arrived (a
   screenshot of the table; OPEN-QUESTIONS.md #44). It names the
   contract for two of these — the Bonkode skywalk and the golf course
   clubhouse — which fills their scope tiles. Its department column
   disagrees with the client on both pages; neither client was changed
   (PRE-LAUNCH.md S12). The same day, at the client's direction, eight
   more works from that list each gained a tile on /projects and a page
   here — the last eight entries of SOURCES.

   UPDATE 2026-10-19: Sir answered the client question (Bonkode and
   Rabale skywalks NMMC, the golf course clubhouse CIDCO), and said the
   Kharghar Football Stadium and Centre of Excellence were one project:
   the centre's page went, its facts moved to the stadium's, and its URL
   redirected there (OPEN-QUESTIONS.md #56). UPDATE 2026-10-21: Sir made
   the centre its own project again. Its tile and page are back exactly
   as before the fold, the redirect is gone, and the stadium's third
   paragraph is retired (OPEN-QUESTIONS.md #58).

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
  /** The page's meta description, where the first paragraph is too long
      to be one: a search result stops near 160 characters, so this is
      that paragraph cut to 155 at most, nothing added. Left out, the
      first paragraph itself is used. */
  readonly description?: string;
  /** The paragraphs, keyed by index (`projects.detail.body.<i>`). A
      paragraph taken off keeps its slot as a `retired` entry, so no later
      paragraph's key moves and its key is never given to other text;
      SocialProjectPage.astro skips it and the gates expect nothing from
      it. */
  readonly body: readonly (string | RetiredParagraph)[];
  /** Cards above the paragraphs — the unconfirmed project's question,
      and Lush Meadows' portal-data check. */
  readonly notes?: readonly PendingNote[];
  /** The card in the gallery block while the project has no picture, in
      place of photoNote()'s "Photograph to be added" — for the works
      whose picture will be a representative image. */
  readonly photoNote?: PendingNote;
}

/** A paragraph off the page, kept for its slot and as a record. */
export interface RetiredParagraph {
  readonly retired: true;
  readonly text: string;
}

const TBA = "To be added";

/* The eight works added on 2026-10-13 from K.D.'s own list of completed
   works (OPEN-QUESTIONS.md #44). No photograph of any is on record, and
   the client allows a generic, representative image for them, marked as
   one on the tile and on the page header. Until each arrives the page
   carries this card. Never a photograph of a different work. Seven of the
   eight had one by 2026-10-15 (OPEN-QUESTIONS.md #48); build() drops the
   card for those. The eighth, the Rabale Skywalk, turned out to have
   photographs of its own, filed with Bonkode's until 2026-10-21
   (OPEN-QUESTIONS.md #59): it has a gallery, not this card. */
const IMAGE_NOTE: PendingNote = {
  pending: "Image to be added",
  title: "Image",
  body:
    "No photograph of this work is on record. A representative image, marked as one, becomes " +
    "this page's header and the project's tile on the Projects page.",
};

/* What every one of the eight still lacks. */
const YEAR: FactTile = { pending: TBA, title: "Year completed", body: "The year the work was handed over." };

const SOURCES: readonly SocialDetailSource[] = [
  {
    title: "Bonkode FOB",
    eyebrow: "Urban Infrastructure",
    /* Client, year, structure and access from the research the user
       supplied on 2026-09-28 (WorldArchitecture; the architect THE
       FIRM's own project page): NMMC — not CIDCO — designed 2010,
       completed 2012.
       2026-10-13: K.D.'s own list of completed works (OPEN-QUESTIONS.md
       #44) has this contract as "Construction of Skywalk at Khairane
       Bonkode on Thane Belapur Road" — that is the scope tile. The same
       list names the department as CIDCO, against the sources above.
       2026-10-19: Sir confirmed NMMC (PRE-LAUNCH.md S12, closed;
       OPEN-QUESTIONS.md #56), so the client tile stands as it was. */
    facts: [
      { value: "NMMC", label: "Client" },
      /* Company Profile deck, slide 10, and WorldArchitecture agree. The
         deck's first two captions are swapped — "The Bonkode Skywalk"
         sits over the clubhouse text and "Premium Clubhouse" over this
         one — but the pictures under each heading settle which is which. */
      { value: "72 × 3 m", label: "Skywalk, Length × Width" },
      { value: "Construction", label: "Scope of works" },
      { value: "2012", label: "Year completed" },
    ],
    description:
      "Spanning the six-lane Thane–Belapur Road, the Bonkode foot-over-bridge gives the " +
      "people of Bonkode village a safe crossing to the TTC industrial belt.",
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
        body: "What K.D. Constructions delivered: civil and structural works, finishes, fire systems, services, or part of that.",
      },
      { pending: TBA, title: "Year completed", body: "The year the building was handed over." },
    ],
    description:
      "A CIDCO urban health centre at Ulwe, Navi Mumbai: a 20,000 sq ft facility with " +
      "fire-protection systems and stack parking, completed on schedule.",
    body: [
      "A CIDCO urban health centre at Ulwe, Navi Mumbai: a 20,000 sq ft facility with " +
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
        body: "Who the school was built for: CIDCO, as its name suggests, or another body.",
      },
      { pending: TBA, title: "Built-up area", body: "Built-up area, floors and number of classrooms." },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered: the whole building, or civil and structural works only.",
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
        body: "What K.D. Constructions delivered: the whole building, or civil and structural works only.",
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
       necessarily when K.D.'s package was handed over.
       2026-10-13: K.D.'s own list of completed works (OPEN-QUESTIONS.md
       #44) has this contract as "Construction of Club House for golf
       course at Kharghar" — so the scope tile is the clubhouse, and the
       year asked for is the clubhouse's. The same list names the
       department as NMMC; the course is CIDCO's and Kharghar is outside
       NMMC's limits. 2026-10-19: Sir confirmed CIDCO (PRE-LAUNCH.md S12,
       closed; OPEN-QUESTIONS.md #56), so the client tile stands as it was. */
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "103 ha", label: "Course, 18 holes, par 72" },
      { value: "Clubhouse", label: "Scope of works" },
      {
        pending: TBA,
        title: "Year completed",
        body: "The year the clubhouse was handed over.",
      },
    ],
    description:
      "CIDCO's Kharghar Valley Golf Course, across 103 hectares in Sector 22, Kharghar: " +
      "upgraded from 9 to 18 international-standard holes, reopened April 2026.",
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
      "K.D. Constructions built its clubhouse: a modern building with premium finishes, set in " +
        "landscaped grounds beside the greens, with a detention pond for flood control.",
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
        body: "What K.D. Constructions delivered: the whole building, or civil and structural works only.",
      },
      { pending: TBA, title: "Year completed", body: "The year the building was completed." },
    ],
    description:
      "Lush Meadows is a completed residential project at Kharghar, Navi Mumbai: 2 and " +
      "3 BHK homes, landscaped green spaces, play areas and indoor recreation.",
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
       so and does not call it complete.
       2026-10-19 the Centre of Excellence was folded into this page (a
       third paragraph, a rewritten description); 2026-10-21 Sir made it
       its own project again, and both are as they were before the fold.
       The third paragraph is retired, not removed: projects.detail.body.2
       on this page is never given to other text (OPEN-QUESTIONS.md #56,
       #58). */
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "40,000", label: "Planned capacity" },
      {
        pending: TBA,
        title: "Scope of works",
        body: "What K.D. Constructions delivered on the stadium: earthworks, pitch, stands, structure, or part of that.",
      },
      { pending: TBA, title: "Year completed", body: "The year K.D.'s works were handed over." },
    ],
    description:
      "Part of CIDCO's Football Maharashtra Centre of Excellence in Kharghar, the " +
      "stadium is planned as a 40,000-capacity, FIFA-approved venue.",
    body: [
      "Part of the Football Maharashtra Centre of Excellence developed by CIDCO in Kharghar, " +
        "the stadium is planned as a 40,000-capacity, FIFA-approved venue anchoring one of the " +
        "region's largest sports complexes.",
      "The wider complex brings together training pitches, a high-performance centre, a golf " +
        "course, a rugby stadium and a shooting range.",
      {
        retired: true,
        text:
          "The Centre of Excellence's two training pitches, in Sector 33, Kharghar, were " +
          "inaugurated in January 2022 and served as training venues for the AFC Women's Asian " +
          "Cup and the FIFA U-17 Women's World Cup, both held in India that year.",
      },
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
        body: "What K.D. Constructions delivered: the pitches, the buildings, site works, or part of that.",
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
  /* ---- The eight works from K.D.'s own list of completed works ----
     Added 2026-10-13 (OPEN-QUESTIONS.md #44). Client and scope are the
     list's "Name of Department" and "Description of Works"; the size
     tile is a figure the description itself gives, or a placeholder
     where it gives none. NO VALUES: the list has one per work, and
     contract values are dropped site-wide (docs/KD_INFO.md §7.1). The
     list gives no year for any of them. */
  {
    title: "Ghansoli Roads & Services",
    eyebrow: "Urban Infrastructure",
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "15 m & 20 m", label: "Road widths, Sectors 8 to 21" },
      { value: "Roads & services", label: "Scope of works" },
      YEAR,
    ],
    description:
      "15 m and 20 m wide roads across Sectors 8 to 21 of Ghansoli, Navi Mumbai, with " +
      "storm-water drains, water supply lines and sewer lines.",
    body: [
      "15 m and 20 m wide roads across Sectors 8 to 21 of Ghansoli, Navi Mumbai, built up to the " +
        "first stage of asphalting, with the storm-water drains, water supply lines and sewer " +
        "lines that serve them.",
    ],
    photoNote: IMAGE_NOTE,
  },
  {
    title: "Kamothe Peripheral Roads",
    eyebrow: "Urban Infrastructure",
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "20 m", label: "Road width, Sectors 19, 21 & 22" },
      { value: "Integrated development", label: "Scope of works" },
      YEAR,
    ],
    description:
      "Integrated development of the 20 m wide peripheral roads in Sectors 19, 21 and 22 of " +
      "Kamothe's Phase II area, Navi Mumbai, under the 12.5% scheme.",
    body: [
      "Integrated development of the balance half carriageway of the 20 m wide peripheral roads " +
        "in Sectors 19, 21 and 22 of Kamothe's Phase II area, under the 12.5% scheme.",
    ],
    photoNote: IMAGE_NOTE,
  },
  {
    title: "Vashi Station Approach Road",
    eyebrow: "Urban Infrastructure",
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "12 m", label: "Road width" },
      { value: "Balance work", label: "Scope of works" },
      YEAR,
    ],
    body: [
      "The balance work of the 12 m wide approach road connecting Sanpada to the south side of " +
        "Vashi Railway Station, Navi Mumbai.",
    ],
    photoNote: IMAGE_NOTE,
  },
  {
    title: "Ulwe Mass Housing Infrastructure",
    eyebrow: "Urban Infrastructure",
    facts: [
      { value: "CIDCO", label: "Client" },
      {
        pending: TBA,
        title: "Extent of works",
        body: "Road length, area served, or the main quantities of the work.",
      },
      { value: "Integrated development", label: "Scope of works" },
      YEAR,
    ],
    body: [
      "Integrated development around the mass housing scheme at Sector 19A, Ulwe, Navi Mumbai.",
    ],
    photoNote: IMAGE_NOTE,
  },
  {
    title: "Ulwe Sector 8 Infrastructure",
    eyebrow: "Urban Infrastructure",
    facts: [
      { value: "CIDCO", label: "Client" },
      {
        pending: TBA,
        title: "Extent of works",
        body: "Road length, area served, or the main quantities of the work.",
      },
      { value: "Integrated development", label: "Scope of works" },
      YEAR,
    ],
    body: [
      "Integrated development of infrastructure works under the 12.5% scheme in Sector 8, Ulwe, " +
        "Navi Mumbai.",
    ],
    photoNote: IMAGE_NOTE,
  },
  {
    title: "Kharghar 33 kV Substation",
    eyebrow: "Urban Infrastructure",
    facts: [
      { value: "CIDCO", label: "Client" },
      { value: "33 kV", label: "Electric substation" },
      { value: "Civil works", label: "Scope of works" },
      YEAR,
    ],
    body: [
      "Civil works completing the 33 kV electric substation in Sector 23, at Kharghar's Central " +
        "Park, Navi Mumbai.",
    ],
    photoNote: IMAGE_NOTE,
  },
  {
    /* The list gives CIDCO; Rabale is in NMMC's area, like Bonkode.
       2026-10-19: Sir confirmed NMMC (PRE-LAUNCH.md S12, closed;
       OPEN-QUESTIONS.md #56). Until then the client tile was a "To be
       confirmed" placeholder. */
    title: "Rabale Skywalk",
    eyebrow: "Urban Infrastructure",
    facts: [
      { value: "NMMC", label: "Client" },
      { pending: TBA, title: "Length & width", body: "The skywalk's length and width." },
      { value: "Construction", label: "Scope of works" },
      YEAR,
    ],
    body: ["A skywalk across the Thane–Belapur Road at Rabale, Navi Mumbai, built by K.D. Constructions."],
  },
  {
    /* The list spells the locality "Rabada- Katkaripada". */
    title: "NMMC School No. 54 & 55",
    eyebrow: "Education",
    facts: [
      { value: "NMMC", label: "Client" },
      { value: "2 floors", label: "First and second floor" },
      { value: "Extension", label: "Scope of works" },
      YEAR,
    ],
    body: [
      "Extension of the first and second floors of Navi Mumbai Municipal Corporation School " +
        "No. 54 & 55 at Rabale–Katkaripada, Navi Mumbai.",
    ],
    photoNote: IMAGE_NOTE,
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
      title: `${item.title} | K.D. Constructions`,
      description:
        src.description ?? (typeof src.body[0] === "string" ? src.body[0] : undefined) ?? `${item.title}, ${place}.`,
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
      /* The caption on the hero when that picture is a representative
         image, not a photograph (OPEN-QUESTIONS.md #48). */
      representative: item.representative,
      facts: src.facts,
      overviewKicker: detailChrome.overviewKicker,
      notes: src.notes ?? [],
      body: src.body,
      /* No gallery block on a representative-image page with no
         photographs (see photoNote below), so no kicker for one. */
      galleryKicker: photos.length > 0 || !item.representative ? detailChrome.galleryKicker : undefined,
      gallery: photos,
      /* A representative image closes the "Image to be added" card: the
         page then has no gallery block until real photographs exist. */
      photoNote:
        photos.length === 0 && !item.representative ? (src.photoNote ?? photoNote(item.title)) : undefined,
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
