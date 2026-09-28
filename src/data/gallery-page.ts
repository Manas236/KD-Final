/* ============================================================
   /gallery copy — every photograph on the site, in one place
   ------------------------------------------------------------
   Added at the user's request on 2026-09-28 (OPEN-QUESTIONS.md #39).
   The /projects Gallery tab already showed the project photographs; this
   page is the standalone, linkable version, grouped in three sections —
   railway projects, beyond the railway, K.D.'s own plants — with every
   group heading linking to that project's or plant's page.

   The groups ARE the objects in src/data/gallery.ts, so a new photograph
   added there appears here, on its project page and in the /projects tab
   with no second edit. Captions are keyed per page (`gallery.sections.
   <s>.groups.<g>.photos.<i>.caption`) like every other page's slots.

   NO IMAGE IMPORTS — the check scripts load this file into Node.
   ============================================================ */
import { home } from "./home.ts";
import type { NavLink } from "./home.ts";
import { railwayGalleries, socialGalleries, plantGalleries } from "./gallery.ts";

export const galleryPage = {
  meta: {
    title: "Gallery — K.D. Constructions",
    description:
      "Photographs of K.D. Constructions' work — railway stations, sheds, foot overbridges and " +
      "track, public buildings beyond the railway, and the company's own steel fabrication " +
      "and ready-mix concrete plants.",
  },
  nav: home.nav,
  footer: home.footer,

  hero: {
    kicker: "Gallery",
    title: "Our work, on site.",
    sub:
      "Photographs from our railway projects, our work beyond the railway, and our own plants " +
      "at Vindhane and Karjat. Select any photograph to enlarge it.",
  },

  sections: [
    {
      jump: "Railway Projects",
      kicker: "Railway Projects",
      heading: "Stations, sheds, bridges and track.",
      groups: railwayGalleries,
    },
    {
      jump: "Beyond the Railway",
      kicker: "Social & Public Infrastructure",
      heading: "Beyond the railway.",
      groups: socialGalleries,
    },
    {
      jump: "Our Plants",
      kicker: "Integrated Resources",
      heading: "Where our steel and concrete come from.",
      groups: plantGalleries,
    },
  ],

  lightbox: {
    previous: "Previous",
    next: "Next",
    close: "Close",
  },

  cta: {
    kicker: "Our Work",
    headline: "See the projects behind the photographs.",
    button: { label: "View Projects", href: "/projects" } as NavLink,
  },
} as const;

export type GalleryPageCopy = typeof galleryPage;
