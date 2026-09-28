/** Resolves a `logo` name from src/data/pages.ts to its image, and sizes
    it. Kept out of the data module for the same reason as
    gallery-images.ts: check-edit-keys.mjs imports pages.ts straight into
    Node, which cannot import a .png. Throws on a missing file rather
    than rendering an empty well. */
import type { ImageMetadata } from "astro";

const images = import.meta.glob<ImageMetadata>("../assets/clients/*.png", {
  eager: true,
  import: "default",
});

export function clientLogo(file: string): ImageMetadata {
  const image = images[`../assets/clients/${file}`];
  if (!image) throw new Error(`Client logo not found: src/assets/clients/${file}`);
  return image;
}

/* Sized for one visual weight, not one height. Two corrections:

     · AREA, not height. At one height a wide lockup (Central Railway's
       roundel over its name) reads as a thumbnail beside a tall one
       (CIDCO).
     · COVERAGE. At one area a solid roundel (Indian Railways, PWD,
       ~80% of its box inked) still reads twice the size of an open
       lockup (CIDCO, ~22%). The box area is scaled by the square root
       of reference ÷ coverage — the full ratio would blow the open
       marks up past the well, the root splits the difference.

   Coverage comes from coverage.json, written by the same script that
   cuts the files, so re-running it keeps the two in step. The caps are
   InfoPage's well less its padding — 176px tall, 24px above and below —
   and keep CIDCO and JNPT, the two tall ones, inside it. The files are
   trimmed to the mark, so centring the box centres the mark. */
import coverage from "../assets/clients/coverage.json";

const AREA = 116 * 116;
const REFERENCE_COVERAGE = 0.5;
const MAX_HEIGHT = 128;
const MAX_WIDTH = 200;

export function logoSize(file: string): { width: number; height: number } {
  const image = clientLogo(file);
  const inked = (coverage as Record<string, number>)[file] ?? REFERENCE_COVERAGE;
  const aspect = image.width / image.height;
  const area = AREA * Math.sqrt(REFERENCE_COVERAGE / inked);
  const height = Math.sqrt(area / aspect);
  const width = height * aspect;
  const fit = Math.min(1, MAX_HEIGHT / height, MAX_WIDTH / width);
  return { width: Math.round(width * fit), height: Math.round(height * fit) };
}
