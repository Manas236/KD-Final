/* ============================================================
   /about copy
   ------------------------------------------------------------
   CLIENT-APPROVED WORDING, transcribed from the /about design export.
   Same contract as src/data/home.ts: do not reword, retitle, fix the
   punctuation or "improve" a sentence. If something reads wrong it goes
   in OPEN-QUESTIONS.md — it does not get edited here.

   NO HARDCODED STRINGS IN MARKUP.

   SLOT KEYS MIRROR THIS OBJECT'S PATH, with the page as first segment:

       copy.journey.chapters[0].title
                             ->  data-edit="about.journey.chapters.0.title"

   ---- The chrome is referenced, not retyped ----

   `nav` and `footer` below are the SAME OBJECTS as home.ts's, imported
   rather than copied, so the nav labels and the footer address have one
   definition on the whole site and cannot drift between two pages.

   What is NOT shared is the slot keys they render under. DESIGN-SYSTEM
   §9: a key is unique per page and is never reused across pages, and a
   key's first segment is the page. So <Nav> and <SiteFooter> take a
   `page` prop, and the nav's first link is `home.nav.links.0.label` on
   `/` and `about.nav.links.0.label` on `/about`.

   That is not a workaround; it is what the storage already does. Every
   row in content_edits is filed under (page_path, edit_key) and
   /api/content only ever returns one path's rows, so an edit made to
   the nav on `/` was never going to appear on `/about` whatever the key
   said. Page-prefixed keys make the stored identity say so.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink, Stat } from "./home.ts";

/* The lead paragraph of the story band is also the page's meta
   description — approved copy that says what the company is in one
   sentence. Named once, referenced twice, so the two cannot drift. */
const STORY_LEAD =
  "K.D. Constructions is an EPC (Engineering, Procurement, Construction) " +
  "infrastructure company headquartered in Vashi, Navi Mumbai, with over five " +
  "decades of engineering integrity, financial discipline, and quiet precision " +
  "behind it.";

/** One block of the hero's meta row: a bold line and a muted line under it. */
export interface MetaPair {
  readonly name: string;
  readonly meta: string;
}

/** One chapter of the timeline. `phase` is the small grey word under the
    title — Origin, Formalization, Modern Era. */
export interface Chapter {
  readonly chapter: string;
  readonly title: string;
  readonly phase: string;
  readonly points: readonly string[];
}

/** One stacked block of the Vision/Mission band — a small mint label
    ("Our Vision", "Our Mission") over a paragraph, the same label
    treatment Board.astro already uses for a director's role. */
export interface VisionSection {
  readonly title: string;
  readonly body: string;
}

/** One card of the Philosophy band — reuses Hse.astro's own card
    grammar (differentiator grammar at four across) rather than
    inventing a fifth card variant. */
export interface PhilosophyCard {
  readonly title: string;
  readonly body: string;
}

export interface Director {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
}

export interface HseCard {
  readonly title: string;
  readonly body: string;
}

