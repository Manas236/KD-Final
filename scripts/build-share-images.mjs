/* ============================================================
   Share images: photographs enlarged for link previews
   ------------------------------------------------------------
   A link preview asks for a picture of at least 1200 × 630 (WhatsApp,
   LinkedIn, Facebook and X all quote that size; under it some of them
   fall back to a small thumbnail). src/lib/share-image.ts cuts each
   page's share picture from its photograph, and Astro's image service
   never enlarges, so a photograph smaller than 1200 × 630 used to give
   a smaller picture: Matunga LHB's 1024 × 536, Ulwe CIDCO School's
   955 × 501, Karanjade Health Care's 1105 × 580 (28 Oct 2026).

   This writes, for each photograph named, a copy enlarged just enough
   to hold a 1200 × 630 crop, to src/assets/share/ under the same file
   name. share-image.ts takes that copy in place of the original for
   the share picture ONLY; the page itself still shows the original.
   Nothing is cropped here: the crop and its focus stay in
   share-image.ts, so the picture is the one the page has always shared,
   larger.

   A photograph that is too small and has no copy here gets the designed
   card (public/share-card.png) instead, never an undersized picture, and
   `npm run check:served-html` names the page.

   Usage:  node scripts/build-share-images.mjs <file under src/assets> ...
             e.g. project-matunga-lhb.jpg gallery/social-ulwe-cidco-school.jpg
           node scripts/build-share-images.mjs
             (no names: rebuild every copy already in src/assets/share)
   ============================================================ */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ASSETS = fileURLToPath(new URL("../src/assets/", import.meta.url));
const OUT = path.join(ASSETS, "share");
const WIDTH = 1200;
const HEIGHT = 630;

/* With no names, the originals of the copies already made: the same
   file name, in src/assets or src/assets/gallery. */
function originalOf(file) {
  for (const dir of ["", "gallery"]) {
    const candidate = path.join(dir, file);
    if (existsSync(path.join(ASSETS, candidate))) return candidate;
  }
  throw new Error(`src/assets/share/${file} has no original in src/assets or src/assets/gallery`);
}

const names = process.argv.slice(2);
const files = names.length
  ? names
  : existsSync(OUT)
    ? readdirSync(OUT).filter((f) => /\.(jpe?g|png)$/i.test(f)).map(originalOf)
    : [];
if (!files.length) {
  console.log("Nothing to do: name the photographs to enlarge (see the header).");
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
let failed = 0;
for (const file of files) {
  const source = path.join(ASSETS, file);
  if (!existsSync(source)) {
    console.log(`  FAIL  ${file}: not found under src/assets`);
    failed++;
    continue;
  }
  /* rotate() first, so a camera's orientation flag is applied before the
     size is read, as the site's own image service does. */
  const { data, info } = await sharp(source).rotate().toBuffer({ resolveWithObject: true });
  if (info.width >= WIDTH && info.height >= HEIGHT) {
    console.log(`  skip  ${file}: ${info.width} × ${info.height} already holds ${WIDTH} × ${HEIGHT}`);
    continue;
  }
  const scale = Math.max(WIDTH / info.width, HEIGHT / info.height);
  const width = Math.ceil(info.width * scale);
  const height = Math.ceil(info.height * scale);
  const target = path.join(OUT, path.basename(file).replace(/\.[a-z]+$/i, ".jpg"));
  await sharp(data)
    .resize(width, height, { kernel: "lanczos3" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(target);
  console.log(`  ok    ${file}: ${info.width} × ${info.height} -> ${width} × ${height}, ${path.relative(ASSETS, target)}`);
}
process.exit(failed ? 1 : 0);
