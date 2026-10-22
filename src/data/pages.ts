/* ============================================================
   Copy for the lighter pages: /capabilities, /resources, /hse,
   /clients, /contact, /csr, /careers
   ------------------------------------------------------------
   All seven render through src/components/InfoPage.astro — hero,
   a stack of card sections, closing CTA — so each export here has the
   same shape. One export per page, not one object keyed by page,
   because check-edit-keys.mjs compares a page against every string in
   its export, and a shared object would report the other five pages'
   copy as missing.

   Since 21 Oct 2026 /company, /capabilities, /resources, /clients and
   /csr are sections of /about (aboutSections, at the foot of this file)
   and their old addresses redirect there. Their exports stay as they
   were, keys and all; only /hse, /contact and /careers are still pages
   of their own here.

   Sources: K.D.Website_Details.md (authoritative) and KD_INFO.md for
   the contact details and fleet categories. Fleet categories are
   REPRESENTATIVE — never render a count that sums them (KD_INFO §5.1).

   `nav` and `footer` are home.ts's own objects, as on every page.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink } from "./home.ts";
import { slugify } from "../lib/slug.ts";
import { projects } from "./projects.ts";

export interface InfoItem {
  readonly title: string;
  readonly body?: string;
  readonly links?: readonly NavLink[];
  /** A file in src/assets/clients/, written by
      scripts/build-client-logos.mjs. An attribute's source, never text —
      check-edit-keys.mjs skips `.logo` the way it skips `.file`. A
      section in which any item has one gives every card a logo well. */
  readonly logo?: string;
  /** The logo's alt text, naming the client whose mark it is (22 Oct
      2026). An attribute, never text: check-edit-keys.mjs skips
      `.logoAlt`. Absent, the logo is decorative (alt=""). */
  readonly logoAlt?: string;
  /** A file in src/assets/directors/ (/company). An attribute's source,
      never text — check-edit-keys.mjs skips `.portrait`. */
  readonly portrait?: string;
  /** Rendered as a small label under the title — a director's role. */
  readonly role?: string;
  /** Label / value rows under the body (/company's registration card). */
  readonly facts?: readonly { readonly label: string; readonly value: string }[];
  /** REVIEW-ONLY. The card is a placeholder for content K.D. has not
      supplied: the value is the label it renders under ("To be added"),
      `title` names the missing thing and `body` says what is needed.
      InfoPage draws it dashed with a badge so nobody can mistake it
      for copy. scripts/check-placeholders.mjs lists every one and
      fails while any exists — none may survive to go-live. PRE-LAUNCH.md
      is the human side of the same list. */
  readonly pending?: string;
  /** Keys the card's copy by name (`<page>.<slot>.title`) instead of by
      position. For cards added at runtime — see InfoPage.astro. */
  readonly slot?: string;
  /** The job_posting_events id of a /careers posting card. */
  readonly posting?: number;
  /** When that posting stops being listed (ISO 8601), for the editor. */
  readonly expires?: string;
  /** Off the page, but keeps its array slot so no later card's index
      (and stored edit keys) moves: the nav's `retired` pattern.
      InfoSections.astro skips it; the gates expect nothing from it. */
  readonly retired?: boolean;
  /** The name of the card's certificate image, src/assets/certificates/
      <cert>.jpg, written watermarked by scripts/build-certificates.mjs.
      An attribute's source, never text: check-edit-keys.mjs skips
      `.cert`. While the image exists the card has a "View certificate"
      button (InfoSections.astro); while it does not, nothing shows. */
  readonly cert?: string;
}

export interface InfoSection {
  /** The section element's id, for an in-page link or a script. */
  readonly id?: string;
  readonly kicker: string;
  readonly heading: string;
  readonly intro?: string;
  readonly items: readonly InfoItem[];
}

export interface InfoPageCopy {
  readonly meta: { readonly title: string; readonly description: string };
  readonly nav: typeof home.nav;
  readonly hero: {
    readonly kicker: string;
    readonly title: string;
    readonly sub: string;
    /** Stat tiles under the sub-paragraph (/hse's record at a glance).
        A page without them renders exactly as before. */
    readonly stats?: readonly { readonly value: string; readonly label: string }[];
    readonly statsNote?: string;
  };
  readonly sections: readonly InfoSection[];
  /** `retired` on a page merged into /about (aboutSections, below): its
      closing CTA renders nowhere, and the gates expect no slot for it. */
  readonly cta: {
    readonly kicker: string;
    readonly headline: string;
    readonly button: NavLink;
    readonly retired?: boolean;
  };
  readonly footer: typeof home.footer;
}

const chrome = { nav: home.nav, footer: home.footer };

/* Every project title on /projects: the listing's railway cards (the
   same titles as their pages, project-detail.ts) and the Beyond the
   railway tiles. Read from projects.ts because this module, like it,
   must load in plain Node for the gates (no image imports). */
const projectTitles = new Set<string>([
  projects.listing.featured.title,
  ...projects.listing.medium.map((p) => p.title),
  ...projects.listing.small.map((p) => p.title),
  ...projects.social.items.map((p) => p.title),
]);

/** A link to a project's own page, labelled with its title: the same
    slugify() the /projects tiles and /projects/[slug] use, so the href
    cannot drift from the page it opens. The title must be one of the
    project titles above, so the label is exactly the page's title and
    never a page that does not exist; the module refuses to build
    otherwise. */
const work = (title: string): NavLink => {
  if (!projectTitles.has(title)) {
    throw new Error(`pages.ts: work("${title}") names no project on /projects`);
  }
  return { label: title, href: `/projects/${slugify(title)}` };
};

export const capabilities: InfoPageCopy = {
  meta: {
    title: "Capabilities | K.D. Constructions",
    description:
      "Civil, steel, track, electrical, mechanical and signalling & telecommunication " +
      "engineering, backed by in-house steel fabrication, RMC and a 50+ unit fleet.",
  },
  ...chrome,
  hero: {
    kicker: "Capabilities",
    title: "One integrated EPC framework.",
    sub:
      "From planning and engineering to procurement, construction, commissioning and project " +
      "management, we provide integrated end-to-end solutions tailored to railway and public " +
      "infrastructure.",
  },
  sections: [
    {
      kicker: "Engineering",
      heading: "Six engineering disciplines.",
      items: [
        {
          title: "Civil Engineering",
          body:
            "Railway stations, foot overbridges, bridges, buildings, workshops, depots, earthworks " +
            "and rail corridors: the foundation of our integrated EPC delivery.",
        },
        {
          title: "Steel Fabrication & Erection",
          body:
            "Girders, trusses, FOBs, cover-over-platforms, steel roofing and large-span sheds, " +
            "fabricated at our Vindhane plant or on site, then launched and erected, including " +
            "over running railway lines with overhead OHE.",
        },
        {
          title: "Track Engineering",
          body:
            "Permanent-way construction and associated railway track systems, integrated with " +
            "civil works and broader railway operations.",
        },
        /* The licence sentence is Sir's, 19 Oct 2026 (OPEN-QUESTIONS.md #56). */
        {
          title: "Electrical Engineering",
          body:
            "Railway and building electrical works, integrating power and electrical systems with " +
            "civil and mechanical execution, including within operational railway environments. " +
            "K.D. Constructions holds an electrical licence from the PWD to execute electrical works.",
        },
        {
          title: "Mechanical Engineering",
          body:
            "Railway sheds, inspection and heavy repair facilities, workshops and mechanical " +
            "installations, plus OEM-sourced railway machinery with maintenance support through " +
            "the DLP period.",
        },
        {
          title: "Signalling & Telecommunication",
          body:
            "Railway signalling and telecommunication works, including installation of Kavach, " +
            "India's indigenous Automatic Train Protection (ATP) system.",
        },
      ],
    },
    {
      kicker: "Integrated Manufacturing",
      heading: "Owned resources, greater control.",
      items: [
        {
          title: "Steel Fabrication",
          body:
            "Our in-house facility at Vindhane, Raigad supports railway structures, bridges, FOBs " +
            "and girders with control over quality, cost and delivery schedules.",
        },
        {
          title: "Ready-Mix Concrete",
          body:
            "Our RMC plant at Karjat gives greater control over concrete quality, consistency, " +
            "availability and scheduling.",
        },
        {
          title: "Heavy Equipment",
          body:
            "A self-owned fleet of 50+ heavy equipment units keeps execution capacity high and " +
            "dependence on rented equipment low.",
        },
      ],
    },
    {
      kicker: "One Integrated Delivery Model",
      heading: "From the first foundation to final commissioning.",
      intro:
        "Together, these capabilities allow K.D. Constructions to deliver end-to-end turnkey " +
        "infrastructure solutions, with greater control, accountability and reliability at " +
        "every stage.",
      items: [
        { title: "Engineering Expertise" },
        { title: "In-House Manufacturing" },
        { title: "Owned Resources" },
        { title: "Project Management" },
      ],
    },
  ],
  cta: {
    kicker: "Our Work",
    headline: "See these capabilities at work.",
    button: { label: "View Projects", href: "/projects" },
    retired: true,
  },
};

