/* ============================================================
   Share images: the picture a link preview shows
   ------------------------------------------------------------
   og:image on every page that has a photograph (BaseLayout.astro). Link
   previews (WhatsApp, LinkedIn, Facebook, X) crop to 1.91:1 and not all
   of them show WebP, so the share image is its own rendition: 1200 × 630,
   cover-cropped, JPEG. Until 22 Oct 2026 it was the hero's 1551 × 700
   WebP, which the previews cut down again, and whose declared size was
   wrong wherever the photograph is narrower than 1551.

   A photograph smaller than 1200 × 630 is never enlarged: it gets the
   largest 1.91:1 crop it holds (the Matunga LHB shed, 1024 × 538), and
   the size written into og:image:width/height is the size served.

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

export interface ShareRendition {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export async function shareRendition(image: ImageMetadata): Promise<ShareRendition> {
  const ratio = SHARE.width / SHARE.height;
  const width = Math.min(SHARE.width, image.width, Math.floor(image.height * ratio));
  const height = Math.round(width / ratio);
  const position = FOCUS[nameOf(image.src)];
  const { src } = await getImage({
    src: image,
    width,
    height,
    fit: "cover",
    ...(position && { position }),
    format: "jpg",
  });
  return { src, width, height };
}
