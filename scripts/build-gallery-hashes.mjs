/* ============================================================
   Writes src/data/gallery-hashes.json — a dHash for every photograph
   in src/assets/gallery, so the studio upload can warn about a
   near-copy without reading source images at run time. Re-run after
   adding files to src/assets/gallery:

     node scripts/build-gallery-hashes.mjs

   Uses src/lib/dhash.ts, the same function the upload route uses.
   ============================================================ */
import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { dhash } from "../src/lib/dhash.ts";

const DIR = new URL("../src/assets/gallery/", import.meta.url);
const OUT = new URL("../src/data/gallery-hashes.json", import.meta.url);

const files = (await readdir(DIR)).filter((f) => f.endsWith(".jpg")).sort();
const hashes = {};
for (const f of files) hashes[f] = await dhash(sharp(fileURLToPath(new URL(f, DIR))));
await writeFile(OUT, JSON.stringify(hashes, null, 0).replace(/,"/g, ',\n"') + "\n");
console.log(`hashed ${files.length} photographs -> src/data/gallery-hashes.json`);
