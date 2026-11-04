/* ============================================================
   Which image files are K.D.'s own work (4 Nov 2026)
   ------------------------------------------------------------
   Only a REAL photograph gets the K.D. Constructions credit in its file
   (scripts/credit-photos.mjs). Every image under src/assets and public
   is in exactly one class:

     REAL     K.D.'s own photographs of its works, plants and sites;
     AI       generated representative images;
     GRAPHIC  client logos, K.D.'s logo and icons, certificates, renderings;
     UNSURE   nothing is written; each one has its reason here. A yes from
              Manas or Sir moves it to REAL: delete its line, run
              `npm run photos:credit`.

   A new file in a photograph folder counts as REAL. Anything anywhere
   else, or any format but JPEG, is UNSURE until it is given a line, so
   `npm run check:photo-credit` names it rather than crediting it.
   ============================================================ */

const GRAPHIC = new Map([
  ["src/assets/project-matunga-workshop.jpg", "architect's rendering of the Matunga Workshop administrative building"],
  ["src/assets/gallery/bonkode-fob-05.jpg", "design rendering of the Bonkode skywalk"],
  ["src/assets/gallery/lush-meadows-03.jpg", "elevation rendering, from a property portal"],
]);

const UNSURE = new Map([
  ["src/assets/gallery/bonkode-fob-06.jpg", "a board: the design rendering above a photograph of the skywalk"],
  ["src/assets/gallery/lush-meadows-02.jpg", "a Canva board with the portal's rendering in it, signed Kailash Developers"],
  ["src/assets/gallery/rmc-plant-10.jpg", "the tipper dealer's handover picture, under its own 'Proud owner' banner: probably not K.D.'s photograph"],
  ["src/assets/gallery/vindhane-plant-02.jpg", "a posed portrait off the annual deck's slide: nothing says who made it, or that it is a photograph of this plant"],
]);

const GOLF = "K.D. built the clubhouse, not the course (the brief's rule): none credited until someone says which";

export function classify(file) {
  const name = file.split("/").pop();
  if (GRAPHIC.has(file)) return { cls: "GRAPHIC", why: GRAPHIC.get(file) };
  if (UNSURE.has(file)) return { cls: "UNSURE", why: UNSURE.get(file) };

  if (file.startsWith("src/assets/certificates/")) return { cls: "GRAPHIC", why: "certificate" };
  if (file.startsWith("src/assets/clients/")) return { cls: "GRAPHIC", why: "client logo" };
  if (/^public\/[^/]+$/.test(file)) return { cls: "GRAPHIC", why: "icon or share card" };
  if (/^src\/assets\/kd-logo-/.test(file)) return { cls: "GRAPHIC", why: "K.D.'s logo" };

  if (/^representative-/.test(name)) return { cls: "AI", why: "generated representative image" };

  if (/^(kharghar-golf-course-|social-kharghar-golf-course)/.test(name)) return { cls: "UNSURE", why: GOLF };
  if (file.startsWith("src/assets/directors/")) return { cls: "UNSURE", why: "a director's portrait, not a work; who took it is not on record" };

  if (
    /\.jpe?g$/i.test(name) &&
    (file.startsWith("src/assets/gallery/") ||
      file.startsWith("src/assets/share/") ||
      file.startsWith("public/video/") ||
      /^src\/assets\/(about|hero|project)-[^/]+$/.test(file))
  ) {
    return { cls: "REAL", why: "" };
  }
  return { cls: "UNSURE", why: "not in a photograph folder: give it a line in scripts/photo-classes.mjs" };
}
