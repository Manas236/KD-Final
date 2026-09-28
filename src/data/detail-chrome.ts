/* ============================================================
   The chrome every /projects/<slug> page shares
   ------------------------------------------------------------
   Identical regardless of which project is showing, so it lives here
   once rather than as a literal in a template, per this codebase's "no
   hardcoded strings in markup" rule (see the header note in home.ts).

   A module of its own, with NO imports, because two kinds of page read
   it: the railway project pages (project-detail.ts, which imports
   images and so is never loaded outside Vite) and the "Beyond the
   railway" project pages (social-projects.ts, which the Node gates in
   scripts/ import directly). project-detail.ts re-exports it, so
   nothing that imported it from there had to change.
   ============================================================ */
export const detailChrome = {
  backLabel: "All Projects",
  overviewKicker: "Overview",
  /* The gallery block under the overview — only rendered for a project
     that has photographs in src/data/gallery.ts. */
  galleryKicker: "Project Gallery",
  lightbox: {
    previous: "Previous",
    next: "Next",
    close: "Close",
  },
  ctaKicker: "More Projects",
  ctaHeadline: "Explore the rest of our portfolio.",
  ctaButton: "View All Projects",
} as const;
