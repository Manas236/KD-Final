/* ============================================================
   Share images: the picture a link preview shows
   ------------------------------------------------------------
   og:image on every page that has a photograph (BaseLayout.astro). Link
   previews (WhatsApp, LinkedIn, Facebook, X) crop to 1.91:1 and not all
   of them show WebP, so the share image is its own rendition: 1200 × 630,
   cover-cropped, JPEG. Until 22 Oct 2026 it was the hero's 1551 × 700
   WebP, which the previews cut down again, and whose declared size was
   wrong wherever the photograph is narrower than 1551.

   EVERY SHARE PICTURE IS 1200 × 630 (28 Oct 2026), the size the
   previews ask for. Astro's image service never enlarges, so a
   photograph smaller than that (the Matunga LHB shed, 1024 × 768) is
   cut from an enlarged copy of itself in src/assets/share/, made by
   scripts/build-share-images.mjs under the same file name. The copy is
   for the share picture only; the page shows the original. Until
   28 Oct such a photograph gave its largest 1.91:1 crop, 1024 × 538.
   A photograph too small with no copy returns null, and BaseLayout
   uses the designed card: never an undersized picture.
   `npm run check:served-html` fails a page whose og:image is under
   1200 × 630.

   FOCUS is per PHOTOGRAPH, not per page, so a photograph keeps its crop
   on whichever page shares it. Keyed by the file's name in src/assets
   without its extension. Centre unless listed; each entry was checked
   against the photograph (OPEN-QUESTIONS.md #62).
   ============================================================ */
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

export const SHARE = { width: 1200, height: 630 } as const;

const FOCUS: Readonly<Record<string, string>> = {
  /* The workforce sits along the bottom half; a centre cut takes off the front row's feet. */
  "about-mankhurd-workforce": "bottom",
  /* The batching tower's top is the plant; the foreground is bare earth. */
  "rmc-plant-01": "top",
  /* The health centre's roof line is at the top edge. */
  "social-karanjade-health-care": "top",
};

/* "/_astro/rmc-plant-01.BxZUTfiQ.jpg" (a build) or
   "/@fs/.../rmc-plant-01.jpg?origWidth=..." (dev) -> "rmc-plant-01". */
function nameOf(src: string): string {
  const base = src.split("?")[0].split("/").pop() ?? "";
  return base.replace(/\.[a-z0-9]+$/i, "").replace(/\.[A-Za-z0-9_-]{8}$/, "");
}

/* The enlarged copies, by the name of the photograph they stand in for. */
const enlarged = new Map(
  Object.entries(
    import.meta.glob<ImageMetadata>("../assets/share/*.jpg", { eager: true, import: "default" }),
  ).map(([file, image]) => [nameOf(file), image]),
);

const holdsShare = (image: ImageMetadata) => image.width >= SHARE.width && image.height >= SHARE.height;

export interface ShareRendition {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export async function shareRendition(image: ImageMetadata): Promise<ShareRendition | null> {
  const name = nameOf(image.src);
  const source = holdsShare(image) ? image : enlarged.get(name);
  if (!source || !holdsShare(source)) return null;
  const position = FOCUS[name];
  const { src } = await getImage({
    src: source,
    width: SHARE.width,
    height: SHARE.height,
    fit: "cover",
    ...(position && { position }),
    format: "jpg",
  });
  return { src, width: SHARE.width, height: SHARE.height };
}
