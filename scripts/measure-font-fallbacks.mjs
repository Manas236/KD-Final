/* ============================================================
   Compute fallback font metrics
   ------------------------------------------------------------
   A one-shot tool, not a build gate. It measures the real fonts against
   their fallbacks in a real browser and prints the @font-face override
   block to paste into tokens.css.

   WHY. Preloading the woff2 gets the font there early but does not
   guarantee it arrives before first paint on a slow connection. When it
   does not, the browser lays the page out in Georgia or Arial, then
   re-lays it out in Fraunces or Inter — and because those substitutes
   are a different WIDTH, a run of copy can take a different number of
   lines, which moves everything below it. That is the 0.0175 CLS this
   page measured on throttled 3G, all of it under the hero H1.

   `size-adjust` fixes it at the source: it scales the fallback so its
   glyphs occupy the same width as the real font's, so the fallback
   wraps identically and the swap changes the shapes without moving
   anything. ascent/descent overrides do the same for the vertical box.

   Usage:  node scripts/measure-font-fallbacks.mjs
   ============================================================ */
import { chromium } from "playwright";
import "dotenv/config";

const ORIGIN = `http://localhost:${process.env.PORT || 4322}`;

/* Pairs of (real face, the local font it should be measured against).
   The fallbacks are the first entries of each stack in tokens.css. */
const PAIRS = [
  { real: "Fraunces Variable", fallback: "Georgia", weight: 700, name: "Fraunces Fallback" },
  { real: "Inter Variable", fallback: "Arial", weight: 400, name: "Inter Fallback" },
];

async function launch() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return await chromium.launch();
  }
}

const browser = await launch();
const page = await (await browser.newContext()).newPage();
await page.goto(ORIGIN + "/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const results = await page.evaluate(async (pairs) => {
  /* A pangram plus the characters this site actually leans on: the
     rupee sign, the middle dot, the em dash and the digits in every
     stat. Measuring on the real alphabet in use beats measuring on
     "Hamburgefonstiv". */
  const SAMPLE =
    "The quick brown fox jumps over the lazy dog 0123456789 " +
    "₹220 Cr · 53 Yrs — Kailashchandra Dilipkumar Constructions";
  const SIZE = 100;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  function metrics(family, weight) {
    ctx.font = `${weight} ${SIZE}px "${family}"`;
    const m = ctx.measureText(SAMPLE);
    return {
      width: m.width,
      ascent: m.fontBoundingBoxAscent,
      descent: m.fontBoundingBoxDescent,
    };
  }

  const out = [];
  for (const p of pairs) {
    const real = metrics(p.real, p.weight);
    const fb = metrics(p.fallback, p.weight);
    out.push({
      ...p,
      realFamily: p.real,
      real,
      fb,
      /* Scale the fallback so a line of text is the same width. */
      sizeAdjust: (real.width / fb.width) * 100,
      /* Overrides are expressed against the ADJUSTED em, so they are the
         real font's own ratios. */
      ascent: (real.ascent / SIZE) * 100,
      descent: (real.descent / SIZE) * 100,
    });
  }
  return out;
}, PAIRS);

await browser.close();

console.log("Measured against the live page, 100px sample:\n");
for (const r of results) {
  console.log(
    `  ${r.name} — ${r.realFamily} vs ${r.fallback} @${r.weight}\n` +
      `    real width ${r.real.width.toFixed(1)}  fallback width ${r.fb.width.toFixed(1)}\n` +
      `    size-adjust ${r.sizeAdjust.toFixed(2)}%  ascent ${r.ascent.toFixed(2)}%  descent ${r.descent.toFixed(2)}%\n`
  );
}

console.log("Paste into src/styles/tokens.css:\n");
for (const r of results) {
  console.log(`@font-face {
  font-family: "${r.name}";
  src: local("${r.fallback}");
  size-adjust: ${r.sizeAdjust.toFixed(2)}%;
  ascent-override: ${r.ascent.toFixed(2)}%;
  descent-override: ${r.descent.toFixed(2)}%;
  line-gap-override: 0%;
}
`);
}
