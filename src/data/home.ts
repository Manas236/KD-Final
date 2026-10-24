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

/* The hero's sub-paragraph. Until 2026-10-12 it was the page's meta
   description as well, word for word. */
const HERO_SUB =
  "Kailashchandra Dilipkumar Constructions Pvt. Ltd. is a full-spectrum EPC " +
  "contractor spanning civil, structural steel fabrication & erection, " +
  "mechanical, electrical, signalling & telecommunication, and track " +
  "engineering across Indian Railways and public infrastructure.";

/* The page's meta description: the hero sub-paragraph above, cut to what
   a search result prints. That paragraph is 267 characters and a result
   stops near 160, so the description is its own sentence — the same
   claim, 155 characters at most, nothing in it the paragraph does not
   say. Change one, read the other. */
const META_DESCRIPTION =
  "K.D. Constructions. A full-spectrum EPC contractor for Indian Railways and public " +
  "infrastructure: civil, steel, mechanical, electrical, signalling, track.";

export interface NavLink {
  readonly label: string;
  readonly href: string;
  /** Nav only: the href of the top-level link this one drops down
      from. An attribute, never rendered text — check-edit-keys.mjs
      skips `.parent` the way it skips `.href`. */
  readonly parent?: string;
  /** Nav only: a top-level link's position on the bar, left to right.
      Array order cannot be display order — the index is the edit key. */
  readonly order?: number;
  /** Nav only: the link is off the nav but keeps its array slot, so no
      later link's index (and stored edit key) moves. Nav.astro skips it
      and check-edit-keys.mjs expects no slot for it. */
  readonly retired?: boolean;
}

