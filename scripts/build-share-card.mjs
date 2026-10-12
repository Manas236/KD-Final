/* ============================================================
   Share card
   ------------------------------------------------------------
   Writes public/share-card.png — the 1200×630 picture WhatsApp,
   LinkedIn and search show beside a link to a page that has no
   photograph of its own (/company, /capabilities, /resources, /hse,
   /csr, /clients, /careers, /contact, /privacy, /terms, a project page
   still waiting for its photograph). Until this existed those links
   were previewed as text alone (PRE-LAUNCH.md G3, OPEN-QUESTIONS.md #7).
   BaseLayout.astro falls back to it whenever a page passes no `image`.

   WHAT IS ON IT: the logo and the company name. Nothing else — a card
   is read at thumbnail size, and a fact printed on it would have to be
   kept true by hand on every page it stands in for.

   Nothing here is typed in that the site already holds:

     · the logo is public/kd-logo.svg, the nav's own file
     · the four colours are read out of src/styles/tokens.css — ink
       ground, ink-deep foot (the page's own ending), mist name, and
       mint for the rule, which is on a dark ground as mint must be
     · the name is set in the same Fraunces file the site ships, at 700,
       the only weight the display face is ever used at, and at 60/75 —
       `d2`, the closing-headline size

   No corner is softened and there is no shadow or gradient: the card
   follows DESIGN-SYSTEM.md §0 and §11 like any other surface.

   The whole composition sits inside the middle 630px, because some
   previews crop a share image to a centred square.

   Drawn by a real browser rather than by sharp: the name has to be set
   in the web font, and a browser is the one renderer here that is
   certain to shape it the way the site does. Same launch order as the
   check scripts — the installed Chrome first, Playwright's own after.

   Usage:  node scripts/build-share-card.mjs
   ============================================================ */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = path.join(ROOT, "public", "share-card.png");

const WIDTH = 1200;
const HEIGHT = 630;
const NAME = "K.D. Constructions";

/* ---------- From the site ---------- */
const tokens = readFileSync(path.join(ROOT, "src/styles/tokens.css"), "utf8");
const token = (name) => {
  const found = tokens.match(new RegExp(`--kd-${name}:\\s*(#[0-9A-Fa-f]{6});`));
  if (!found) throw new Error(`tokens.css has no --kd-${name}`);
  return found[1];
};
const INK = token("ink");
const INK_DEEP = token("ink-deep");
const MIST = token("mist");
const MINT = token("mint");

const dataUrl = (file, type) =>
  `data:${type};base64,${readFileSync(path.join(ROOT, file)).toString("base64")}`;
const logo = dataUrl("public/kd-logo.svg", "image/svg+xml");
const fraunces = dataUrl(
  "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
  "font/woff2"
);

/* ---------- The card ----------
   A column, centred: logo, the 48px accent rule, the name. The foot is
   a 24px ink-deep band, and the column is centred in what is left
   above it. */
const FOOT = 24;
const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: "Fraunces";
    src: url("${fraunces}") format("woff2");
    font-weight: 100 900;
  }
  html, body { margin: 0; }
  .card {
    position: relative;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: ${INK};
  }
  .stack {
    position: absolute;
    inset: 0 0 ${FOOT}px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .logo { display: block; width: 372px; height: 250px; }
  .rule { display: block; width: 48px; height: 2px; margin-top: 48px; background: ${MINT}; }
  .name {
    margin: 32px 0 0;
    font-family: "Fraunces", serif;
    font-weight: 700;
    font-size: 60px;
    line-height: 75px;
    color: ${MIST};
    white-space: nowrap;
  }
  .foot { position: absolute; inset: auto 0 0 0; height: ${FOOT}px; background: ${INK_DEEP}; }
</style>
<div class="card">
  <div class="stack">
    <img class="logo" src="${logo}" alt="">
    <span class="rule"></span>
    <p class="name">${NAME}</p>
  </div>
  <div class="foot"></div>
</div>`;

async function launch() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return await chromium.launch();
  }
}

const browser = await launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
if (!(await page.evaluate(() => document.fonts.check('700 60px "Fraunces"')))) {
  throw new Error("Fraunces did not load — the card would be set in a fallback serif");
}
/* The name must stay inside the square a cropped preview keeps. */
const nameWidth = await page.evaluate(() => document.querySelector(".name").getBoundingClientRect().width);
if (nameWidth > HEIGHT - 40) throw new Error(`"${NAME}" is ${Math.round(nameWidth)}px wide — too wide for a square crop`);
const shot = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
await browser.close();

await sharp(shot).png({ compressionLevel: 9 }).toFile(OUT);
const { width, height } = await sharp(OUT).metadata();
console.log(`public/share-card.png  ${width}×${height}  ${(statSync(OUT).size / 1024).toFixed(1)} kB`);