export const resources: InfoPageCopy = {
  meta: {
    title: "Resources | K.D. Constructions",
    description:
      "An in-house steel fabrication plant at Vindhane, an RMC plant at Karjat and 50+ " +
      "self-owned heavy equipment units.",
  },
  ...chrome,
  hero: {
    kicker: "Resources",
    title: "Owned plant. Owned fleet.",
    sub:
      "An integrated resource base of 50+ heavy equipment units, an in-house steel fabrication " +
      "plant and an RMC plant gives us control over supply, quality and delivery.",
  },
  sections: [
    {
      kicker: "Facilities",
      heading: "Two plants under our own control.",
      items: [
        {
          title: "Steel Fabrication Plant, Vindhane, Raigad",
          body:
            "Welding, bending and cutting lines producing girders, trusses, roofing systems and " +
            "sheds for railway structures, bridges and FOBs, with greater control over quality, " +
            "cost and delivery schedules.",
          /* The plant's own page — OPEN-QUESTIONS.md #33. */
          links: [{ label: "About the plant", href: "/resources/vindhane-plant" }],
        },
        {
          title: "RMC Plant, Karjat",
          body:
            "Ready-mix concrete supply with greater control over quality, consistency, availability " +
            "and project scheduling, reducing dependence on external suppliers.",
          /* Its own page since 2026-09-28 — OPEN-QUESTIONS.md #37. */
          links: [{ label: "About the plant", href: "/resources/rmc-plant-karjat" }],
        },
      ],
    },
    {
      kicker: "Equipment Fleet",
      heading: "50+ self-owned heavy equipment units.",
      intro:
        "Excavators, cranes, concrete mixers, road rollers and other construction machinery. " +
        "Representative categories in the fleet include:",
      items: [
        { title: "Excavators" },
        { title: "Mobile Cranes" },
        { title: "Transit Mixers" },
        { title: "Tipper Trucks" },
        { title: "Dumpers" },
        { title: "Backhoe Loaders" },
        { title: "Road Rollers" },
        { title: "Utility Vehicles" },
      ],
    },
  ],
  cta: {
    kicker: "Capabilities",
    headline: "Resources that power every discipline.",
    button: { label: "Our Capabilities", href: "/capabilities" },
    retired: true,
  },
};

/* /hse's site record — see src/components/hse/Record.astro. A media item
   is a photograph (`file`, in src/assets/gallery/) or a silent looping
   clip (`video`, public/video/<name>.mp4 with a .jpg poster). */
export interface HseMedia {
  readonly file?: string;
  readonly video?: string;
  readonly alt: string;
  readonly title: string;
  readonly where: string;
  /** REVIEW-ONLY, as on InfoItem: a tile whose photograph or video K.D.
      has not supplied. Record.astro draws it dashed with this badge and
      `note`; scripts/check-placeholders.mjs fails while one remains. */
  readonly pending?: string;
  readonly note?: string;
}

export interface HseCard {
  readonly title: string;
  readonly where: string;
  readonly body?: string;
  readonly points?: readonly string[];
  /** Spans the whole row, under the paired cards — for the one card
      whose copy is much longer than its neighbours'. Beside a drill
      register (a band whose cards carry `media`), it spans two of the
      register's three columns instead. */
  readonly wide?: boolean;
  /** The photograph or clip of this same event, drawn at the head of
      the card with the card's own `where` and `title` over it, so the
      picture and its account are one block and nothing is said twice.
      Attributes only: its text is the card's. */
  readonly media?: { readonly file?: string; readonly video?: string; readonly alt: string };
  /** REVIEW-ONLY, as on InfoItem, on a card with `media`: one fact of
      the card K.D. has not given, its date. Record.astro draws the card
      dashed and this badge beside `where`, in the caption over the
      picture, where the date would be; scripts/check-placeholders.mjs
      fails while one remains. */
  readonly pending?: string;
  /** On a card with `media`: the label of the toggle that opens
      `points`. The first card of an odd-numbered register opens with
      them shown. */
  readonly more?: string;
}

export interface HseBand {
  readonly tone: "white" | "mist" | "ink";
  readonly kicker: string;
  readonly heading: string;
  readonly intro?: string;
  /** A standalone link right-aligned against the heading (DESIGN-SYSTEM §6). */
  readonly link?: NavLink;
  readonly media?: readonly HseMedia[];
  /** The media tiles share the cards' row instead of a row of their
      own, each tile as tall as the cards beside it. Three or more tiles
      still lead with the first across the row. */
  readonly side?: boolean;
  readonly stats?: readonly { readonly value: string; readonly label: string }[];
  readonly statsNote?: string;
  readonly cards?: readonly HseCard[];
  /** Card indexes in the order they are shown. The keys follow the
      array, never the order, so a card can move without its stored
      edits moving off it (DESIGN-SYSTEM §9). */
  readonly order?: readonly number[];
}

export interface HseCopy extends InfoPageCopy {
  readonly record: { readonly bands: readonly HseBand[] };
}