export interface Stat {
  readonly value: string;
  readonly label: string;
  /** Off the page but keeps its array slot, so a later stat's index (its
      edit key) does not move: the nav's `retired` pattern. The hero skips
      it and check-edit-keys.mjs expects no slot for it. */
  readonly retired?: boolean;
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

/* A named standard and the discipline it covers. WEBSITE_INFO.md §12
   allows the STANDARD to be published and blocks the certificate
   number, so this pair is the whole of what the footer may say. */
export interface Certification {
  readonly standard: string;
  readonly covers: string;
  /** The certificate image the line opens (src/lib/certificates.ts), as
      `cert` on /hse's cards: an attribute's source, never text. */
  readonly cert?: string;
}

/* The certificate viewer's labels: the "View certificate" button on
   /hse's cards, the footer's certificate links and the viewer's Close
   (CertificateViewer.astro). Not edit slots: one label on several
   buttons, and a viewer that must close in edit mode too, so they are
   `data-no-edit` and changed here. Outside `home`, so the edit-key gate
   expects no slot for them. `stamp` is the viewing stamp drawn across
   the certificate (24 Oct 2026): `{date}` becomes the visitor's own date
   when the viewer opens, as "24 Oct 2026". The site's name is written
   here, never read from the address bar, which on the test link is a
   bare IP. */
export const certificateViewer = {
  view: "View certificate",
  close: "Close",
  stamp: "Viewed on kdconstructions.net · {date}",
} as const;

export const home = {
  /* Head only. The design specifies neither a page title nor a meta
     description — see OPEN-QUESTIONS.md #7. Both are assembled from
     approved fragments rather than written fresh. */
  meta: {
    /* The tab title is the company name and nothing else, set by the
       client 2026-10-14. A shared link keeps the longer line. */
    title: "K.D. Constructions",
    ogTitle: "K.D. Constructions | EPC Infrastructure · Vashi, Navi Mumbai",
    description: META_DESCRIPTION,
    /* og:image:alt (22 Oct 2026). The share picture is not the hero's:
       it is the Nhava Sheva aerial (src/pages/index.astro), so it gets its
       own words rather than the hero's. */
    shareAlt: "Aerial view of Nhava Sheva railway station, a K.D. Constructions project",
  },

  nav: {
    logoAlt: "K.D. Constructions",
    /* 2026-09-29: the bar had grown to nine links, so it was grouped
       into four — Home · About ▾ · Projects ▾ · Contact (Careers joined
       the bar beside Contact 2026-09-30). `parent` puts a
       link in that top-level link's drop-down (company pages under
       About, track-record pages under Projects); `order` places the
       top-level ones on the bar.

       NEVER REORDER OR INSERT: link i is edit key
       `<page>.nav.links.i.label` on every page, and a stored edit on
       index 6 must keep meaning "Contact". New links are appended
       (CSR 2026-09-18, OPEN-QUESTIONS.md #32; Gallery 2026-09-28, #39;
       Home and Careers 2026-09-29) and positioned by order/parent.

       2026-10-06 regroup: every page link that dropped from Projects
       moved under About, CSR left About for the bar, and Projects now
       drops down to its own page's tabs (appended entries 11–15, which
       Filters.astro opens from the URL hash).

       2026-10-09 (client feedback): Gallery left About — it lives under
       Projects only — so entry 8 is `retired`, not deleted. The Projects
       tab "Steel Fabrication & Erection" became "Plants" (entry 15), and
       "Company" (/company) was appended under About, first in its menu.

       2026-10-21 (Sir): the About menu's pages are sections of /about
       now, so its items jump there (/about#company ... /about#csr; Nav.astro
       scrolls on /about itself). HSE left the menu for CSR's place on the
       bar (order 2.2), and CSR joined the menu, last (its index, 7, sorts
       it after Clients). Labels unchanged. OPEN-QUESTIONS.md #58. */
    links: [
      { label: "About", href: "/about", order: 1 },
      { label: "Capabilities", href: "/about#capabilities", parent: "/about" },
      { label: "Projects", href: "/projects", order: 2 },
      { label: "Resources", href: "/about#resources", parent: "/about" },
      { label: "HSE", href: "/hse", order: 2.2 },
      { label: "Clients", href: "/about#clients", parent: "/about" },
      { label: "Contact", href: "/contact", order: 3 },
      { label: "CSR", href: "/about#csr", parent: "/about" },
      { label: "Gallery", href: "/gallery", parent: "/about", retired: true },
      { label: "Home", href: "/", order: 0 },
      { label: "Careers", href: "/careers", order: 2.5 },
      { label: "All Projects", href: "/projects#all", parent: "/projects" },
      { label: "Ongoing", href: "/projects#ongoing", parent: "/projects" },
      { label: "Completed", href: "/projects#completed", parent: "/projects" },
      { label: "Gallery", href: "/projects#gallery", parent: "/projects" },
      { label: "Plants", href: "/projects#plants", parent: "/projects" },
      { label: "Company", href: "/about#company", parent: "/about", order: 0 },
    ] as readonly NavLink[],
    cta: { label: "Get in Touch", href: "/contact" } as NavLink,
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
    /* Was "" until 22 Oct 2026. The first frame of the Uran drone loop,
       behind aria-hidden: for search engines, not read aloud. */
    backdropAlt: "Aerial view of Uran railway station, a K.D. Constructions project on the Nerul–Uran line",
    /* 21 Oct 2026, Sir: the two revenue figures are off the hero. They are
       retired, not removed, so home.hero.stats.1 and .3 keep their keys;
       the two left run as one row of two (Hero.astro). The ₹ figures in
       the About band and the closing banner stay. OPEN-QUESTIONS.md #58. */
    stats: [
      { value: "₹220 Cr", label: "FY2025–26 Revenue", retired: true },
      { value: "53 Yrs", label: "Engineering Legacy" },
      { value: "₹500 Cr", label: "Vision 2030 Target", retired: true },
      { value: "50+", label: "Owned Equipment Units" },
    ] as readonly Stat[],
  },

  about: {
    kicker: "Our Company",
    quote: '"Fifty-three years is not time kept. It is trust, compounded."',
    body1:
      "What began in 1973 as a partnership firm delivering early Maharashtra " +
      "PWD works has grown into a full-spectrum EPC delivery partner, " +
      "spanning civil, structural steel fabrication & erection, mechanical, " +
      "electrical, signalling & telecommunication, and track engineering, " +
      "with a growing footprint across Indian Railways infrastructure, " +
      "government bodies, and urban development.",
    body2:
      "Headquartered in Vashi, Navi Mumbai, K.D. Constructions has chosen, " +
      "year after year, to endure, to evolve, and to lead: reinvesting " +
      "retained earnings rather than distributing them, building a " +
      "zero-tolerance quality culture aligned with Railway Board standards, " +
      "and reinforced by ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 " +
      "certifications and membership of the Chamber of Railway Industries " +
      "(Rail Chamber).",
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
          "Railway stations, foot overbridges, bridges, workshops, depots, " +
          "earthworks, and rail corridors: the foundation of our " +
          "integrated EPC delivery.",
      },
      {
        num: "02",
        title: "Mechanical Engineering",
        body:
          "Inspection sheds, heavy repair sheds, and workshop systems, " +
          "plus specialised railway machinery sourced from OEMs and " +
          "supported through the DLP period.",
      },
      {
        num: "03",
        title: "Electrical Engineering",
        body:
          "Railway and building electrical works integrated with civil " +
          "and mechanical execution, including projects within live, " +
          "operational railway environments.",
      },
      {
        num: "04",
        title: "Steel Fabrication & Erection",
        body:
          "Girders and trusses fabricated at our own plant in Vindhane, " +
          "Raigad, then launched and erected on site, including FOBs " +
          "over running railway lines.",
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
      /* Was "1,816 MT Steel" — that tonnage is the LHB coach maintenance
         facility's, a separate contract with its own page. See
         OPEN-QUESTIONS.md #24. */
      meta: "Indian Railways · POH 350 → 575 Bogies/Month",
      alt: "Architectural rendering of the Matunga Workshop administrative building, a K.D. Constructions project",
    } as ProjectCard,
    cards: [
      {
        title: "Sanpada Carshed",
        badge: "Civil · Mechanical · Electrical",
        meta: "Central Railway · 11,338 m³ RCC",
        alt: "Aerial view of the Sanpada carshed built by K.D. Constructions, roofed maintenance bays alongside stabling lines",
      },
      {
        /* Renamed from "Matunga Z-Bridge" — this photo is a genuine
           Harbour Line FOB (Vashi–Sanpada), not the Matunga structure it
           was previously captioned as. See OPEN-QUESTIONS.md #19b. */
        title: "Harbour Line FOBs & Trespass-Control",
        badge: "Civil",
        meta: "MRVC · 4 Locations",
        alt: "Steel truss foot overbridge built by K.D. Constructions between Vashi and Sanpada, spanning railway tracks",
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
          "Retained earnings reinvested, never distributed. A zero-tolerance " +
          "quality culture aligned with Railway Board standards.",
      },
      {
        title: "Full EPC Delivery",
        body:
          "Civil, structural steel, mechanical, electrical, signalling & " +
          "telecom, and track engineering delivered in-house. Self-owned " +
          "50+ unit equipment fleet. Zero rental leakage.",
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
          { label: "Capabilities", href: "/about#capabilities" },
          { label: "Projects", href: "/projects" },
          { label: "Resources", href: "/about#resources" },
          { label: "HSE", href: "/hse" },
          { label: "Clients", href: "/about#clients" },
          { label: "Contact", href: "/contact" },
          { label: "CSR", href: "/about#csr" },
          { label: "Gallery", href: "/gallery" },
          { label: "Careers", href: "/careers" },
          { label: "Company", href: "/about#company" },
        ] as readonly NavLink[],
      },
      headquarters: {
        head: "Headquarters",
        lines: [
          "Office No. 1313/1314, Real Tech Park",
          "Sector 30A, Vashi, Navi Mumbai – 400703",
          "Maharashtra, India",
        ] as readonly string[],
      },
      disciplines: {
        head: "Core Disciplines",
        items: [
          "Civil Engineering",
          "Steel Fabrication & Erection",
          "Track Engineering",
          "Electrical Engineering",
          "Mechanical Engineering",
          "Signalling & Telecommunication",
        ] as readonly string[],
      },
    },

