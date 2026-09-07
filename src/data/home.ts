/* ============================================================
   Homepage copy
   ------------------------------------------------------------
   CLIENT-APPROVED WORDING. Every string below was signed off. Do not
   reword, retitle, fix the punctuation, expand an abbreviation or
   "improve" a sentence. If something reads wrong, it goes in
   OPEN-QUESTIONS.md — it does not get edited here.

   NO HARDCODED STRINGS IN MARKUP. Templates read from this object and
   nothing else, so there is one place a copy change happens and one
   place to look for what the page says.

   SLOT KEYS MIRROR THIS OBJECT'S PATH, with the page as first segment:

       copy.hero.headline.lead   ->   data-edit="home.hero.headline.lead"
       copy.capabilities.cards[0].title
                                 ->   data-edit="home.capabilities.cards.0.title"

   That correspondence is the whole naming rule, and it is what makes a
   key predictable a year from now instead of something to look up. See
   DESIGN-SYSTEM.md §9 and the long note in src/lib/editable.ts.
   ============================================================ */

/* The hero's sub-paragraph is also the page's meta description. It is
   named once and referenced twice rather than typed twice, so a change
   to the approved wording cannot land in one place and not the other. */
const HERO_SUB =
  "Kailashchandra Dilipkumar Constructions Pvt. Ltd. — a full-spectrum EPC " +
  "contractor spanning civil, mechanical, and electrical engineering across " +
  "Indian Railways and urban infrastructure.";

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface Stat {
  readonly value: string;
  readonly label: string;
}

export interface CapabilityCard {
  readonly num: string;
  readonly title: string;
  readonly body: string;
}

export interface ProjectCard {
  readonly title: string;
  readonly badge: string;
  readonly meta: string;
  readonly alt: string;
}

export interface DifferentiatorCard {
  readonly title: string;
  readonly body: string;
}

