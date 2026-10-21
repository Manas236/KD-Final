/** Resolves a card's `cert` name (src/data/pages.ts, /hse's
    Certifications) to its watermarked image, or to nothing while there is
    none. The images are written by scripts/build-certificates.mjs from the
    scans K.D. supplies, as src/assets/certificates/<cert>.jpg; the scans
    themselves are never in the repo or on the site. Kept out of the data
    module for the same reason as portraits.ts: the gates import pages.ts
    into Node, which cannot import a .jpg.

    A missing image is not an error, unlike a portrait: a certificate that
    has not arrived simply gives its card no "View certificate" button. */
import type { ImageMetadata } from "astro";

const images = import.meta.glob<ImageMetadata>("../assets/certificates/*.jpg", {
  eager: true,
  import: "default",
});

export function certificateImage(cert: string | undefined): ImageMetadata | undefined {
  return cert ? images[`../assets/certificates/${cert}.jpg`] : undefined;
}
