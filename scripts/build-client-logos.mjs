/* ============================================================
   Client logo derivatives
   ------------------------------------------------------------
   Writes src/assets/clients/*.png from the supplied marks in Logo/ at
   the project root. What arrived is nine files in nine states — white
   JPEG canvases, an off-white one, a 1px grey frame, a stray red rule
   under the Indian Railways roundel, one transparent 3092px PNG, and
   Balbharati's emblem still sitting on its textbook-cover pattern. Put
   straight into a card, each one would be centred on its CANVAS, not
   on the mark, and each canvas would show as a pale box on the mist
   band.

   So every mark comes out the same way:

     1. its background removed, flood-filled from the edges only, so
        white INSIDE a mark (the PWD ring, the stars on the roundel,
        JNPT's wheel) stays white;
     2. its anti-aliased rim un-matted against that background, so the
        edge does not leave a white halo on mist;
     3. trimmed to the mark's own bounding box, so centring the image
        in CSS centres the mark itself;
     4. capped at 600px on the long edge. Astro cuts the 1× / 2× WebP
        at request time.

   It also writes src/assets/clients/coverage.json — the share of each
   trimmed box the mark actually covers. A solid roundel fills ~80% of
   its box, CIDCO's open lockup ~22%, and src/lib/client-logos.ts sizes
   the marks by it so they sit at one visual weight.

   No mark is recoloured, redrawn or desaturated. They are other
   organisations' marks — two of them carry the State Emblem.

   Per-mark fixes:
     inset        px off every edge before anything else (a scan frame).
     cropBottom   px off the foot (the rule under the IR roundel).
     bg           "flood"       — uniform canvas, colour read off a corner.
                  "transparent" — already cut out; trim and resize only.
                  "pattern"     — Balbharati: the canvas is a printed
                                  pattern, not a colour, so the fill runs
                                  through anything that is neither the
                                  black keyline nor the magenta field.

   Usage:  node scripts/build-client-logos.mjs
   ============================================================ */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = path.join(ROOT, "Logo");
const OUT = path.join(ROOT, "src", "assets", "clients");
const MAX = 600;

const LOGOS = [
  { out: "indian-railways.png", src: "Indian_railways.jpg", bg: "flood", cropBottom: 4 },
  { out: "central-railway.png", src: "Central-Railway.jpg", bg: "flood", inset: 2 },
  { out: "western-railway.png", src: "western-railway.jpg", bg: "flood" },
  { out: "mrvc.png", src: "MRVC.png", bg: "flood" },
  { out: "cidco.png", src: "CIDCO.png", bg: "flood" },
  { out: "nmmc.png", src: "NMMC.png", bg: "transparent" },
  { out: "jnpt.png", src: "JNPT.png", bg: "flood" },
  { out: "balbharati.png", src: "Balbharti.jpg", bg: "pattern" },
  { out: "maharashtra-pwd.png", src: "Maha_PWD.jpg", bg: "flood" },
];

/* How far a pixel may sit from the canvas colour and still be canvas.
   JPEG noise on these files reaches ~10 per channel. */
const TOLERANCE = 18;
/* How many pixels in from the removed canvas the rim is un-matted. */
const RIM = 2;