export const about = {
  /* Head only, and assembled from approved fragments rather than
     written fresh — see OPEN-QUESTIONS.md #7. */
  meta: {
    title: "About — K.D. Constructions · Founded 1973, Incorporated 2004",
    description: STORY_LEAD,
  },

  /* Shared chrome. Same strings as the homepage, different slot keys —
     see the note at the top of this file. */
  nav: home.nav,
  footer: home.footer,

  hero: {
    kicker: "About the Company",
    /* The page H1. The design gives this band no headline other than
       the pull-quote, so the quote IS the heading — set in d1, the
       page-H1 token, exactly as the export has it. */
    quote: '"Fifty-three years is not time kept. It is trust, compounded."',
    company: {
      name: "Kailashchandra Dilipkumar Constructions Pvt. Ltd.",
      meta: "Vashi, Navi Mumbai · EPC Infrastructure",
    } as MetaPair,
    founded: {
      name: "Founded 1973",
      meta: "Incorporated 2004",
    } as MetaPair,
    backdropAlt: "",
  },

  story: {
    kicker: "Our Story",
    heading: "Five Decades of Engineering Integrity",
    lead: STORY_LEAD,
    body1:
      "What began in 1973 as a partnership firm delivering early Maharashtra " +
      "PWD works has grown into a full-spectrum EPC delivery partner — " +
      "spanning civil, structural steel fabrication & erection, mechanical, " +
      "electrical, signalling & telecommunication, and track engineering, " +
      "with a growing footprint across Indian Railways infrastructure, " +
      "government bodies, and urban development.",
    body2:
      "The company has chosen, year after year, to endure, to evolve, and to " +
      "lead — reinvesting retained earnings rather than distributing them, " +
      "and building a zero-tolerance quality culture aligned with Railway " +
      "Board standards, reinforced by ISO 9001:2015, ISO 14001:2015 and ISO " +
      "45001:2018 certifications and membership of the Chamber of Railway " +
      "Industries (Rail Chamber).",
    /* The one figure the band sets on ink. Everything under it uses the
       light-band "about stat" pattern instead. */
    figure: {
      value: "₹220 Cr",
      label: "FY2025–26 Revenue",
      body:
        "2.85× growth from ₹77.14 Cr in FY2020. Revenue reinvested — never " +
        "distributed — compounding the company's structural capability.",
    },
    stats: [
      { value: "₹500 Cr", label: "Vision 2030 Turnover Target" },
      { value: "50+", label: "Self-Owned Equipment Units" },
      { value: "11.2%", label: "Projected CAGR, Indian Construction" },
      { value: "Zero", label: "Rental Leakage — Full Fleet Ownership" },
    ] as readonly Stat[],
  },

  journey: {
    kicker: "Our Journey",
    heading: "Three Chapters. One Legacy.",
    chapters: [
      {
        chapter: "Chapter I · 1973",
        title: "Founded on Principle",
        phase: "Origin",
        points: [
          "Established as a partnership firm in Dhule",
          "Delivered early Maharashtra PWD works",
          "Set the foundations of financial discipline",
          "Defined the core engineering practices that endure today",
        ],
      },
      {
        chapter: "Chapter II · 2004",
        title: "Built for Scale",
        phase: "Formalization",
        points: [
          "Incorporated as a Private Limited company",
          "Pre-qualified for Indian Railway infrastructure",
          "Delivered for CIDCO, NMMC, and allied government bodies",
          "Adopted HSE compliance and standardized practice",
        ],
      },
      {
        chapter: "Chapter III · 2017–",
        title: "The Next Horizon",
        phase: "Modern Era",
        points: [
          "Expanded into multi-disciplinary EPC delivery",
          "Established corporate HQ in Vashi, Navi Mumbai",
          "Extended reach from civil works into mechanical, electrical, and track engineering",
        ],
      },
    ] as readonly Chapter[],
  },

  /* NEW — see OPEN-QUESTIONS.md #20. K.D.Website_Details.md's "MISSION,
     VISION & PHILOSOPHY" section had no representation anywhere on the
     page; these two bands are grounded directly in that section rather
     than transcribed from a design export, since none exists for them.
     White band, Story's own text-block shape (kicker, d4 heading, a
     max-w-560 column) with Board.astro's small-mint-label-over-a-
     paragraph treatment for the two named statements. */
  vision: {
    kicker: "Our Vision & Mission",
    heading: "Vision 2030",
    sections: [
      {
        title: "Our Vision",
        body:
          "To become a leading national Engineering, Procurement, and " +
          "Construction (EPC) and Public-Private Partnership (PPP) company, " +
          "growing from a trusted regional infrastructure contractor into a " +
          "₹500 Crore enterprise by 2030. We envision a future built on " +
          "engineering excellence, digital innovation, sustainable " +
          "infrastructure and integrated project execution, expanding our " +
          "presence across geographies and emerging infrastructure sectors.",
      },
      {
        title: "Our Mission",
        body:
          "To deliver integrated, high-quality infrastructure through " +
          "engineering excellence, disciplined execution and responsible " +
          "innovation. Building on the values established since 1973, we " +
          "aim to create lasting infrastructure, earn enduring trust and " +
          "deliver measurable value to our clients, people and the " +
          "communities we serve.",
      },
    ] as readonly VisionSection[],
  },

  /* Ink band. Same card grammar as Hse.astro below it (differentiator
     grammar at four across, card 1 mint-topped) — the pattern
     OPEN-QUESTIONS.md #16b already names as the design's accepted
     fourth card variant, reused rather than invented a second time. */
  philosophy: {
    kicker: "Our Philosophy",
    heading: '"It is better to be safe than sorry."',
    cards: [
      {
        title: "Grit Over Shortcuts",
        body:
          "We believe challenging projects demand perseverance, resilience " +
          "and the determination to see them through.",
      },
      {
        title: "Integrity Over Expedience",
        body:
          "We conduct our work with honesty, accountability, financial " +
          "prudence and engineering integrity.",
      },
      {
        title: "Intelligence Over Convention",
        body:
          "We combine engineering expertise, practical experience, " +
          "technology and informed decision-making to build smarter " +
          "execution strategies.",
      },
      {
        title: "Safety Without Exception",
        body: "HSE is not a separate priority; it is part of every priority.",
      },
    ] as readonly PhilosophyCard[],
  },

  board: {
    kicker: "Board of Directors",
    heading: "The Stewards of the Vision",
    /* Kailash, not Mohanlal, is the Founding Director — the two roles and
       their remits were recorded the wrong way round here. Corrected in
       place so each director keeps his index and his stored edit keys;
       the array is therefore not in the approved slide's order. See
       OPEN-QUESTIONS.md #25. */
    directors: [
      {
        name: "Mohanlal S. Gindodia",
        role: "Director",
        bio:
          "Leads stakeholder engagement and government relations, unlocking " +
          "the trust that complex infrastructure demands.",
      },
      {
        name: "Kailash S. Gindodia",
        role: "Founding Director",
        bio:
          "Five decades at the helm — the architect of the firm's enduring " +
          "principles of precision, discipline, and engineering integrity.",
      },
      {
        name: "Shiv K. Gindodia",
        role: "Director · Inducted 2017",
        bio:
          "Carries the firm into its modern era — advancing technology, " +
          "sustainable development, HSE excellence, and a broader EPC horizon.",
      },
      {
        name: "Sarita K. Gindodia",
        role: "Director",
        bio:
          "Guides corporate strategy, financial strength, and governance — " +
          "the quiet framework behind sustainable growth.",
      },
    ] as readonly Director[],
  },

  hse: {
    kicker: "Health, Safety & Environment",
    heading: '"Everyone Goes Home."',
    cards: [
      {
        title: "Worker Welfare",
        body:
          "Medical fitness screening, HIV/AIDS awareness programmes, and " +
          "clean water access on every site.",
      },
      {
        title: "High-Risk Management",
        body:
          "Full-body harnesses for height work, fire protocols, and lux-meter " +
          "monitoring on every active site.",
      },
      {
        title: "Strict Compliance",
        body:
          "Zero tolerance for alcohol, drugs, or smoking, with a mandatory " +
          "six-hour abstinence period before every shift.",
      },
      {
        title: "Environmental Stewardship",
        body:
          "Noise limits on night operations, structured waste disposal " +
          "systems, and mosquito/vector prevention programmes.",
      },
    ] as readonly HseCard[],
  },

  cta: {
    kicker: "Vision 2030",
    headline: "Building the infrastructure India needs, next.",
    button: { label: "See Our Projects", href: "/projects" } as NavLink,
  },
} as const;

export type AboutCopy = typeof about;
export default about;
