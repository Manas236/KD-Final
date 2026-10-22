/** Resolves a `cert` name (/hse's Certifications cards in
    src/data/pages.ts, the footer's "Certified to" in src/data/home.ts) to
    its watermarked, scrambled image and the layout that puts it back
    together, or to nothing while there is none. Both are written by
    scripts/build-certificates.mjs from the scans K.D. supplies:
    src/assets/certificates/<cert>.jpg and layout.json; the scans
    themselves are never in the repo or on the site. Kept out of the data
    modules for the same reason as portraits.ts: the gates import them
    into Node, which cannot import a .jpg.

    A missing image is not an error, unlike a portrait: a certificate that
    has not arrived simply gives its card no "View certificate" button and
    its footer line no link. */
import type { ImageMetadata } from "astro";

interface Layout {
  readonly width: number;
  readonly height: number;
  readonly tile: number;
  readonly seed: number;
}

const images = import.meta.glob<ImageMetadata>("../assets/certificates/*.jpg", {
  eager: true,
  import: "default",
});
// Globbed, not imported, so the site still builds before the first run.
const layouts = Object.values(
  import.meta.glob<Record<string, Layout>>("../assets/certificates/layout.json", {
    eager: true,
    import: "default",
  }),
)[0] ?? {};

export interface Certificate {
  /** The scrambled image's URL. */
  readonly src: string;
  /** "width height tile seed", for CertificateViewer.astro. */
  readonly layout: string;
}

export function certificate(cert: string | undefined): Certificate | undefined {
  const image = cert ? images[`../assets/certificates/${cert}.jpg`] : undefined;
  const layout = cert ? layouts[cert] : undefined;
  if (!image || !layout) return undefined;
  return { src: image.src, layout: `${layout.width} ${layout.height} ${layout.tile} ${layout.seed}` };
}

/** Whether any certificate can be shown, so a page draws the viewer. */
export const anyCertificate = Object.keys(images).some((key) =>
  certificate(key.replace(/^.*\/|\.jpg$/g, "")),
);