export const home = {
  /* Head only. The design specifies neither a page title nor a meta
     description — see OPEN-QUESTIONS.md #7. Both are assembled from
     approved fragments rather than written fresh. */
  meta: {
    title: "K.D. Constructions — EPC Infrastructure · Vashi, Navi Mumbai",
    description: HERO_SUB,
  },

  nav: {
    logoAlt: "K.D. Constructions",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
    ] as readonly NavLink[],
    /* Nothing was designed behind this CTA — no contact page, no form,
       no phone or email anywhere in the frame. It points at the footer's
       Headquarters block so the primary call to action is live rather
       than a 404. OPEN-QUESTIONS.md #4. */
    cta: { label: "Get in Touch", href: "#contact" } as NavLink,
  },

  hero: {
    kicker: "EPC Infrastructure · Est. 1973",
    /* One heading, two spans. The accent span is the second one, and it
       is the mint half. They are stored without the joining space: the
       markup puts them on separate lines, so HTML's own whitespace
       collapsing supplies exactly one space between them. Storing a
       trailing space here would not survive the editor, which trims
       every value it reads off the page. */
    headline: {
      lead: "Building India's Infrastructure,",
      accent: "Brick by Brick.",
    },
    sub: HERO_SUB,
    buttons: {
      primary: { label: "View Projects", href: "/projects" },
      secondary: { label: "About Us", href: "/about" },
    },
    backdropAlt: "",
    stats: [
      { value: "₹220 Cr", label: "FY2025–26 Revenue" },
      { value: "53 Yrs", label: "Engineering Legacy" },
      { value: "₹500 Cr", label: "Vision 2030 Target" },
      { value: "41+", label: "Owned Equipment Units" },
    ] as readonly Stat[],
  },

  about: {
    kicker: "Our Company",
    quote: '"Fifty-three years is not time kept. It is trust, compounded."',
    body1:
      "What began in 1973 as a partnership firm delivering early Maharashtra " +
      "PWD works has grown into a full-spectrum EPC delivery partner — " +
      "spanning civil, mechanical, and electrical engineering, with a growing " +
      "footprint across Indian Railways infrastructure, government bodies, " +
      "and urban development.",
    body2:
      "Headquartered in Vashi, Navi Mumbai, K.D. Constructions has chosen, " +
      "year after year, to endure, to evolve, and to lead — reinvesting " +
      "retained earnings rather than distributing them, building a " +
      "zero-tolerance quality culture aligned with Railway Board standards.",
    stats: [
      { value: "2.85×", label: "Revenue growth since FY2020" },
      { value: "₹362 Cr+", label: "Active tender pipeline" },
    ] as readonly Stat[],
  },

  capabilities: {
    kicker: "Core Capabilities",
    heading: "Integrated EPC Delivery",
    cards: [
      {
        num: "01",
        title: "Civil Engineering",
        body:
          "Bridges, stations, workshops, and administrative buildings — " +
          "including Gati Shakti–aligned railway infrastructure.",
      },
      {
        num: "02",
        title: "Mechanical Engineering",
        body:
          "Inspection sheds, heavy repair sheds, and workshop systems " +
          "delivered without disrupting live rail operations.",
      },
      {
        num: "03",
        title: "Electrical Engineering",
        body:
          "Track engineering and electrical works integrated across civil " +
          "and mechanical scopes for full turnkey delivery.",
      },
      {
        num: "04",
        title: "Steel Fabrication",
        body:
          "In-house structural steel fabrication plant at Vindhane, Raigad — " +
          "reducing vendor dependency, tightening quality control.",
      },
    ] as readonly CapabilityCard[],
  },

  projects: {
    kicker: "Selected Work",
    heading: "Featured Projects",
    link: { label: "View All Projects", href: "/projects" } as NavLink,
    featured: {
      title: "Matunga Workshop",
      badge: "Civil · Mechanical · Electrical",
      meta: "Indian Railways · ₹165 Cr",
      alt: "The Carriage Repair Workshop Matunga entrance at dusk, lit water feature below the name wall",
    } as ProjectCard,
    cards: [
      {
        title: "Sanpada Carshed",
        badge: "Civil · Mechanical · Electrical",
        meta: "Indian Railways · ₹48 Cr",
        alt: "Aerial view of the Sanpada carshed, roofed maintenance bays alongside stabling lines",
      },
      {
        title: "Matunga Z-Bridge",
        badge: "Civil · Gati Shakti",
        meta: "Central Railway · ₹21 Cr",
        alt: "Steel truss foot overbridge on its piers, spanning railway tracks",
      },
    ] as readonly ProjectCard[],
  },

  differentiators: {
    kicker: "Our Differentiators",
    heading: "Why K.D. Constructions",
    cards: [
      {
        title: "Legacy & Trust",
        body:
          "53 years of engineering integrity across Maharashtra PWD, Indian " +
          "Railways, CIDCO, and NMMC. Trusted. Enduring.",
      },
      {
        title: "Financial Discipline",
        body:
          "Retained earnings reinvested — never distributed. A zero-tolerance " +
          "quality culture aligned with Railway Board standards.",
      },
      {
        title: "Full EPC Delivery",
        body:
          "Civil, mechanical, and electrical delivered in-house. Self-owned " +
          "41+ unit equipment fleet — zero rental leakage.",
      },
    ] as readonly DifferentiatorCard[],
  },

  cta: {
    kicker: "Active Tenders",
    headline: "₹362.90 Cr in active pipeline. Let's build together.",
    button: { label: "View Our Projects", href: "/projects" } as NavLink,
  },

  footer: {
    logoAlt: "",
    tagline: '"Building Excellence, Brick by Brick."',
    legalName: "Kailashchandra Dilipkumar Constructions Pvt. Ltd.",
    columns: {
      navigation: {
        head: "Navigation",
        links: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Projects", href: "/projects" },
        ] as readonly NavLink[],
      },
      headquarters: {
        head: "Headquarters",
        lines: ["Vashi, Navi Mumbai", "Maharashtra, India"] as readonly string[],
      },
      disciplines: {
        head: "Core Disciplines",
        items: [
          "— Civil Engineering",
          "— Mechanical Engineering",
          "— Electrical Engineering",
        ] as readonly string[],
      },
    },
    bottom: {
      /* Rendered as `© {year} <legal>`. The design shows 2025, which is
         already stale; the year is generated, so it cannot go stale
         again. It sits in its own `data-no-edit` span so that editing
         this line through the in-page editor cannot freeze a year into
         the copy. OPEN-QUESTIONS.md #2. */
      legal: "Kailashchandra Dilipkumar Constructions Pvt. Ltd. All rights reserved.",
      founding: "Founded 1973 · Incorporated 2004 · EPC Infrastructure",
    },
  },
} as const;

export type HomeCopy = typeof home;
export default home;
