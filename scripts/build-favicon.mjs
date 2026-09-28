/* ============================================================
   Favicon derivatives
   ------------------------------------------------------------
   Writes public/favicon.ico and public/apple-touch-icon.png from the
   supplied logo, kd_logo.jpg at the project root. Until this existed
   the site served Astro's template favicon — the Astro rocket — on
   every tab (OPEN-QUESTIONS.md #7).

   The logo is a landscape lockup: the KD monogram, an amber rule, the
   CONSTRUCTIONS wordmark, all on the brand mint. A 32px square holds
   none of that, so the icon is the MONOGRAM ALONE — the "KD" with its
   three amber stripes — on the same mint, squared. Nothing is drawn or
   recoloured: the monogram is cut from the logo's own pixels and set
   on a square whose colour is read off the logo's corner.

   How the cut is found, rather than typed in: every column and row of
   the logo is scanned for pixels that are not the mint background; the
   FIRST run of such rows from the top is the monogram (the rule and
   the wordmark are the second and third), and the columns inside that
   run give its width. So the box tracks the file, and a re-exported
   logo re-derives the icon.

   Sizing: the monogram is set at MONOGRAM_SHARE of the square's width
   (letters are wider than tall, so width is the binding edge). No
   rendition is upscaled — the monogram is ~570px wide in the source,
   and the largest icon here is 180.

   Outputs:
     public/favicon.ico          16, 32 and 48px, PNG-encoded entries
                                 (every browser since IE8 / Vista reads
                                 PNG inside ICO; Astro's own template
                                 favicon.ico was one 32px PNG entry)
     public/apple-touch-icon.png 180px, iOS home screen and Safari tab

   Usage:  node scripts/build-favicon.mjs
   ============================================================ */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = path.join(ROOT, "kd_logo.jpg");
const OUT = path.join(ROOT, "public");

/* Width of the square the monogram occupies. */
const MONOGRAM_SHARE = 0.84;

const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;

/* A pixel is background if every channel is within this of the corner
   pixel. JPEG ringing around the letters sits well under it; the
   letters and the amber stripes sit far over it. */
const TOLERANCE = 40;

/* ---------- 1. find the monogram ---------- */
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const at = (x, y) => {
  const i = (y * W + x) * C;
  return [data[i], data[i + 1], data[i + 2]];
};
const bg = at(1, 1);
const isInk = (x, y) => {
  const [r, g, b] = at(x, y);
  return (
    Math.abs(r - bg[0]) > TOLERANCE ||
    Math.abs(g - bg[1]) > TOLERANCE ||
    Math.abs(b - bg[2]) > TOLERANCE
  );
};

/* Rows that hold anything but background, as runs. */
const rowHasInk = [];
for (let y = 0; y < H; y++) {
  let hit = false;
  for (let x = 0; x < W && !hit; x++) hit = isInk(x, y);
  rowHasInk.push(hit);
}
const runs = [];
for (let y = 0, start = -1; y <= H; y++) {
  const on = y < H && rowHasInk[y];
  if (on && start < 0) start = y;
  if (!on && start >= 0) {
    runs.push({ top: start, bottom: y - 1 });
    start = -1;
  }
}
if (runs.length < 2) {
  throw new Error(`expected the logo to stack monogram, rule and wordmark; found ${runs.length} run(s)`);
}
const { top, bottom } = runs[0];

let left = W;
let right = -1;
for (let x = 0; x < W; x++) {
  for (let y = top; y <= bottom; y++) {
    if (isInk(x, y)) {
      left = Math.min(left, x);
      right = Math.max(right, x);
      break;
    }
  }
}

const box = { left, top, width: right - left + 1, height: bottom - top + 1 };
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
console.log(`monogram ${box.width}×${box.height} at (${box.left}, ${box.top}); mint ${hex(bg)}`);

/* ---------- 2. square it ---------- */
/* One square master at source resolution, then each size is a resize
   of that — so every icon is the same picture, not the same recipe. */
const side = Math.round(box.width / MONOGRAM_SHARE);
const monogram = await sharp(SRC).extract(box).png().toBuffer();
const master = await sharp({
  create: { width: side, height: side, channels: 3, background: { r: bg[0], g: bg[1], b: bg[2] } },
})
  .composite([{ input: monogram, gravity: "centre" }])
  .png()
  .toBuffer();

const rendition = (size) =>
  sharp(master).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();

/* ---------- 3. write ---------- */
/* ICO container: a 6-byte header, one 16-byte directory entry per
   image, then the images. PNG payloads are allowed as-is. */
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); // width, 0 means 256
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1); // height
    dir.writeUInt8(0, o + 2); // palette size: none
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

const icoEntries = [];
for (const size of ICO_SIZES) icoEntries.push({ size, png: await rendition(size) });
writeFileSync(path.join(OUT, "favicon.ico"), ico(icoEntries));
console.log(`wrote public/favicon.ico (${ICO_SIZES.join(", ")}px)`);

writeFileSync(path.join(OUT, "apple-touch-icon.png"), await rendition(APPLE_SIZE));
console.log(`wrote public/apple-touch-icon.png (${APPLE_SIZE}px)`);
