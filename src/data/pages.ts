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

   Sources: K.D.Website_Details.md (authoritative) and KD_INFO.md for
   the contact details and fleet categories. Fleet categories are
   REPRESENTATIVE — never render a count that sums them (KD_INFO §5.1).

   `nav` and `footer` are home.ts's own objects, as on every page.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink } from "./home.ts";

export interface InfoItem {
  readonly title: string;
  readonly body?: string;
  readonly links?: readonly NavLink[];
  /** A file in src/assets/clients/, written by
      scripts/build-client-logos.mjs. An attribute's source, never text —
      check-edit-keys.mjs skips `.logo` the way it skips `.file`. A
      section in which any item has one gives every card a logo well. */
  readonly logo?: string;
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
  readonly hero: { readonly kicker: string; readonly title: string; readonly sub: string };
  readonly sections: readonly InfoSection[];
  readonly cta: { readonly kicker: string; readonly headline: string; readonly button: NavLink };
  readonly footer: typeof home.footer;
}

const chrome = { nav: home.nav, footer: home.footer };

export const capabilities: InfoPageCopy = {
  meta: {
    title: "Capabilities — K.D. Constructions",
    description:
      "Civil, structural steel fabrication & erection, track, electrical, mechanical and " +
      "signalling & telecommunication engineering, backed by in-house steel fabrication, RMC " +
      "and a 50+ unit equipment fleet.",
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
            "and rail corridors — the foundation of our integrated EPC delivery.",
        },
        {
          title: "Steel Fabrication & Erection",
          body:
            "Girders, trusses, FOBs, cover-over-platforms, steel roofing and large-span sheds — " +
            "fabricated at our Vindhane plant or on site, then launched and erected, including " +
            "over running railway lines with overhead OHE.",
        },
        {
          title: "Track Engineering",
          body:
            "Permanent-way construction and associated railway track systems, integrated with " +
            "civil works and broader railway operations.",
        },
        {
          title: "Electrical Engineering",
          body:
            "Railway and building electrical works, integrating power and electrical systems with " +
            "civil and mechanical execution, including within operational railway environments.",
        },
        {
          title: "Mechanical Engineering",
          body:
            "Railway sheds, inspection and heavy repair facilities, workshops and mechanical " +
            "installations — plus OEM-sourced railway machinery with maintenance support through " +
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
        "infrastructure solutions — with greater control, accountability and reliability at " +
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
  },
};

