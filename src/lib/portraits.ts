/** Resolves a `portrait` name from src/data/pages.ts (/company's
    directors) to its image. Kept out of the data module for the same
    reason as client-logos.ts: check-edit-keys.mjs imports pages.ts
    straight into Node, which cannot import a .jpg. Throws on a missing
    file rather than rendering an empty frame.

    The files in src/assets/directors/ are the four portraits from the
    leadership slide of K.D.'s "KD 2026 Annual PPT" (slide 4), squared
    and capped at 800px. */
import type { ImageMetadata } from "astro";

const images = import.meta.glob<ImageMetadata>("../assets/directors/*.jpg", {
  eager: true,
  import: "default",
});

export function portrait(file: string): ImageMetadata {
  const image = images[`../assets/directors/${file}`];
  if (!image) throw new Error(`Portrait not found: src/assets/directors/${file}`);
  return image;
}
