/* ============================================================
   404 copy — the page a wrong address lands on
   ------------------------------------------------------------
   Added 2026-09-18 — see OPEN-QUESTIONS.md #35. Until then a mistyped
   URL, a stale link or a wrong /studio/ slug got Astro's bare 404: no
   nav, no footer, no way back. Nothing in the source documents covers
   an error page, so the copy is written here in the site's own voice
   — a kicker, a one-line H1, one sentence of explanation and one
   button — and is the client's to change on review.

   `nav` and `footer` are home.ts's own objects, as on every page: the
   chrome renders under this page's prefix (`not-found.nav.*`), so the
   gate compares the page against this export alone.

   NOT IN-PAGE EDITABLE, and on purpose. The editor files an edit under
   the URL in the address bar, and the address bar of a 404 shows the
   address that FAILED — /nonsense, not /404 — so an edit made on the
   404 page would be saved under a path that is not a page and painted
   nowhere. `/404` is therefore not in KNOWN_PATHS (src/lib/editable.ts);
   the server refuses the save rather than accepting it into a void.
   Change this copy here.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink } from "./home.ts";

export const notFound = {
  meta: {
    title: "Page not found — K.D. Constructions",
    description: "The address you asked for is not a page on this site.",
  },
  nav: home.nav,
  footer: home.footer,
  hero: {
    kicker: "Error 404",
    title: "That page is not here.",
    sub:
      "The address may have been mistyped, or the link you followed is out of date. " +
      "Every page on the site is reachable from the navigation above.",
  },
  button: { label: "Back to the homepage", href: "/" } as NavLink,
} as const;

export type NotFoundCopy = typeof notFound;