export const resources: InfoPageCopy = {
  meta: {
    title: "Resources — K.D. Constructions",
    description:
      "An in-house steel fabrication plant at Vindhane, an RMC plant at Karjat and 50+ " +
      "self-owned heavy equipment units.",
  },
  ...chrome,
  hero: {
    kicker: "Resources",
    title: "Owned plant. Owned fleet.",
    sub:
      "An integrated resource base — 50+ heavy equipment units, an in-house steel fabrication " +
      "plant and an RMC plant — gives us control over supply, quality and delivery.",
  },
  sections: [
    {
      kicker: "Facilities",
      heading: "Two plants under our own control.",
      items: [
        {
          title: "Steel Fabrication Plant — Vindhane, Raigad",
          body:
            "Welding, bending and cutting lines producing girders, trusses, roofing systems and " +
            "sheds for railway structures, bridges and FOBs — with greater control over quality, " +
            "cost and delivery schedules.",
          /* The plant's own page — OPEN-QUESTIONS.md #33. */
          links: [{ label: "About the plant", href: "/resources/vindhane-plant" }],
        },
        {
          title: "RMC Plant — Karjat",
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
}

export interface HseCard {
  readonly title: string;
  readonly where: string;
  readonly body?: string;
  readonly points?: readonly string[];
  /** Spans the whole row, under the paired cards — for the one card
      whose copy is much longer than its neighbours'. */
  readonly wide?: boolean;
}

export interface HseBand {
  readonly tone: "white" | "mist" | "ink";
  readonly kicker: string;
  readonly heading: string;
  readonly intro?: string;
  readonly media?: readonly HseMedia[];
  readonly stats?: readonly { readonly value: string; readonly label: string }[];
  readonly statsNote?: string;
  readonly cards?: readonly HseCard[];
}

export interface HseCopy extends InfoPageCopy {
  readonly record: { readonly bands: readonly HseBand[] };
}

export const hse: HseCopy = {
  meta: {
    title: "Health, Safety & Environment — K.D. Constructions",
    description:
      "HSE is part of every priority at K.D. Constructions — certified to ISO 45001:2018 and " +
      "ISO 14001:2015.",
  },
  ...chrome,
  hero: {
    kicker: "Health, Safety & Environment",
    title: "It is better to be safe than sorry.",
    sub:
      "HSE is not a separate priority; it is part of every priority. We maintain the same " +
      "discipline, care and accountability on every project, at every site, every day.",
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
      items: [
        { title: "ISO 45001:2018", body: "Occupational health & safety management." },
        { title: "ISO 14001:2015", body: "Environmental management." },
        { title: "ISO 9001:2015", body: "Quality management." },
        /* K.D.Website_Details.md's Leadership section ends on an open
           ask to the company: "Please give more details on
           Certifications: ISO certifications or any other certifications
           that your company has achieved". Nothing came back, so the ask
           is on the page where the client will see it. PRE-LAUNCH.md #2. */
        {
          pending: "To be added",
          title: "Other certifications & certificate details",
          body:
            "Certificate numbers, validity dates and the certifying bodies for the three ISO " +
            "standards, plus any further accreditation K.D. Constructions holds — RDSO " +
            "approvals, the Rail Chamber membership certificate, or others.",
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
          "Mock drills run on live sites, with the real equipment and the crews who would use it — " +
          "so the first minutes of a real emergency are ones everyone has already rehearsed.",
        media: [
          {
            video: "hse-work-at-height-rescue-drill",
            alt: "A work-at-height rescue drill: responders attend a casualty, carry him on a stretcher and load him into an ambulance",
            title: "Work-at-height medical emergency drill",
            where: "GTB Nagar Station",
          },
          {
            video: "hse-fire-extinguisher-drill",
            alt: "Workers take turns putting out a test fire with a DCP extinguisher while the crew watches",
            title: "Fire-extinguisher drill",
            where: "GTB Nagar Station",
          },
        ],
        cards: [
          {
            title: "Electrical-shock rescue drill",
            where: "Mankhurd Station",
            body: "An emergency mock drill for an electrical-shock casualty, run on the live site.",
          },
          {
            title: "Fire extinguishers kept in service",
            where: "Every site",
            body:
              "Extinguishers are tracked and sent for refilling when due — seven 6 kg DCP units " +
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
        ],
      },
      {
        tone: "mist",
        kicker: "Training",
        heading: "Taught on site, to the people doing the work.",
        media: [
          {
            file: "hse-lifting-training-govandi.jpg",
            alt: "An HSE officer briefs workers and supervisors around the table in the Govandi site office",
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
        media: [
          {
            file: "hse-medical-camp-mankhurd.jpg",
            alt: "Workers queue outside the Mankhurd site office beside the free medical camp banner and K.D. safety posters",
            title: "Free medical camp — 88 workers and staff",
            where: "Mankhurd Station · 12 September 2026",
          },
        ],
        cards: [
          {
            title: "Medical camp, Mankhurd",
            where: "88 workers and staff covered",
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
          "September 2026 — overall result satisfactory.",
        media: [
          {
            file: "hse-air-monitoring-mankhurd.jpg",
            alt: "Two HSE staff in hard hats set up an ambient air sampler on the Mankhurd site",
            title: "Ambient air monitoring started",
            where: "Mankhurd Station",
          },
          {
            file: "hse-world-environment-day.jpg",
            alt: "Workers in yellow helmets gather beneath an FOB deck for a World Environment Day talk",
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
        media: [
          {
            file: "hse-national-safety-week-karjat.jpg",
            alt: "Rows of workers in K.D. helmets and hi-vis harnesses seated on site for National Safety Week at Karjat",
            title: "3,00,000 safe man-hours without a lost-time injury",
            where: "National Safety Week · Karjat",
          },
          {
            file: "hse-national-safety-day-mankhurd.jpg",
            alt: "Workers and site staff gathered beneath the steel frame of the new FOB at Mankhurd for National Safety Day",
            title: "National Safety Day",
            where: "Mankhurd Station",
          },
          {
            file: "hse-worker-recognition.jpg",
            alt: "A site worker in a hi-vis harness receives a prize and a handshake",
            title: "Prize distribution",
            where: "On site",
          },
        ],
        cards: [
          {
            title: "National Safety Day awards, Mankhurd",
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
    title: "Corporate Social Responsibility — K.D. Constructions",
    description:
      "K.D. Constructions extends its philosophy of care beyond the worksite — workforce " +
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
            "water access for every worker on every site — not as compliance, but as culture.",
        },
        {
          title: "Community Impact",
          body:
            "Our infrastructure work directly serves the public — from the Matunga Z-Bridge " +
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
            "Any structured CSR activity the company runs or funds — what it is, where, since " +
            "when, and the annual spend. If K.D. Constructions falls below the Companies Act " +
            "§135 threshold, \"not applicable\" is a complete answer.",
        },
        {
          pending: "To be added",
          title: "Community partnerships",
          body:
            "Local initiatives near project sites and offices — Dhule, Navi Mumbai, Raigad — " +
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
  },
};

export const clients: InfoPageCopy = {
  meta: {
    title: "Clients — K.D. Constructions",
    description:
      "Trusted partner to Indian Railways, Central Railway, Western Railway, MRVC, CIDCO, NMMC, " +
      "JNPT and Balbharati.",
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
        {
          title: "Indian Railways",
          body: "Matunga Railway Workshop · LHB Coach Maintenance Facilities, Matunga",
          logo: "indian-railways.png",
        },
        {
          title: "Central Railway",
          body:
            "Matunga Z-Bridge · Sanpada Carshed · Nhava Sheva & Uran Railway Stations · " +
            "Solapur Vande Bharat Maintenance Depot",
          logo: "central-railway.png",
        },
        {
          title: "Western Railway",
          body: "Lower Parel Railway Redevelopment",
          logo: "western-railway.png",
        },
        {
          title: "MRVC",
          body:
            "Panvel–Karjat Suburban Rail Corridor · Mumbai Harbour Line Station Redevelopment · " +
            "Harbour Line FOBs",
          logo: "mrvc.png",
        },
        /* No COFMOW mark was supplied — InfoPage sets the name in the
           well instead. Add `logo` here when one arrives. */
        { title: "COFMOW", body: "LHB Coach Maintenance Facilities at Matunga" },
      ],
    },
    {
      kicker: "Public Sector",
      heading: "Civic, port and state clients.",
      items: [
        {
          title: "CIDCO",
          body: "City and Industrial Development Corporation of Maharashtra Limited",
          logo: "cidco.png",
        },
        { title: "NMMC", body: "Navi Mumbai Municipal Corporation", logo: "nmmc.png" },
        { title: "JNPT", body: "Jawaharlal Nehru Port Trust", logo: "jnpt.png" },
        { title: "Balbharati", logo: "balbharati.png" },
        {
          title: "Maharashtra PWD",
          body: "Our earliest works, from 1973",
          logo: "maharashtra-pwd.png",
        },
      ],
    },
  ],
  cta: {
    kicker: "Work With Us",
    headline: "Build with a partner of five decades.",
    button: { label: "Contact Us", href: "/contact" },
  },
};

export const contact: InfoPageCopy = {
  meta: {
    title: "Contact — K.D. Constructions",
    description:
      "Contact K.D. Constructions at Real Tech Park, Vashi, Navi Mumbai — 022-2781 5380, " +
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
            { label: "+91 98676 06692", href: "tel:+919867606692" },
            { label: "+91 98922 43804", href: "tel:+919892243804" },
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
   open, `apply` the button labels. */
const LINKEDIN_JOBS = "https://www.linkedin.com/company/k-d-constructions/jobs/";

export interface CareersCopy extends InfoPageCopy {
  readonly openings: {
    readonly empty: InfoItem;
    readonly apply: { readonly linkedin: string; readonly indeed: string };
  };
}

export const careers: CareersCopy = {
  meta: {
    title: "Careers — K.D. Constructions",
    description:
      "Careers at K.D. Constructions — railway and public infrastructure across Maharashtra " +
      "since 1973. See current openings on LinkedIn and Indeed, or email hr@kdconstructions.net.",
  },
  ...chrome,
  hero: {
    kicker: "Careers",
    title: "Build what Maharashtra runs on.",
    sub:
      "Join the team delivering railway stations, foot overbridges, workshops and public " +
      "infrastructure across Maharashtra — with five decades of engineering discipline behind " +
      "every project.",
  },
  sections: [
    {
      id: "openings",
      kicker: "Open Positions",
      heading: "Current openings.",
      intro:
        "We post our openings on LinkedIn and Indeed. Each card below links straight to the " +
        "live posting, where you can read the full role and apply.",
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
            "Building since 1973 — from Maharashtra PWD works in Dhule to railway workshops, " +
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
          title: "Apply to a posting",
          body: "Open a role above and apply directly through LinkedIn or Indeed.",
          links: [{ label: "See current openings", href: "#openings" }],
        },
        {
          title: "Email your CV",
          body:
            "Send your CV to our HR team, with the role you are applying for in the subject " +
            "line.",
          links: [{ label: "hr@kdconstructions.net", href: "mailto:hr@kdconstructions.net" }],
        },
      ],
    },
  ],
  openings: {
    empty: {
      title: "No openings listed right now",
      body:
        "New roles are posted on LinkedIn and Indeed as they open. You are welcome to send your " +
        "CV to our HR team in the meantime.",
      links: [
        { label: "View jobs on LinkedIn", href: LINKEDIN_JOBS },
        { label: "Email hr@kdconstructions.net", href: "mailto:hr@kdconstructions.net" },
      ],
    },
    apply: { linkedin: "Apply on LinkedIn", indeed: "Apply on Indeed" },
  },
  cta: {
    kicker: "Our Work",
    headline: "See what you would be building.",
    button: { label: "View Projects", href: "/projects" },
  },
};