function removeBackground(data, width, height, mode) {
  const n = width * height;
  const isCanvas = new Uint8Array(n);
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];

  let test;
  let bg = null;
  if (mode === "flood") {
    bg = px(0);
    test = (i) => {
      const [r, g, b] = px(i);
      return Math.max(Math.abs(r - bg[0]), Math.abs(g - bg[1]), Math.abs(b - bg[2])) <= TOLERANCE;
    };
  } else {
    // Balbharati: stop at the keyline (dark) and the field (magenta —
    // green well below red). The teal and cream pattern passes.
    test = (i) => {
      const [r, g, b] = px(i);
      return Math.max(r, g, b) > 90 && g >= r - 25;
    };
  }

  // Seeded from every edge pixel that passes, so a mark that touches an
  // edge (the roundel, the emblem's clipped corners) does not stop the
  // fill reaching the canvas on the other side of it.
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const seed = (i) => {
    if (!isCanvas[i] && test(i)) {
      isCanvas[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < width; x++) {
    seed(x);
    seed((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    seed(y * width);
    seed(y * width + width - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % width;
    if (x > 0) seed(i - 1);
    if (x < width - 1) seed(i + 1);
    if (i >= width) seed(i - width);
    if (i < n - width) seed(i + width);
  }

  // A printed pattern has dark flecks the fill cannot pass, and each one
  // would survive as a speck beside the emblem. Keep only the emblem
  // itself: the largest region left standing. (Not for "flood" — there,
  // separate regions are letters.)
  if (mode === "pattern") {
    const region = new Int32Array(n).fill(-1);
    const sizes = [];
    for (let start = 0; start < n; start++) {
      if (isCanvas[start] || region[start] !== -1) continue;
      const id = sizes.length;
      let size = 0;
      head = tail = 0;
      region[start] = id;
      queue[tail++] = start;
      while (head < tail) {
        const i = queue[head++];
        size++;
        const x = i % width;
        for (const j of [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i - width, i + width]) {
          if (j >= 0 && j < n && !isCanvas[j] && region[j] === -1) {
            region[j] = id;
            queue[tail++] = j;
          }
        }
      }
      sizes.push(size);
    }
    const keep = sizes.indexOf(Math.max(...sizes));
    for (let i = 0; i < n; i++) if (region[i] !== keep) isCanvas[i] = 1;
  }

  // Distance, in pixels, from the removed canvas — for the rim pass.
  const dist = new Uint8Array(n).fill(255);
  for (let i = 0; i < n; i++) if (isCanvas[i]) dist[i] = 0;
  for (let step = 1; step <= RIM; step++) {
    for (let i = 0; i < n; i++) {
      if (dist[i] !== 255) continue;
      const x = i % width;
      const near =
        (x > 0 && dist[i - 1] === step - 1) ||
        (x < width - 1 && dist[i + 1] === step - 1) ||
        (i >= width && dist[i - width] === step - 1) ||
        (i < n - width && dist[i + width] === step - 1);
      if (near) dist[i] = step;
    }
  }

  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (isCanvas[i]) {
      data[o + 3] = 0;
      continue;
    }
    if (dist[i] === 255) continue;

    if (bg) {
      // Colour-to-alpha against the canvas colour: the least opaque
      // version of this pixel that composites back to what was scanned.
      let a = 0;
      for (let c = 0; c < 3; c++) {
        const v = data[o + c];
        const t = v < bg[c] ? (bg[c] - v) / bg[c] : v > bg[c] ? (v - bg[c]) / (255 - bg[c] || 1) : 0;
        if (t > a) a = t;
      }
      if (a <= 0) {
        data[o + 3] = 0;
        continue;
      }
      for (let c = 0; c < 3; c++) {
        data[o + c] = Math.max(0, Math.min(255, Math.round(bg[c] + (data[o + c] - bg[c]) / a)));
      }
      data[o + 3] = Math.round(data[o + 3] * a);
    } else if (dist[i] === 1) {
      // No single canvas colour to un-matte against — soften the cut.
      data[o + 3] = Math.round(data[o + 3] * 0.5);
    }
  }
}

function contentBox(data, width, height) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

mkdirSync(OUT, { recursive: true });
const coverage = {};

for (const logo of LOGOS) {
  let img = sharp(path.join(SRC, logo.src)).ensureAlpha();
  const meta = await sharp(path.join(SRC, logo.src)).metadata();
  const inset = logo.inset ?? 0;
  const bottom = logo.cropBottom ?? 0;
  if (inset || bottom) {
    img = img.extract({
      left: inset,
      top: inset,
      width: meta.width - inset * 2,
      height: meta.height - inset * 2 - bottom,
    });
  }

  // Cut at 2× the final cap first: enough resolution for a clean rim,
  // without flood-filling NMMC's ten million pixels.
  const { data, info } = await img
    .resize({ width: MAX * 2, height: MAX * 2, fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (logo.bg !== "transparent") removeBackground(data, info.width, info.height, logo.bg);
  const box = contentBox(data, info.width, info.height);

  let covered = 0;
  for (let y = box.top; y < box.top + box.height; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 128) covered++;
    }
  }
  coverage[logo.out] = Math.round((covered / (box.width * box.height)) * 100) / 100;

  const result = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract(box)
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, logo.out));

  console.log(
    `${logo.out.padEnd(24)} ${`${result.width}x${result.height}`.padEnd(9)} ` +
      `${String(Math.round(result.size / 1024)).padStart(3)} KB  coverage ${coverage[logo.out]}`
  );
}

writeFileSync(path.join(OUT, "coverage.json"), JSON.stringify(coverage, null, 2) + "\n");
