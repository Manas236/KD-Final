/** Resolves a `file` name from src/data/gallery.ts to its image. Kept
    out of the data module so that module stays importable from plain
    Node (see the note at the top of gallery.ts). Throws on a missing
    file rather than rendering an empty tile: a typo in gallery.ts
    should fail the build, not ship a hole. */
import type { ImageMetadata } from "astro";

const images = import.meta.glob<ImageMetadata>("../assets/gallery/*.jpg", {
  eager: true,
  import: "default",
});

export function galleryImage(file: string): ImageMetadata {
  const image = images[`../assets/gallery/${file}`];
  if (!image) throw new Error(`Gallery image not found: src/assets/gallery/${file}`);
  return image;
}
