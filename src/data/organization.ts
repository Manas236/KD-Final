/* ============================================================
   Organization facts for structured data (JSON-LD)
   ------------------------------------------------------------
   What a search engine is told about the company in machine-readable
   form — the `Organization` block BaseLayout emits on every page, per
   docs/SEO.md "Schema recommendations". This is the entity a search
   for the company name resolves to, and the entity every project page
   is attached to.

   NOT ON-PAGE COPY. Nothing here renders as text, so nothing here is
   an edit slot and this module is deliberately absent from the PAGES
   map in scripts/check-edit-keys.mjs. Where a fact IS also on the
   page — the legal name, the switchboard number, the LinkedIn URL —
   it is read from home.footer so the two cannot drift. The address is
   the one exception: the footer holds three display lines, and schema
   wants fields, so the same address is split here by hand. Change one,
   change the other.

   The ISO certificates went in as `hasCredential` on 22 Oct 2026, once
   their numbers were on /hse (OPEN-QUESTIONS.md #60, #62): read from the
   Certifications cards in src/data/pages.ts, number, certifying body and
   validity, so this block and the page cannot disagree. One that loses
   its number drops out rather than being published without one.

   Withheld on purpose, per WEBSITE_INFO.md §0 and docs/SEO.md:
   - `geo` coordinates — the Maps share link in KD_INFO.md is not a
     lat/long. Add when someone reads them off the pin. (The office's
     own block on /contact has carried the pin since 2026-10-12, read
     from that page's map embed — src/pages/contact.astro.)
   - `founder` — the surname spelling is a PRE-LAUNCH.md sign-off (S1,
     Gindodia vs Gindodi). Structured data feeds the knowledge graph;
     a wrong spelling there outlives the page. Add after sign-off.
   - Anything RDSO.
   ============================================================ */
import { home } from "./home";
import { contact, hse, type InfoItem } from "./pages";

const hrefOf = (label: string) =>
  home.footer.contact.links.find((l) => l.label === label)?.href ?? "";

/** "tel:02227815380" -> "+912227815380": a number in the international
    form schema wants, written the same way here and in /contact's
    GeneralContractor block (src/pages/contact.astro). */
export function e164(href: string): string {
  return href.replace(/^tel:/, "").replace(/^0/, "+91");
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/* "19 May 2029" -> "2029-05-19", the way the cards write a date; anything
   else -> undefined, and the block leaves the date out. */
function isoDate(text: string | undefined): string | undefined {
  const m = (text ?? "").trim().match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
  const month = m ? MONTHS.indexOf(m[2].toLowerCase()) + 1 : 0;
  return m && month ? `${m[3]}-${String(month).padStart(2, "0")}-${m[1].padStart(2, "0")}` : undefined;
}

const fact = (item: InfoItem, label: string) => item.facts?.find((f) => f.label === label)?.value;

/* The ISO certificates as /hse's Certifications cards state them. */
const credentials = hse.sections
  .flatMap((section) => section.items)
  .filter((item) => !item.retired && !item.pending && /^ISO \d/.test(item.title) && fact(item, "Certificate number"))
  .map((item) => ({
    name: item.title,
    description: item.body,
    number: fact(item, "Certificate number")!,
    issuer: fact(item, "Certifying body"),
    validUntil: isoDate(fact(item, "Valid until")),
  }));

/* /contact's "Business Enquiries" card: its title and its address; the
   number is the switchboard, the footer's and /contact's first. */
const enquiries = contact.sections.flatMap((section) => section.items).find((item) => item.title === "Business Enquiries");
const enquiriesEmail = enquiries?.links?.find((l) => l.href.startsWith("mailto:"))?.href.slice("mailto:".length);

export const organization = {
  /** The trading name — what the site, the nav and search results say. */
  name: "K.D. Constructions",
  legalName: home.footer.legalName,
  foundingDate: "1973",
  foundingLocation: "Dhule, Maharashtra, India",
  slogan: "Building Excellence, Brick by Brick.",
  /** Mirrors home.footer.columns.headquarters.lines, split into fields. */
  address: {
    streetAddress: "Office No. 1313/1314, Real Tech Park, Sector 30A",
    addressLocality: "Vashi, Navi Mumbai",
    addressRegion: "Maharashtra",
    postalCode: "400703",
    addressCountry: "IN",
  },
  /** E.164 form of the footer's `tel:02227815380`, as on /contact. */
  telephone: e164(hrefOf("022-2781 5380")),
  email: hrefOf("infra@kdconstructions.net").replace(/^mailto:/, ""),
  sameAs: [hrefOf("LinkedIn")].filter(Boolean),
  memberOf: "Chamber of Railway Industries",
  /** Where the company works, for `areaServed`. */
  areaServed: ["Maharashtra", "India"],
  /** The `contactPoint`: /contact's Business Enquiries card. */
  contactPoint: {
    contactType: enquiries?.title ?? "Business Enquiries",
    telephone: e164(hrefOf("022-2781 5380")),
    ...(enquiriesEmail && { email: enquiriesEmail }),
    areaServed: "IN",
  },
  /** `hasCredential`: the ISO certificates, from /hse. */
  credentials,
} as const;