    /* The brand block's contact details, WEBSITE_INFO.md §Contact.
       Landline leads — that document says so in as many words. Each
       entry is a { label, href } pair so the URL sits in a field named
       `href`, which is what keeps it out of the copy gate: a URL is an
       attribute's source, not a run of text, and
       scripts/check-edit-keys.mjs skips exactly that suffix.

       The mobile numbers and the careers address are deliberately NOT
       here. The footer is the tender evaluator's first contact surface
       and one switchboard number is the answer it should give; the rest
       belong on a contact page the site does not yet have.
       OPEN-QUESTIONS.md #4. */
    contact: {
      links: [
        { label: "022-2781 5380", href: "tel:02227815380" },
        { label: "infra@kdconstructions.net", href: "mailto:infra@kdconstructions.net" },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/company/k-d-constructions/",
        },
      ] as readonly NavLink[],
    },

    /* WEBSITE_INFO.md §12: the standards belong wherever a tender
       evaluator looks, and the footer is one of those places. NAMES
       ONLY — certificate numbers stay blocked until they arrive, and
       §0 rule 3 forbids saying or implying RDSO certification.
       21 Oct 2026: the three certificates arrived; each line opens its
       own in the certificate viewer (`cert`), the words unchanged. */
    certified: {
      head: "Certified to",
      items: [
        { standard: "ISO 9001:2015", covers: "Quality management", cert: "iso-9001" },
        { standard: "ISO 14001:2015", covers: "Environmental management", cert: "iso-14001" },
        {
          standard: "ISO 45001:2018",
          covers: "Occupational health & safety management",
          cert: "iso-45001",
        },
      ] as readonly Certification[],
      association: "Member, Chamber of Railway Industries (Rail Chamber)",
    },

    bottom: {
      /* Rendered as `© {year} <legal>`. The design shows 2025, which is
         already stale; the year is generated, so it cannot go stale
         again. It sits in its own `data-no-edit` span so that editing
         this line through the in-page editor cannot freeze a year into
         the copy. OPEN-QUESTIONS.md #2. */
      legal: "Kailashchandra Dilipkumar Constructions Pvt. Ltd. All rights reserved.",
      founding: "Founded 1973 · Incorporated 2004 · EPC Infrastructure",
      /* The two legal pages (src/data/legal.ts), linked from every page
         as the convention is — in the bottom row, beside the copyright. */
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
      ] as readonly NavLink[],
    },
  },
} as const;

export type HomeCopy = typeof home;
export default home;