export const hse: HseCopy = {
  meta: {
    title: "Health, Safety & Environment | K.D. Constructions",
    description:
      "HSE is part of every priority at K.D. Constructions, certified to ISO 45001:2018 and " +
      "ISO 14001:2015.",
  },
  ...chrome,
  hero: {
    kicker: "Health, Safety & Environment",
    title: "It is better to be safe than sorry.",
    sub:
      "HSE is not a separate priority; it is part of every priority. We maintain the same " +
      "discipline, care and accountability on every project, at every site, every day.",
    /* The record at a glance, 15 Oct 2026, each figure taken from the
       page below it. Confirmed by K.D.'s HSE executive on 16 Oct 2026
       (OPEN-QUESTIONS.md #53): the man-hours are the Karjat site's, as
       of 7 March 2026, not a company-wide figure; the drills are "8+"
       for 2026 so far (the register shows seven of them); the camp was
       50 workers and staff, not 88. The note under the tiles is Sir's
       own wording, 19 Oct 2026, character for character (his curly
       apostrophe included); OPEN-QUESTIONS.md #56. */
    stats: [
      { value: "3,00,000", label: "Safe man-hours at Karjat site (as of March 2026)" },
      { value: "3", label: "ISO-certified management systems" },
      { value: "8+", label: "Site mock drills so far in 2026" },
      { value: "50", label: "Workers and staff in one medical camp" },
    ],
    statsNote:
      "Thanks to the commitment of every worker at Karjat, we’ve reached 3,00,000 safe " +
      "man-hours as of March 2026. Safety first, always.",
  },
  sections: [
    {
      kicker: "On Every Site",
      heading: "Four commitments, no exceptions.",
      items: [
        {
          title: "Worker Welfare",
          body:
            "Medical fitness screening, HIV/AIDS awareness programmes, and clean water access on " +
            "every site.",
        },
        {
          title: "High-Risk Management",
          body:
            "Full-body harnesses for height work, fire protocols, and lux-meter monitoring on every " +
            "active site.",
        },
        {
          title: "Strict Compliance",
          body:
            "Zero tolerance for alcohol, drugs, or smoking, with a mandatory six-hour abstinence " +
            "period before every shift.",
        },
        {
          title: "Environmental Stewardship",
          body:
            "Noise limits on night operations, structured waste disposal systems, and " +
            "mosquito/vector prevention programmes.",
        },
      ],
    },
    {
      kicker: "Certifications",
      heading: "Certified management systems.",
      /* CERTIFICATES (21 Oct 2026, Sir). `cert` names the watermarked copy
         of a card's certificate that scripts/build-certificates.mjs writes
         to src/assets/certificates/<cert>.jpg from the scans in
         ISO_Certificates/, Tax_Certificate/, CIDCO_Certificate/ and
         PWD_Licence/ (never committed, never served). A card whose copy
         exists gets a "View certificate" button and the viewer; a card
         without one shows neither. When a certificate is read, its number,
         certifying body and validity go on its card as `facts`
         ("Certificate number", "Certifying body", "Valid until"); a field
         that cannot be read is a "To be added" fact. None was in place on
         21 Oct 2026 at 17:00; that evening K.D. sent four (Certificates/):
         the three ISO certificates, issued by QRO on 20 May 2026, and the
         CBIC's Certificate of Appreciation for 2025–26. Their facts below
         are read off the certificates. The buttons, the footer's links and
         the viewer are drawn from the images themselves. */
      items: [
        {
          title: "ISO 45001:2018",
          body: "Occupational health & safety management.",
          cert: "iso-45001",
          facts: [
            { label: "Certificate number", value: "3050260520169HS" },
            { label: "Certifying body", value: "QRO Certification LLP" },
            { label: "Valid until", value: "19 May 2029" },
          ],
        },
        {
          title: "ISO 14001:2015",
          body: "Environmental management.",
          cert: "iso-14001",
          facts: [
            { label: "Certificate number", value: "3050260520170E" },
            { label: "Certifying body", value: "QRO Certification LLP" },
            { label: "Valid until", value: "19 May 2029" },
          ],
        },
        {
          title: "ISO 9001:2015",
          body: "Quality management.",
          cert: "iso-9001",
          facts: [
            { label: "Certificate number", value: "3050260520168Q" },
            { label: "Certifying body", value: "QRO Certification LLP" },
            { label: "Valid until", value: "19 May 2029" },
          ],
        },
        /* K.D.Website_Details.md's Leadership section ends on an open
           ask to the company: "Please give more details on
           Certifications: ISO certifications or any other certifications
           that your company has achieved". Nothing came back, so the ask
           is on the page where the client will see it. PRE-LAUNCH.md #2.
           19 Oct 2026: the PWD licence's number and validity joined the
           list (OPEN-QUESTIONS.md #56).
           RETIRED 21 Oct 2026: Sir's own sentence about the tax
           authorities, which he typed into this card on 9 Oct (a saved
           edit on the server), has a card of its own below (item 5), and
           the certificates now come as files (above). The slot is kept and
           the card simply stops rendering: his saved row is not touched,
           and these keys are never given to other text
           (OPEN-QUESTIONS.md #58). */
        {
          retired: true,
          pending: "To be added",
          title: "Other certifications & certificate details",
          body:
            "Certificate numbers, validity dates and the certifying bodies for the three ISO " +
            "standards, the number and validity of the PWD electrical licence, and any further " +
            "accreditation K.D. Constructions holds: RDSO approvals, the Rail Chamber " +
            "membership certificate, or others.",
        },
        /* Sir, 19 Oct 2026: K.D. holds an electrical licence from the PWD
           to execute electrical works. Appended after the pending card, not
           inserted, so no stored key moves (OPEN-QUESTIONS.md #56). No
           number or validity until K.D. supplies them. */
        {
          title: "PWD electrical licence",
          body: "Licensed by the Public Works Department to execute electrical works.",
          cert: "pwd-licence",
        },
        /* Appended 21 Oct 2026 (OPEN-QUESTIONS.md #58). The body is Sir's
           own sentence, word for word. The certificate (E-Certificate-
           27AACCK5158J1ZA.pdf, K.D.'s GSTIN) is the CBIC's Certificate of
           Appreciation for prompt GST returns and payment in 2025–26; the
           facts say so in its own terms. It has no validity date. */
        {
          title: "Recognition by Indian Tax Authorities",
          body: "Recognised by Indian Tax Authorities for Compliance Excellence.",
          cert: "tax-recognition",
          facts: [
            {
              label: "Issued by",
              value: "Central Board of Indirect Taxes and Customs, Ministry of Finance",
            },
            { label: "Awarded for", value: "Prompt GST returns and payment, financial year 2025–26" },
          ],
        },
        /* Appended 21 Oct 2026, Sir. Nothing about class, category or what
           the registration allows. */
        {
          title: "Registered with CIDCO",
          body:
            "K.D. Constructions is registered with CIDCO (City and Industrial Development " +
            "Corporation of Maharashtra).",
          cert: "cidco-registration",
        },
      ],
    },
  ],
  /* The EHS team's September 2026 site reports, band by band
     (OPEN-QUESTIONS.md #42). Rendered by src/components/hse/Record.astro
     between the card sections and the CTA. No worker names anywhere —
     the first-aid case is told by what happened and what changed. */
  record: {
    bands: [
      {
        tone: "white",
        kicker: "Emergency Preparedness",
        heading: "Drilled until it is routine.",
        intro:
          "Mock drills run on live sites, with the real equipment and the crews who would use it, " +
          "so the first minutes of a real emergency are ones everyone has already rehearsed.",
        link: { label: "Every drill photograph, in the gallery", href: "/gallery#safety-on-site" },
        /* THE DRILL REGISTER, 15 Oct 2026, at the user's direction: the
           band had grown to a wall of nine tiles, then a wall of seven
           cards telling the same drills again several screens further
           down. Now each drill is one card, its photograph or clip at
           the head with the card's own place and title over it, and its
           steps behind a toggle (open on the lead).

           The band's tile array (`media`) is gone, and with it every
           `hse.record.bands.0.media.*` key: retired, never to be reused.
           Its captions were the drills' titles again, or the heat-stress
           steps one photograph at a time. The cards keep their indexes,
           and so their keys; `order` sets where each is shown. Cards 7
           and 8 are the two GTB Nagar clips, which had a tile and no
           card. The photographs that left this page are all on /gallery
           (Safety on Site), which the band now links to. */
        order: [3, 7, 8, 0, 6, 5, 4, 1, 2],
        cards: [
          /* Client feedback 2026-10-09: images for the drills. The photo
             came from the EHS team's September WhatsApp reports. Its old
             body only restated the title; it now says what the picture
             shows. */
          {
            title: "Electrical-shock rescue drill",
            where: "Mankhurd Station",
            body:
              "Run on the live site: a supervisor directs the crew as the casualty is loaded into a " +
              "standby ambulance.",
            media: {
              file: "hse-electrical-shock-drill-mankhurd.jpg",
              alt: "K.D. Constructions electrical-shock mock drill at Mankhurd: the casualty is loaded into a standby ambulance",
            },
          },
          {
            title: "Fire extinguishers kept in service",
            where: "Every site",
            body:
              "Extinguishers are tracked and sent for refilling when due: seven 6 kg DCP units " +
              "at Mankhurd this September.",
          },
          {
            wide: true,
            title: "First aid, and what changed after it",
            where: "GTB Nagar · 17 September 2026",
            body:
              "A helper cut his hand on a sharp edge while shifting a cut column piece during FOB " +
              "deck fabrication. The wound was cleaned and dressed on site; no further treatment " +
              "was needed. What changed:",
            points: [
              "Sharp edges on cut column pieces are ground off or covered before they are moved.",
              "Hand gloves are mandatory when handling fabricated or cut steel.",
              "Correct handling and shifting methods followed for every piece.",
            ],
          },
          /* Appended 2026-10-13 (OPEN-QUESTIONS.md #44). The heat-stress
             steps are what its ten photographs show, in order. The
             register's lead: the newest drill, and the one told most
             fully. Its type, site and date are as K.D.'s HSE executive
             gave them on 16 Oct 2026 (#53): Emergency Mock Drill, Heat
             Stress (Heat Stroke); Karjat site; 08/10/2026. */
          {
            title: "Emergency mock drill, heat stress (heat stroke)",
            where: "Karjat site · 8 October 2026",
            body:
              "A mock drill for a worker overcome by heat while working at height, run on the live " +
              "site with the crew's own stretcher and supervisors.",
            media: {
              file: "hse-heat-stress-drill-08.jpg",
              alt: "K.D. Constructions heat-stress mock drill at Karjat: four men carry the casualty out on the stretcher",
            },
            more: "Step by step",
            points: [
              "A workman at the scaffold tower is overcome and goes down.",
              "The supervisor raises the alarm by phone.",
              "The crew carries the casualty clear of the work area.",
              "He is checked, then strapped to the stretcher.",
              "A four-man team carries the stretcher out.",
              "The whole crew assembles for a head count and debrief.",
            ],
          },
          /* The site's own mock drill report of 17 April 2026: the
             scenario and its three clock times, nothing else. No names —
             the report lists the coordinators and is signed. */
          {
            title: "Medical emergency drill, working at height",
            where: "Karjat · 17 April 2026",
            body:
              "The scenario: a workman falls from a scaffold while welding. Seven minutes pass " +
              "between the fall and the casualty leaving for hospital.",
            media: {
              file: "hse-karjat-height-drill-02.jpg",
              alt: "K.D. Constructions work-at-height mock drill at Karjat: the crew attends the casualty on an orange stretcher",
            },
            more: "Minute by minute",
            points: [
              "At 14:53 the workman falls from the scaffold.",
              "At 14:55 the supervisor alerts the project manager and the safety officer.",
              "The safety officer checks pulse and condition; a medical emergency is declared.",
              "At 15:00 the evacuation team has the casualty in a vehicle, bound for hospital.",
            ],
          },
          /* Appended 2026-10-15 (OPEN-QUESTIONS.md #47). The fire drill's
             six points are the HSE team's own seven discussion points, the
             last two joined; its clip is the site's own, of the fire being
             put out. The snake-bite card is the site's report of 27 August
             2026 and the HSE team's RIGHT rule and don'ts, given in Hindi,
             put into English. Its body no longer ends on a colon: the list
             it led into is behind the toggle now, whose label names it.
             No names.

             The fire drill's site is confirmed (Mohape site) and its date
             is not (16 Oct 2026, #53): "31 July 2026" was read off the
             camera's stamp on the photographs, and no document in the
             repo gives it. So the date is a placeholder, drawn as a chip
             beside the site over the clip, until the HSE team gives it. */
          {
            title: "Fire emergency drill",
            where: "Mohape site",
            pending: "To be added",
            body:
              "A test fire lit on the Mohape site and put out with the site's own extinguishers, by " +
              "the crew who would have to face a real one.",
            media: {
              video: "hse-mohape-fire-drill",
              alt: "K.D. Constructions fire mock drill at Mohape: a worker puts out the test fire with a powder extinguisher",
            },
            more: "What the drill covered",
            points: [
              "The alarm is raised with a shout of \"Fire, fire, fire\".",
              "The site supervisor and HSE officer are told; the response team moves at once.",
              "The right extinguisher is chosen and used correctly on the fire.",
              "Fire warden, first aider and response team each carry out their role.",
              "No injuries and no unsafe acts during the drill.",
              "The crew is briefed on what was learned; corrective actions follow.",
            ],
          },
          {
            title: "Snake-bite emergency drill",
            where: "RMC Plant, Karjat · 27 August 2026",
            body:
              "The scenario: a worker at the plant is bitten by a snake during routine work. Nearby " +
              "workers alert the supervisor and safety officer, and the response team carries him " +
              "by stretcher to a vehicle for hospital. Then the safety officer briefs the crew.",
            media: {
              file: "hse-karjat-snake-bite-drill-02.jpg",
              alt: "K.D. Constructions snake-bite mock drill at Karjat: the casualty on the stretcher, his arm bandaged and kept still",
            },
            more: "The RIGHT rule, and what never to do",
            points: [
              "Reassure: keep the victim calm, so he does not panic.",
              "Immobilise: keep the bitten limb still, and do not let him walk.",
              "Get to hospital: the nearest one, at once.",
              "Tell the doctor: when and where the bite happened, and every symptom.",
              "Never cut the wound or try to suck it.",
              "Never apply ice, soil, herbs or any home remedy.",
              "Never tie a tight tourniquet.",
              "Never try to catch or kill the snake.",
            ],
          },
          /* The two GTB Nagar clips, which were tiles with no card. Each
             body says what its clip shows (the clip's own alt until now). */
          {
            title: "Work-at-height medical emergency drill",
            where: "GTB Nagar Station",
            body: "Responders attend the casualty, carry him on a stretcher and load him into an ambulance.",
            media: {
              video: "hse-work-at-height-rescue-drill",
              alt: "K.D. Constructions work-at-height rescue drill at GTB Nagar Station",
            },
          },
          {
            title: "Fire-extinguisher drill",
            where: "GTB Nagar Station",
            body: "Workers take turns putting out a test fire with a DCP extinguisher while the crew watches.",
            media: {
              video: "hse-fire-extinguisher-drill",
              alt: "K.D. Constructions fire-extinguisher drill at GTB Nagar Station",
            },
          },
        ],
      },
      {
        tone: "mist",
        kicker: "Training",
        heading: "Taught on site, to the people doing the work.",
        /* Two sessions, side by side (15 Oct 2026), not a photograph
           with a long card a screen below it. */
        side: true,
        media: [
          {
            file: "hse-lifting-training-govandi.jpg",
            alt: "A K.D. Constructions HSE officer briefs workers and supervisors in the Govandi site office",
            title: "Lifting procedure and tools-and-tackles training",
            where: "Govandi Station",
          },
        ],
        cards: [
          {
            title: "Manual handling and work at height",
            where: "GTB Nagar Station · workers and supervisors",
            points: [
              "Safe manual handling and correct lifting methods",
              "Spotting manual-handling hazards and preventing injury",
              "PPE for material handling",
              "Safe working practice at height",
              "Using and inspecting harnesses and fall-arrest systems",
              "Safe access and egress at height",
              "Preventing slips, trips and falls",
              "Housekeeping and safe working conditions",
              "Emergency precautions and what to do after an incident",
            ],
          },
        ],
      },
      {
        tone: "white",
        kicker: "Worker Health",
        heading: "Health checks brought to the site.",
        /* The camp's photograph beside its card (15 Oct 2026). The card
           was titled "Medical camp, Mankhurd" over the head count, the
           photograph's own caption again; it now says what its list is.
           The two lists share three tests on purpose: one is the 12
           September camp, the other the routine checks. The camp was 50
           workers and staff, per K.D.'s HSE executive (16 Oct 2026, #53);
           the 88 the site said until then was wrong. */
        side: true,
        media: [
          {
            file: "hse-medical-camp-mankhurd.jpg",
            alt: "Workers queue outside the Mankhurd site office beside the free medical camp banner and K.D. safety posters",
            title: "Free medical camp for 50 workers and staff",
            where: "Mankhurd Station · 12 September 2026",
          },
        ],
        cards: [
          {
            title: "What was checked",
            where: "At the camp",
            points: [
              "Blood sugar",
              "Blood pressure",
              "Chest X-ray",
              "HIV testing",
              "Doctor's consultation and prescription",
              "Medicines and creams given as advised",
            ],
          },
          {
            title: "Routine health check-ups",
            where: "Site workforce",
            points: [
              "Blood pressure",
              "Blood sugar",
              "Eye check-up",
              "HIV/STI screening",
              "TB screening",
              "Other basic medical examinations",
            ],
          },
        ],
      },
      {
        tone: "ink",
        kicker: "Environment & Audits",
        heading: "Measured, not assumed.",
        intro:
          "Our HSE team runs its own air-quality and noise monitoring at the station sites, and " +
          "audits electrical safety every month.",
        stats: [
          { value: "14 µg/m³", label: "PM2.5" },
          { value: "16 µg/m³", label: "PM10" },
          { value: "67.8 dB(A)", label: "Noise" },
          { value: "28-point", label: "Electrical audit" },
        ],
        statsNote:
          "Air and noise: Govandi Station FOB, 26 September 2026. Electrical audit: Chowk, " +
          "September 2026, overall result satisfactory.",
        media: [
          {
            file: "hse-air-monitoring-mankhurd.jpg",
            alt: "Two K.D. Constructions HSE staff set up an ambient air sampler on the Mankhurd site",
            title: "Ambient air monitoring started",
            where: "Mankhurd Station",
          },
          {
            file: "hse-world-environment-day.jpg",
            alt: "K.D. Constructions workers gather beneath an FOB deck for a World Environment Day talk",
            title: "World Environment Day, 5 June",
            where: "Site assembly",
          },
        ],
        cards: [
          {
            title: "Monthly electrical safety audit",
            where: "Chowk and Mohape · Panvel–Karjat",
            points: [
              "Tools, cords, plugs and earthing",
              "ELCB/RCCB protection and closed panels",
              "Risk control near overhead power lines",
            ],
          },
          {
            title: "Air quality and noise",
            where: "Govandi and Mankhurd",
            points: [
              "PM2.5 and PM10, with a handheld monitor",
              "Formaldehyde (HCHO) and volatile organic compounds",
              "Noise, with a sound-level meter; an ambient air sampler at Mankhurd",
            ],
          },
        ],
      },
      {
        tone: "white",
        kicker: "Recognition",
        heading: "Safe work is noticed, and rewarded.",
        /* The awards card shares the second row with the two photographs
           of the day (15 Oct 2026). Its title repeated the photograph's
           caption beside it ("National Safety Day awards, Mankhurd"). */
        side: true,
        media: [
          {
            file: "hse-national-safety-week-karjat.jpg",
            alt: "Rows of workers in K.D. helmets and hi-vis harnesses seated on site for National Safety Week at Karjat",
            title: "3,00,000 safe man-hours without a lost-time injury",
            where: "National Safety Week · Karjat",
          },
          {
            file: "hse-national-safety-day-mankhurd.jpg",
            alt: "K.D. Constructions workers and site staff beneath the steel frame of the new Mankhurd FOB for National Safety Day",
            title: "National Safety Day",
            where: "Mankhurd Station",
          },
          {
            file: "hse-worker-recognition.jpg",
            alt: "A K.D. Constructions site worker in a hi-vis harness receives a prize and a handshake",
            title: "Prize distribution",
            where: "On site",
          },
        ],
        cards: [
          {
            title: "Awards on the day",
            where: "Every worker and staff member took the safety pledge",
            points: [
              "Best Drawing",
              "Best Slogan",
              "Best Worker of the Year",
              "Best Skilled Worker",
            ],
          },
        ],
      },
    ],
  },
  cta: {
    kicker: "Our Work",
    headline: "Safety delivered in live railway environments.",
    button: { label: "View Projects", href: "/projects" },
  },
};

