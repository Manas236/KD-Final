/* ============================================================
   Launch mode: placeholders off the public site (HIDE_PENDING)
   ------------------------------------------------------------
   The launch rule (the user, 2026-10-27; PRE-LAUNCH.md): anything Sir
   has not answered by launch is removed from the site. Until then every
   piece of content K.D. has not supplied is a visible placeholder, a
   `pending` item in a copy module (OPEN-QUESTIONS.md #32). This is the
   switch that takes them off without deleting a line of data: build
   with HIDE_PENDING=1 and the renderers leave out

     · a placeholder card, tile or row: the whole item, its label and
       title with it, so no "Year completed" tile and no empty row;
     · a section whose every card is a placeholder, its kicker and
       heading with it (About's CSR "Content Pending" section);
     · the gallery block of a page whose only content there is the
       "Photograph to be added" card, its kicker with it;
     · a /projects tile that is itself a placeholder (the work is not
       confirmed as K.D.'s, so it has no picture: the Kharghar Centre of
       Excellence), and with it the project's page, which then answers
       the site's ordinary 404, and its sitemap entry;
     · on an /hse drill card, only the missing fact's badge: the card
       is real, one detail of it is not.

   Off (the default), nothing here runs and every page is byte for byte
   what it was. astro.config.mjs reads the flag at build time and bakes
   it into the bundle (`__KD_HIDE_PENDING__`).

   SAVED EDITS ARE NEVER STRANDED. A unit, a card, a section, a gallery
   block or a project, is taken off only while no saved edit
   (content_edits) names a slot inside it. A placeholder Sir typed into
   counts as answered: it stays, drawn exactly as in review, so his text
   lands on its slot through the server's own apply (server-edits.ts)
   and every key keeps its anchor. A project stays on any saved edit on
   its tile or anywhere on its page, a paragraph added there in edit
   mode, or a photograph uploaded to it, and then the whole project is
   drawn as in review, its question included: hiding the question and
   keeping the page would present an unconfirmed work as K.D.'s. What
   stays for this reason still reads "To be added", on purpose:
   scripts/pending-report.mjs lists it as kept, and the text belongs in
   the copy module before launch (PRE-LAUNCH.md, "How to close a row").

   NO KEY MOVES. Renderers skip an item and keep every other item on its
   own array index, the `retired` rule (DESIGN-SYSTEM §9), so the keys
   in launch mode are a subset of the keys in review, with the same text.

   The edits read are the page's own (editsForPage(), the cached latest
   row per key), and the promise is kept on Astro.locals so the
   middleware writes the page with the very rows it was rendered for.
   If the database cannot say, nothing counts as answered: the page goes
   out without its placeholders, which is what launch mode is for, and
   the saved rows show again once the database answers.
   ============================================================ */
import { editsForPage, type SavedEdits } from "./server-edits";
import { normalizePath } from "./editable";
import { blocksFor } from "./project-blocks";
import { livePhotos, liveState } from "./gallery-live";
import { projects } from "../data/projects";
import { slugify } from "./slug";

declare const __KD_HIDE_PENDING__: boolean;

/** Set by HIDE_PENDING=1 at build time (astro.config.mjs). */
export const HIDE_PENDING: boolean = typeof __KD_HIDE_PENDING__ === "boolean" && __KD_HIDE_PENDING__;

export interface Launch {
  /** True when launch mode takes this unit off the page: the mode is
      on and no saved edit names a slot under any of these key prefixes
      (a prefix covers the key itself and every key below it). */
  hides(...prefixes: string[]): boolean;
}

/** Review: nothing is hidden. */
export const REVIEW: Launch = { hides: () => false };

function launchOver(edits: SavedEdits | null): Launch {
  const keys = Object.keys(edits ?? {}).map((k) => k.toLowerCase());
  return {
    hides: (...prefixes) =>
      !prefixes.some((p) => {
        const q = p.toLowerCase();
        return keys.some((k) => k === q || k.startsWith(q + "."));
      }),
  };
}

/** The saved edits of the page being rendered, read once per request
    and shared with the middleware (Astro.locals.kdSavedEdits). */
function pageEdits(locals: App.Locals, path: string): Promise<SavedEdits | null> {
  return (locals.kdSavedEdits ??= editsForPage(path));
}

/** What launch mode hides on the page at `pathname`. Review (nothing)
    while HIDE_PENDING is off, and on a path that is not an editable
    page, which has no saved edits to keep anchored. */
export async function launchFor(locals: App.Locals, pathname: string): Promise<Launch> {
  if (!HIDE_PENDING) return REVIEW;
  const path = normalizePath(pathname);
  return launchOver(path ? await pageEdits(locals, path) : null);
}

/** The /projects tile index of a Beyond the railway project. */
function tileIndex(title: string): number {
  return projects.social.items.findIndex((item) => item.title === title);
}

/**
 * True when launch mode takes a Beyond the railway project off the site:
 * its /projects tile is a placeholder (`pending`, no picture: the work
 * is not confirmed as K.D.'s) and nothing of Sir's is on it. The tile,
 * the page and the sitemap all ask this, so the three agree.
 */
export async function projectHidden(locals: App.Locals, pathname: string, title: string): Promise<boolean> {
  if (!HIDE_PENDING) return false;
  const i = tileIndex(title);
  if (i < 0 || !projects.social.items[i].pending) return false;
  const slug = slugify(title);
  /* The tile's slots are /projects' edits, the page's its own. Asked from
     either page, that page's read is the one the middleware is handed. */
  const here = normalizePath(pathname);
  const read = (path: string) => (path === here ? pageEdits(locals, path) : editsForPage(path));
  const [tileEdits, ownEdits, blocks, live] = await Promise.all([
    read("/projects"),
    read(`/projects/${slug}`),
    blocksFor(slug),
    liveState(),
  ]);
  if (!launchOver(tileEdits).hides(`projects.social.items.${i}`)) return false;
  if (ownEdits && Object.keys(ownEdits).length) return false;
  return blocks.length === 0 && livePhotos(live, title).length === 0;
}
