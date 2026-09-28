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

   Withheld on purpose, per WEBSITE_INFO.md §0 and docs/SEO.md:
   - ISO certificates as `hasCredential` — blocked until certificate
     numbers arrive (PRE-LAUNCH.md row 2). A credential with no
     identifier is weak; an unverifiable one is worse.
   - `geo` coordinates — the Maps share link in KD_INFO.md is not a
     lat/long. Add when someone reads them off the pin.
   - `founder` — the surname spelling is a PRE-LAUNCH.md sign-off (S1,
     Gindodia vs Gindodi). Structured data feeds the knowledge graph;
     a wrong spelling there outlives the page. Add after sign-off.
   - Anything RDSO.
   ============================================================ */
import { home } from "./home";

const hrefOf = (label: string) =>
  home.footer.contact.links.find((l) => l.label === label)?.href ?? "";

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
  /** E.164 form of the footer's `tel:02227815380`. */
  telephone: "+91-22-2781-5380",
  email: hrefOf("infra@kdconstructions.net").replace(/^mailto:/, ""),
  sameAs: [hrefOf("LinkedIn")].filter(Boolean),
  memberOf: "Chamber of Railway Industries",
  /** Where the company works, for `areaServed`. */
  areaServed: ["Maharashtra", "India"],
} as const;