/* /csr — K.D.Website_Details.md §CORPORATE SOCIAL RESPONSIBILITY.
   The source section is the copywriter's own "starting skeleton, not
   final copy": three real commitments and a literal "[To be added]"
   bullet naming what the company still has to supply. The three are
   rendered as the doc words them. The fourth is rendered too — as four
   `pending` cards, one per missing item, so the page exists and the
   gap is visible during review instead of the page being absent
   (OPEN-QUESTIONS.md #32). Every pending card is removed or filled
   before go-live: PRE-LAUNCH.md #1, and `npm run check:placeholders`
   fails while any remains.

   Community Impact is kept in the doc's own words. WEBSITE_INFO.md
   rule 8 (paid contracts are not philanthropy) is a real concern with
   it; the resolution is the client's, and PRE-LAUNCH.md asks. */
export const csr: InfoPageCopy = {
  meta: {
    title: "Corporate Social Responsibility | K.D. Constructions",
    description:
      "K.D. Constructions extends its philosophy of care beyond the worksite: workforce " +
      "health, community impact and environmental responsibility.",
  },
  ...chrome,
  hero: {
    kicker: "Corporate Social Responsibility",
    title: "Care beyond the worksite.",
    sub:
      "K.D. Constructions extends its philosophy of care beyond the worksite. Our commitment " +
      "to social responsibility is rooted in the same discipline we bring to engineering.",
  },
  sections: [
    {
      kicker: "Our Commitments",
      heading: "The same discipline, beyond the site.",
      items: [
        {
          title: "Workforce Health & Safety",
          body:
            "Medical fitness screening, HIV/AIDS awareness programmes, and guaranteed clean " +
            "water access for every worker on every site, not as compliance, but as culture.",
        },
        {
          title: "Community Impact",
          body:
            "Our infrastructure work directly serves the public, from the Matunga Z-Bridge " +
            "restoring a daily commute for lakhs of residents, to station redevelopments " +
            "serving 45,000+ commuters a day. We see every project as a community investment.",
        },
        {
          title: "Environmental Responsibility",
          body:
            "Structured waste management, noise control, and sustainable material practices " +
            "on-site, with a broader commitment to low-carbon engineering as part of our " +
            "Vision 2030 roadmap.",
        },
      ],
    },
    {
      kicker: "Content Pending",
      heading: "To be added before launch.",
      intro:
        "The four items below are named in K.D. Constructions' website brief as still to be " +
        "supplied. Each card is a placeholder: it is filled with the company's own details, " +
        "or removed, before the site goes live.",
      items: [
        {
          pending: "To be added",
          title: "Formal CSR programmes",
          body:
            "Any structured CSR activity the company runs or funds: what it is, where, since " +
            "when, and the annual spend. If K.D. Constructions falls below the Companies Act " +
            "§135 threshold, \"not applicable\" is a complete answer.",
        },
        {
          pending: "To be added",
          title: "Community partnerships",
          body:
            "Local initiatives near project sites and offices in Dhule, Navi Mumbai and Raigad, " +
            "and the NGOs, trusts, schools or civic bodies the company works with.",
        },
        {
          pending: "To be added",
          title: "Education & skilling initiatives",
          body:
            "Apprenticeships, ITI or engineering-college tie-ups, worker upskilling, " +
            "scholarships or site-school programmes, with numbers where they exist.",
        },
        {
          pending: "To be added",
          title: "CSR committee & governance",
          body:
            "Whether a CSR committee is constituted, who sits on it, and the policy it works " +
            "to. A confirmed \"no formal committee\" closes this item and the page is " +
            "trimmed to the three commitments above.",
        },
      ],
    },
  ],
  cta: {
    kicker: "Our Work",
    headline: "Every project is a community investment.",
    button: { label: "View Projects", href: "/projects" },
    retired: true,
  },
};

