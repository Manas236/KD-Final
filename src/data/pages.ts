/* ============================================================
   Copy for the lighter pages: /capabilities, /resources, /hse,
   /clients, /contact, /csr
   ------------------------------------------------------------
   All six render through src/components/InfoPage.astro — hero,
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
}

export interface InfoSection {
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
          /* The plant's own page — OPEN-QUESTIONS.md #33. The RMC plant
             has no page: no photograph and one sentence on record. */
          links: [{ label: "About the plant", href: "/resources/vindhane-plant" }],
        },
        {
          title: "RMC Plant — Karjat",
          body:
            "Ready-mix concrete supply with greater control over quality, consistency, availability " +
            "and project scheduling, reducing dependence on external suppliers.",
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

export const hse: InfoPageCopy = {
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
            "Matunga Workshop FOB · Sanpada Carshed · Nhava Sheva & Uran Railway Stations · " +
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
          links: [{ label: "hr@kdconstructions.net", href: "mailto:hr@kdconstructions.net" }],
        },
        {
          title: "LinkedIn",
          links: [
            {
              label: "Follow K.D. Constructions",
              href: "https://www.linkedin.com/company/k-d-constructions/",
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
