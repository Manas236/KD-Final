/* ============================================================
   Gallery alt text: one wording for every photograph's alt
   ------------------------------------------------------------
   A gallery photograph's alt text is COMPOSED here from its group and
   its caption, and nowhere else: GalleryGrid.astro (the tiles, and so
   the lightbox, which copies the tile's alt), the studio gallery
   manager (src/scripts/gallery-manager.js) and /sitemap.xml all call
   galleryAlt(). The caption is whatever it is today: Sir's caption from
   the studio, an upload's caption, or the gallery.ts baseline. This
   module never changes a caption, it only says how the alt reads around
   it, so a caption saved in the studio is never overwritten.

     project photos   "<Project> by K.D. Constructions. <caption>"
     plant photos     "K.D. Constructions' <Plant>. <caption>"
     HSE photos       "K.D. Constructions HSE. <caption>"

   Joined with ". " like every composed string on the site (CLAUDE.md),
   so a caption with a colon never produces two.

   A representative image (projects.ts, `representative`) is never in a
   gallery group, so it never reaches this module: its alt is written by
   hand in projects.ts, says "representative image", and does not claim
   the work as K.D.'s.

   PURE, no imports: the studio manager bundles it into the browser, and
   the Node gates may load it too. Which kind a group is comes from its
   section (the manager knows that) or from altKindOf() in
   src/data/gallery.ts (the pages know the group's name).
   ============================================================ */

export type AltKind = "project" | "plant" | "hse";

export function galleryAlt(project: string, caption: string, kind: AltKind): string {
  const text = caption.trim();
  switch (kind) {
    case "plant":
      return `K.D. Constructions' ${project}. ${text}`;
    case "hse":
      return `K.D. Constructions HSE. ${text}`;
    default:
      return `${project} by K.D. Constructions. ${text}`;
  }
}

/** The studio manager's sections ("railway", "social", "plant", "hse")
    as alt kinds. */
export function altKindOfSection(section: string): AltKind {
  return section === "plant" ? "plant" : section === "hse" ? "hse" : "project";
}