/* /company — added 2026-10-09 at the client's request: "a new title
   called Company that involves information about company formation and
   the directors", under About. Formation is K.D.Website_Details.md's own
   Chapter I, II and III (1973 partnership firm in Dhule; Private
   Limited, August 2004; multi-disciplinary EPC from 2017); the board is the leadership
   slide of the 2026 annual deck — the same four names, roles and
   remits as about.ts's board, in the slide's order, with the slide's
   portraits. The registration card is from the board outside the
   office. */
export const company: InfoPageCopy = {
  meta: {
    title: "Company | K.D. Constructions · Formation & Board of Directors",
    description:
      "Kailashchandra Dilipkumar Constructions Pvt. Ltd. Founded in Dhule in 1973 as a " +
      "partnership, incorporated as a Private Limited company in August 2004.",
  },
  ...chrome,
  hero: {
    kicker: "Company",
    title: "Kailashchandra Dilipkumar Constructions Pvt. Ltd.",
    sub:
      "Founded in Dhule, Maharashtra, in 1973 as a partnership firm, incorporated as a Private " +
      "Limited company in August 2004, and led today from Vashi, Navi Mumbai, by a board of " +
      "four directors.",
  },
  sections: [
    {
      kicker: "Company Formation",
      heading: "From a partnership firm to a Private Limited company.",
      items: [
        {
          title: "1973 · Partnership firm",
          body:
            "K.D. Constructions began in Dhule, Maharashtra, as a partnership firm undertaking " +
            "early Maharashtra state PWD works, the years that set its engineering discipline " +
            "and financial prudence.",
        },
        {
          title: "August 2004 · Private Limited company",
          body:
            "Incorporated as Kailashchandra Dilipkumar Constructions Pvt. Ltd. The company became " +
            "pre-qualified for Indian Railway infrastructure works and grew its portfolio with " +
            "CIDCO, NMMC and other government bodies.",
        },
        /* K.D.Website_Details.md Chapter III ("2017–present"). The year
           the Vashi head office opened is not in any K.D. document
           (KD_INFO.md §Chapter III), so this card does not tie Vashi to
           2017 — PRE-LAUNCH.md asks for it. */
        {
          title: "2017 onward · Multi-disciplinary EPC",
          body:
            "The company grew beyond core civil works into mechanical, electrical and track " +
            "engineering, with integrated resources, owned equipment and strengthened HSE practices.",
        },
        /* Copied from the board outside K.D.'s office (supplied
           2026-10-09). This company only — not Kailashchandra Prakashan
           or the joint ventures listed on the same board. */
        {
          title: "Registration details",
          facts: [
            { label: "Legal name", value: "Kailashchandra Dilipkumar Constructions Private Limited" },
            { label: "CIN", value: "U45200MH2004PTC148260" },
            { label: "GSTIN", value: "27AACCK5158J1ZA" },
            { label: "Registered office", value: "1313, Real Tech Park, Sector 30A, Vashi, Navi Mumbai 400703" },
          ],
        },
      ],
    },
    {
      kicker: "Board of Directors",
      heading: "The Stewards of the Vision",
      items: [
        {
          title: "Kailash S. Gindodia",
          role: "Founding Director",
          portrait: "kailash-s-gindodia.jpg",
          body:
            "Five decades at the helm, the architect of the firm's enduring principles of " +
            "precision, discipline, and engineering integrity.",
        },
        {
          title: "Sarita K. Gindodia",
          role: "Director",
          portrait: "sarita-k-gindodia.jpg",
          body:
            "Guides corporate strategy, financial strength, and governance: the quiet framework " +
            "behind sustainable growth.",
        },
        /* Order set by the client on 2026-10-13: Kailash, Sarita, Shiv,
           Mohanlal. The last two changed places, so items.2 and items.3
           — and their edit keys — now name the other director
           (OPEN-QUESTIONS.md #45). */
        {
          title: "Shiv K. Gindodia",
          role: "Director · Inducted 2017",
          portrait: "shiv-k-gindodia.jpg",
          body:
            "Carries the firm into its modern era, advancing technology, sustainable " +
            "development, HSE excellence, and a broader EPC horizon.",
        },
        {
          title: "Mohanlal S. Gindodia",
          role: "Director",
          portrait: "mohanlal-s-gindodia.jpg",
          body:
            "Leads stakeholder engagement and government relations, unlocking the trust that " +
            "complex infrastructure demands.",
        },
      ],
    },
  ],
  cta: {
    kicker: "Our Story",
    headline: "Five decades of engineering integrity.",
    button: { label: "About K.D. Constructions", href: "/about" },
    retired: true,
  },
};

