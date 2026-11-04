/* ============================================================
   The image service: Astro's own sharp service, keeping the credit
   ------------------------------------------------------------
   Every photograph on a page is a rendition /_image cuts from a file in
   src/assets, and sharp writes no metadata unless told to, so a credit
   embedded in the file (src/lib/photo-credit.ts) would stop at the door.

   This changes one thing. When the SOURCE carries the credit, the
   rendition sharp has already encoded gets it too, spliced into its
   container: the same pixels, the same size, the same compressed bytes
   as without this file, and the same URL. A source without the credit (a
   client logo, a rendering, a representative image) comes out exactly as
   before, so which photographs are credited is decided once, by what is
   in the file. If the splice ever fails, the rendition goes out bare.
   ============================================================ */
import sharpService from "astro/assets/services/sharp";
import type { LocalImageService } from "astro";
import { hasCredit, withCredit } from "./photo-credit";

const service: LocalImageService = {
  ...sharpService,
  async transform(input, options, config, logger) {
    const out = await sharpService.transform(input, options, config, logger);
    try {
      return hasCredit(input) ? { ...out, data: withCredit(out.data) } : out;
    } catch {
      return out;
    }
  },
};

export default service;
