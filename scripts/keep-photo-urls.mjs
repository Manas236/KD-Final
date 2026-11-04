/* ============================================================
   Keep a photograph's URL when the credit went into its file
   ------------------------------------------------------------
   Astro names an emitted file <name>.<hash of its bytes>.<ext>, and every
   <img> on the site carries that name in /_image?href=... The credit added
   on 4 Nov 2026 changed the bytes of the photographs but not one pixel, and
   new names for them all would have changed the HTML of every page for no
   gain. So a photograph whose bytes are exactly the credited file's keeps
   the hash it had (scripts/photo-asset-names.json, written by
   scripts/credit-photos.mjs --names); the pattern is otherwise Astro's own,
   so byte-identical photographs still share one file as they did. Any other
   file, and any later change to a photograph, is named by Astro as usual.
   ============================================================ */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const hashes = JSON.parse(readFileSync(new URL("./photo-asset-names.json", import.meta.url), "utf8"));

export function keepPhotoUrls() {
  return {
    name: "kd-keep-photo-urls",
    outputOptions(options) {
      const own = options.assetFileNames;
      return {
        ...options,
        assetFileNames(asset) {
          const source = asset.source;
          if (source && typeof source !== "string" && /\.jpe?g$/i.test(asset.names?.[0] ?? "")) {
            const hash = hashes[createHash("sha256").update(source).digest("hex")];
            if (hash) return `_astro/[name].${hash}[extname]`;
          }
          return typeof own === "function" ? own(asset) : own;
        },
      };
    },
  };
}