export const clients: InfoPageCopy = {
  meta: {
    title: "Clients | K.D. Constructions",
    description:
      "Trusted partner to Indian Railways, Central Railway, Western Railway, MRVC, IRCON, CIDCO, " +
      "NMMC, JNPT, the Food Corporation of India and Balbharati.",
  },
  ...chrome,
  hero: {
    kicker: "Clients",
    title: "A trusted infrastructure partner since 1973.",
    sub:
      "From Maharashtra PWD works in Dhule to India's next generation of railway depots, our " +
      "clients return for engineering discipline, quality execution and safety.",
  },
  sections: [
    {
      kicker: "Railways",
      heading: "Railway clients.",
      items: [
        /* 15 Oct 2026: the works on these five cards were a `body` line
           joined with "·"; each is now a link to its page under
           /projects, like CIDCO's below.

           21 Oct 2026, Sir: every link on the railway cards reads as its
           page's title, exactly: work() takes the title from the project
           data and refuses one that is not a project (OPEN-QUESTIONS.md
           #49, #58). Four labels changed with it; their keys did not.

           RETIRED 21 Oct 2026, Sir: the Indian Railways card. Its slot is
           kept, so the cards after it keep their indexes and stored edit
           keys (clients.sections.0.items.1 is still Central Railway), and
           its logo file stays. Its two works are on other cards: Matunga
           Workshop on WPO's, the Matunga LHB facilities on COFMOW's. */
        {
          retired: true,
          title: "Indian Railways",
          logo: "indian-railways.png",
          links: [
            { label: "Matunga Railway Workshop", href: "/projects/matunga-workshop" },
            {
              label: "LHB Coach Maintenance Facilities, Matunga",
              href: "/projects/matunga-lhb-coach-maintenance-facilities",
            },
          ],
        },
        {
          title: "Central Railway",
          logo: "central-railway.png",
          logoAlt: "Central Railway logo",
          links: [
            work("Matunga Z-Bridge"),
            work("Sanpada Carshed"),
            work("Nhava Sheva & Uran Railway Stations"),
            work("Solapur Vande Bharat Maintenance Depot"),
          ],
        },
        {
          title: "Western Railway",
          logo: "western-railway.png",
          logoAlt: "Western Railway logo",
          links: [work("Lower Parel Railway Redevelopment")],
        },
        {
          title: "MRVC",
          logo: "mrvc.png",
          logoAlt: "MRVC logo",
          links: [
            work("Panvel–Karjat Railway Line"),
            work("Mumbai Harbour Line Station Redevelopment"),
            work("Harbour Line FOBs & Trespass-Control"),
          ],
        },
        /* COFMOW's mark arrived 15 Oct 2026; until then the well set
           its name in type. */
        {
          title: "COFMOW",
          logo: "cofmow.png",
          logoAlt: "COFMOW logo",
          links: [work("Matunga LHB Coach Maintenance Facilities")],
        },
        /* Added 2026-10-09 at the client's request. WPO is an Indian
           Railways organisation with no mark of its own, so it carries
           the Indian Railways roundel. IRCON's mark is its published
           one (scripts/build-client-logos.mjs). K.D. has not said which
           works were for IRCON — PRE-LAUNCH.md S10 asks. WPO's is the
           Matunga Workshop contract (Sir's mail of 2026-10-19,
           OPEN-QUESTIONS.md #56); since 21 Oct 2026 the only card that
           links it, the Indian Railways card being retired. */
        {
          title: "WPO",
          body: "Workshop Projects Organisation, Indian Railways",
          logo: "indian-railways.png",
          /* The mark is Indian Railways' (see above), so the alt says so. */
          logoAlt: "Indian Railways logo",
          links: [work("Matunga Workshop")],
        },
        { title: "IRCON", body: "IRCON International Limited", logo: "ircon.png", logoAlt: "IRCON logo" },
      ],
    },
    {
      kicker: "Public Sector",
      heading: "Civic, port and state clients.",
      items: [
        /* The works under CIDCO and NMMC are from K.D.'s own list of
           completed works (2026-10-13, OPEN-QUESTIONS.md #44), each
           linking to its page under /projects — the label is that
           page's title. Three works on the list waited for Sir to say
           who the client was (PRE-LAUNCH.md S12). He did on 2026-10-19
           (OPEN-QUESTIONS.md #56): the Kharghar golf course clubhouse was
           CIDCO's, the Bonkode and Rabale skywalks NMMC's. Each is
           appended to its card, so no stored link key moves. */
        {
          title: "CIDCO",
          body: "City and Industrial Development Corporation of Maharashtra Limited",
          logo: "cidco.png",
          logoAlt: "CIDCO logo",
          links: [
            { label: "Ghansoli Roads & Services", href: "/projects/ghansoli-roads-and-services" },
            { label: "Kamothe Peripheral Roads", href: "/projects/kamothe-peripheral-roads" },
            { label: "Vashi Station Approach Road", href: "/projects/vashi-station-approach-road" },
            { label: "Ulwe Mass Housing Infrastructure", href: "/projects/ulwe-mass-housing-infrastructure" },
            { label: "Ulwe Sector 8 Infrastructure", href: "/projects/ulwe-sector-8-infrastructure" },
            { label: "Kharghar 33 kV Substation", href: "/projects/kharghar-33-kv-substation" },
            work("Kharghar Golf Course"),
          ],
        },
        {
          title: "NMMC",
          body: "Navi Mumbai Municipal Corporation",
          logo: "nmmc.png",
          logoAlt: "NMMC logo",
          links: [
            { label: "NMMC School No. 54 & 55", href: "/projects/nmmc-school-no-54-and-55" },
            work("Bonkode FOB"),
            work("Rabale Skywalk"),
          ],
        },
        { title: "JNPT", body: "Jawaharlal Nehru Port Trust", logo: "jnpt.png", logoAlt: "JNPT logo" },
        { title: "Balbharati", logo: "balbharati.png", logoAlt: "Balbharati logo" },
        {
          title: "Maharashtra PWD",
          body: "Our earliest works, from 1973",
          logo: "maharashtra-pwd.png",
          logoAlt: "Maharashtra PWD logo",
        },
        /* Added 2026-10-09 at the client's request. */
        { title: "FCI", body: "Food Corporation of India", logo: "fci.png", logoAlt: "FCI logo" },
      ],
    },
  ],
  cta: {
    kicker: "Work With Us",
    headline: "Build with a partner of five decades.",
    button: { label: "Contact Us", href: "/contact" },
    retired: true,
  },
};

