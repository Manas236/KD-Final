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

/* ------------------------------------------------------------
   Studio uploads (since 3 Oct 2026)
   ------------------------------------------------------------
   A photograph uploaded in /studio/gallery is not in src/assets, so
   Astro's image pipeline never sees it. The upload route writes its
   renditions to MEDIA_DIR itself (src/lib/gallery-media.ts) and
   /media/gallery/<name> serves them. These helpers are the one place
   that knows the names, so every page asks here first. */

/** up-YYYYMMDD-<8 hex>.jpg — the `file` an uploaded photo goes by. */
export const RE_UPLOAD = /^up-\d{8}-[0-9a-f]{8}\.jpg$/;

export function isUpload(file: string): boolean {
  return RE_UPLOAD.test(file);
}

/** The tile (800×552, cropped like GalleryGrid's) and the lightbox
    rendition (up to 1600 wide) of an uploaded photo. */
export function uploadUrls(file: string): { tile: string; full: string } {
  const base = file.replace(/\.jpg$/, "");
  return { tile: `/media/gallery/${base}.tile.webp`, full: `/media/gallery/${base}.full.webp` };
}
