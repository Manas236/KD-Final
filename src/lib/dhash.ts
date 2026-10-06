/* ============================================================
   Difference hash (dHash) — "does this photo look like one we have?"
   ------------------------------------------------------------
   Used by the studio upload (src/pages/api/gallery/upload.ts) to warn
   before a near-copy of an existing photograph goes on the site, the
   problem the October 2026 sort passes spent a day cleaning up.

   The photo is shrunk to 9×8 greys and each pixel compared with its
   right-hand neighbour: 64 bits, as 16 hex characters. Two photos
   whose hashes differ in only a few bits are the same picture, give or
   take compression, size and small crops. It is deliberately coarse:
   it catches re-exports and burst duplicates, not "same building from
   another angle", which stays a human call in the manager.

   scripts/build-gallery-hashes.mjs runs this over src/assets/gallery
   and writes src/data/gallery-hashes.json, so the server never has to
   read the source images at run time. Both sides MUST use this one
   function or the hashes are not comparable.
   ============================================================ */
import type { Sharp } from "sharp";

/** Bits that may differ for two photos to count as the same one. */
export const NEAR_DUPLICATE_BITS = 6;

export async function dhash(image: Sharp): Promise<string> {
  const px = await image
    .clone()
    .rotate()
    .greyscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer();
  let bits = "";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) bits += px[r * 9 + c] > px[r * 9 + c + 1] ? "1" : "0";
  }
  let hex = "";
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}

/** How many of the 64 bits differ. */
export function distance(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < 16; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
}