/* /about's sections, 21 Oct 2026, at Sir's request: the pages under
   the About menu are one page, About's own bands first and then these
   five, in this order, each opening with what was its hero
   (OPEN-QUESTIONS.md #58). `id` is the section's anchor (/about#clients)
   and its old address, /<id>, answers 301 there (src/pages/<id>.astro);
   the sitemap drops those addresses.

   EACH KEEPS ITS OWN KEY PREFIX. `page` is the first segment of every key
   the section writes, so `clients.sections.1.items.0.title` on /about is
   the key it was on /clients, and a stored edit moves with a copy of its
   row (db/migrations/2026-10-21-about-merge.sql), never a rename. Only the
   hero and the sections render on /about: each page's nav and footer are
   /about's (`about.*`), and its CTA is retired (/about keeps its own). */
export const aboutSections = [
  { id: "company", page: "company", copy: company },
  { id: "capabilities", page: "capabilities", copy: capabilities },
  { id: "resources", page: "resources", copy: resources },
  { id: "clients", page: "clients", copy: clients },
  { id: "csr", page: "csr", copy: csr },
] as const satisfies readonly { id: string; page: string; copy: InfoPageCopy }[];

/* /contact's map band (Oct 2 2026) — a live Google Maps embed between
   the cards and the CTA, rendered by src/pages/contact.astro. `embed`
   is the iframe's src and `embedTitle` its title attribute, so the key
   check reads both as attributes, not copy. The pin is the company's own
   Maps listing ("K.D. Constructions", Real Tech Park) — the same place
   the Headquarters card's short link opens, 19.0661905, 72.9988837.
   No API key: this is the classic output=embed URL. */
export interface ContactCopy extends InfoPageCopy {
  readonly map: {
    readonly kicker: string;
    readonly heading: string;
    readonly embed: string;
    readonly embedTitle: string;
    readonly directions: NavLink;
  };
}

export const contact: ContactCopy = {
  meta: {
    title: "Contact | K.D. Constructions",
    description:
      "Contact K.D. Constructions at Real Tech Park, Vashi, Navi Mumbai: 022-2781 5380, " +
      "infra@kdconstructions.net.",
  },
  ...chrome,
  hero: {
    kicker: "Contact",
    title: "Let's build what's next.",
    sub:
      "For tenders, partnerships and project enquiries, reach our headquarters in Vashi, " +
      "Navi Mumbai.",
  },
  sections: [
    {
      kicker: "Get in Touch",
      heading: "Headquarters & enquiries.",
      items: [
        {
          title: "Headquarters",
          body:
            "Office No. 1313/1314, Real Tech Park, Sector 30A, Vashi, Navi Mumbai – 400703, " +
            "Maharashtra, India",
          links: [
            { label: "Open in Google Maps", href: "https://maps.app.goo.gl/jcTnVSFjRpggUZLD7" },
          ],
        },
        {
          title: "Phone",
          links: [
            { label: "022-2781 5380 (landline)", href: "tel:02227815380" },
            { label: "+91 91369 10475", href: "tel:+919136910475" },
          ],
        },
        {
          title: "Business Enquiries",
          body: "Tenders, partnerships and project enquiries.",
          links: [
            { label: "infra@kdconstructions.net", href: "mailto:infra@kdconstructions.net" },
          ],
        },
        {
          title: "Careers",
          body: "Join the team building Maharashtra's infrastructure.",
          links: [
            { label: "hr@kdconstructions.net", href: "mailto:hr@kdconstructions.net" },
            { label: "Current openings", href: "/careers" },
          ],
        },
        {
          title: "LinkedIn",
          /* This card spans two columns (the last row of a 5-card grid), so
             it carries a body like its neighbours rather than a bare link. */
          body:
            "Project milestones, site updates and new openings from K.D. Constructions. Follow " +
            "our company page to keep up with our work across railways, bridges and urban " +
            "infrastructure.",
          links: [
            {
              label: "Follow K.D. Constructions",
              href: "https://www.linkedin.com/company/k-d-constructions/",
            },
            {
              label: "Jobs on LinkedIn",
              href: "https://www.linkedin.com/company/k-d-constructions/jobs/",
            },
          ],
        },
      ],
    },
  ],
  map: {
    kicker: "Find Us",
    heading: "Real Tech Park, Vashi.",
    embed:
      "https://maps.google.com/maps?q=K.D.+Constructions,+Real+Tech+Park,+Sector+30A,+Vashi," +
      "+Navi+Mumbai+400703&ll=19.0661905,72.9988837&z=17&output=embed",
    embedTitle: "Map showing K.D. Constructions at Real Tech Park, Vashi, Navi Mumbai",
    directions: {
      label: "Get directions",
      href: "https://www.google.com/maps/dir/?api=1&destination=19.0661905,72.9988837",
    },
  },
  cta: {
    kicker: "Our Work",
    headline: "Five decades of delivery.",
    button: { label: "View Projects", href: "/projects" },
  },
};

/* /careers — added 2026-09-29 at the company's request: a page linking
   to K.D.'s hiring posts on LinkedIn and Indeed, one card per post.
   No careers content was ever supplied (WEBSITE_INFO.md §14 row 9), so
   "Why K.D." is assembled only from facts already on the site. hr@ is
   the careers address (KD_INFO.md, WEBSITE_INFO.md).

   THE POSTINGS ARE NOT IN THIS FILE. Section 0 ships empty and
   src/pages/careers.astro fills it at request time from the database:
   one card per open role, added and removed in edit mode ("Add a job
   posting" card, "Remove" on each card — src/scripts/careers-editor.js).
   Each card is keyed `careers.jobs.<id>`, so its title and details stay
   editable as text like everything else. `openings` holds the copy those
   cards are built with: `empty` is the card shown while no role is
   open, `apply` the button labels.

   `form` (8 Oct 2026, at the company's request) is the "Apply here"
   band under the cards: an applicant sends their details and resume,
   and the site emails it to hr@ (src/pages/api/apply.ts). It works
   whether or not any posting is listed. */
const LINKEDIN_JOBS = "https://www.linkedin.com/company/k-d-constructions/jobs/";

export interface CareersCopy extends InfoPageCopy {
  readonly openings: {
    readonly empty: InfoItem;
    readonly apply: { readonly linkedin: string; readonly indeed: string };
  };
  readonly form: {
    readonly kicker: string;
    readonly heading: string;
    readonly intro: string;
    readonly fields: {
      readonly name: string;
      readonly email: string;
      readonly phone: string;
      readonly role: string;
      readonly resume: string;
      readonly hint: string;
      readonly message: string;
      readonly optional: string;
    };
    /** The role list's last option, after the open postings. */
    readonly general: string;
    readonly consent: string;
    /** Links the consent line to /privacy; rendered right after it. */
    readonly consentLink: NavLink;
    readonly submit: string;
    readonly sending: string;
    readonly success: { readonly heading: string; readonly body: string };
  };
}

export const careers: CareersCopy = {
  meta: {
    title: "Careers | K.D. Constructions",
    description:
      "Careers at K.D. Constructions: railway and public infrastructure across Maharashtra " +
      "since 1973. See current openings and apply online with your resume.",
  },
  ...chrome,
  hero: {
    kicker: "Careers",
    title: "Build what Maharashtra runs on.",
    sub:
      "Join the team delivering railway stations, foot overbridges, workshops and public " +
      "infrastructure across Maharashtra, with five decades of engineering discipline behind " +
      "every project.",
  },
  sections: [
    {
      id: "openings",
      kicker: "Open Positions",
      heading: "Current openings.",
      intro:
        "Each card below links to the live posting on LinkedIn or Indeed, where you can read " +
        "the full role. To apply, use the form below or apply on the posting itself.",
      items: [],
    },
    {
      kicker: "Where We Hire",
      heading: "Follow our openings.",
      items: [
        {
          title: "K.D. Constructions on LinkedIn",
          body: "Every role we are hiring for, on our LinkedIn company page.",
          links: [{ label: "View jobs on LinkedIn", href: LINKEDIN_JOBS }],
        },
        {
          pending: "To be added",
          title: "K.D. Constructions on Indeed",
          body:
            "The link to K.D. Constructions' company or jobs page on Indeed, so this card can " +
            "open every Indeed posting in one place.",
        },
      ],
    },
    {
      kicker: "Why K.D.",
      heading: "Work that stands for decades.",
      items: [
        {
          title: "Five decades of delivery",
          body:
            "Building since 1973, from Maharashtra PWD works in Dhule to railway workshops, " +
            "depots and stations across Mumbai.",
        },
        {
          title: "Work that serves the public",
          body:
            "Railway stations, foot overbridges and civic buildings used by lakhs of commuters " +
            "and residents every day.",
        },
        {
          title: "Owned plant & fleet",
          body:
            "In-house steel fabrication at Vindhane, an RMC plant at Karjat and 50+ self-owned " +
            "heavy equipment units.",
        },
        {
          title: "Safety on every site",
          body:
            "Certified to ISO 45001:2018, with the same HSE discipline on every project, at every " +
            "site, every day.",
        },
      ],
    },
    {
      kicker: "How to Apply",
      heading: "Two ways in.",
      items: [
        {
          title: "Apply on this page",
          body:
            "Fill in your details, choose the role and attach your resume. It goes straight to " +
            "our HR team. No account needed.",
          links: [{ label: "Go to the application form", href: "#apply" }],
        },
        {
          title: "Apply to a posting",
          body: "Open a role above and apply directly through LinkedIn or Indeed.",
          links: [{ label: "See current openings", href: "#openings" }],
        },
      ],
    },
  ],
  openings: {
    empty: {
      title: "No openings listed right now",
      body:
        "New roles are listed here as they open. You are welcome to send us your resume in the " +
        "meantime, and we will keep it on file.",
      links: [
        { label: "Send your resume", href: "#apply" },
        { label: "View jobs on LinkedIn", href: LINKEDIN_JOBS },
      ],
    },
    apply: { linkedin: "Apply on LinkedIn", indeed: "Apply on Indeed" },
  },
  form: {
    kicker: "Apply Here",
    heading: "Send us your resume.",
    intro:
      "Tell us who you are and which role you are interested in, and attach your resume. It " +
      "goes directly to our HR team, who will contact you if your profile matches a role.",
    fields: {
      name: "Full name",
      email: "Email",
      phone: "Phone",
      role: "Role you are applying for",
      resume: "Resume",
      hint: "PDF or Word, up to 5 MB",
      message: "Anything you would like to add",
      optional: "optional",
    },
    general: "General application: any suitable role",
    consent:
      "By sending this you agree that K.D. Constructions may keep your details and resume for up " +
      "to 24 months to consider you for current and future roles, as described in our",
    consentLink: { label: "Privacy Policy", href: "/privacy" },
    submit: "Send application",
    sending: "Sending…",
    success: {
      heading: "Thank you. Your application has been sent.",
      body: "Our HR team has received your details and resume, and will be in touch if there is a match.",
    },
  },
  cta: {
    kicker: "Our Work",
    headline: "See what you would be building.",
    button: { label: "View Projects", href: "/projects" },
  },
};
