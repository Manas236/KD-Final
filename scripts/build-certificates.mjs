/* ============================================================
   Certificates: watermarked copies for /hse's "View certificate"
   ------------------------------------------------------------
   21 Oct 2026, at Sir's request (OPEN-QUESTIONS.md #58). Reads the
   certificate scans K.D. supplies and writes, for each certificate, ONE
   watermarked image into src/assets/certificates/<name>.jpg, which is
   the only thing the site ever serves. The scans themselves stay where
   they were put, are git-ignored, and are never copied anywhere else.

   WHERE THE SCANS ARE. A folder of each name below, looked for in the
   project root first and then in its parent folder:

     Certificates/        any of them, mixed (what K.D. sent, 21 Oct 2026)
     ISO_Certificates/    the three ISO certificates (JPEG, PNG or PDF)
     Tax_Certificate/     the Indian Tax Authorities' recognition
     CIDCO_Certificate/   the CIDCO registration
     PWD_Licence/         the PWD electrical licence

   WHICH FILE IS WHICH, never by file order. A single-certificate folder
   with one file is that certificate. Otherwise a file is matched by
   reading it: a PDF's own text naming exactly one of ISO 9001, 14001 or
   45001 (read with Python's pypdf where `py` has it), or, for a scan,
   which has no text, a line in scripts/certificates.map.json written by
   whoever read it: { "<file name>": "iso-9001" }. A file that cannot be
   matched is reported, with a preview to read in the system's temp
   folder, and nothing is written for it.

   WHAT IT DOES TO EACH. A PDF's first page is rendered by the same
   Chrome the gates use (Playwright, channel chrome) and trimmed to the
   page; an image is turned upright by its EXIF. Then it is scaled to
   1400px on the long edge and a tiled diagonal watermark, "K.D.
   Constructions · For verification only", is burned in: dark, at a fifth
   of full strength, so it reads clearly on the paper without hiding a
   word of it.

   SCRAMBLED, 21 Oct 2026. The file written is not the certificate as it
   looks: it is cut into 64px tiles and the tiles are shuffled, so the
   JPEG anyone fetches from the site (a new tab, the network panel) is a
   mosaic. The order comes from a seed, and the seed, the true size and
   the tile size go into src/assets/certificates/layout.json, which the
   viewer (CertificateViewer.astro) uses to put the tiles back on a
   canvas. A deterrent like the rest of the viewer: whoever reads the
   viewer's script can reverse it. The tiles are whole 8px JPEG blocks
   and the colour is not subsampled (4:4:4), so put back together the
   seams do not show. JPEG, no metadata.

   SAFE TO RUN AGAIN, and meant to be: when a certificate arrives later,
   put it in its folder and run this. The same scan gives the same image.
   An image whose scan has gone is listed, not deleted.

   AFTER IT RUNS: read each certificate and put its number, certifying
   body and validity on its card in src/data/pages.ts as `facts`
   ("Certificate number", "Certifying body", "Valid until"); a field that
   cannot be read stays "To be added". This script then checks every
   "Valid until" and warns about any certificate expired or expiring
   within 60 days. Rebuild the site, and the cards with an image have
   their button.

   Usage:  node scripts/build-certificates.mjs        (npm run certificates:build)
   ============================================================ */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = path.join(ROOT, "src", "assets", "certificates");
const MAP_FILE = path.join(ROOT, "scripts", "certificates.map.json");
const LAYOUT_FILE = path.join(OUT, "layout.json");

/* Folder -> the certificates it holds, by the fixed name each is written
   under (and named by on its card, `cert` in src/data/pages.ts). */
const FOLDERS = {
  Certificates: ["iso-9001", "iso-14001", "iso-45001", "tax-recognition", "cidco-registration", "pwd-licence"],
  ISO_Certificates: ["iso-9001", "iso-14001", "iso-45001"],
  Tax_Certificate: ["tax-recognition"],
  CIDCO_Certificate: ["cidco-registration"],
  PWD_Licence: ["pwd-licence"],
};
const ISO = { "9001": "iso-9001", "14001": "iso-14001", "45001": "iso-45001" };
const READABLE = /\.(jpe?g|png|webp|tiff?|pdf)$/i;

const LONG_EDGE = 1400;
const WATERMARK = "K.D. Constructions · For verification only";
const WARN_DAYS = 60;
/* A multiple of the JPEG block (8px; 16 covers any encoder's MCU). */
const TILE = 64;

/* A byte-order mark (Notepad, PowerShell) is not part of the JSON. */
const map = fs.existsSync(MAP_FILE)
  ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8").replace(/^﻿/, ""))
  : {};
const layout = fs.existsSync(LAYOUT_FILE) ? JSON.parse(fs.readFileSync(LAYOUT_FILE, "utf8")) : {};
const report = { found: [], written: [], unmatched: [], missing: [], stale: [], warnings: [] };
/* Certificate name -> the file it was written from, across all folders. */
const taken = new Map();

/* ---------- where ---------- */
function folderFor(name) {
  for (const base of [ROOT, path.dirname(path.resolve(ROOT))]) {
    const dir = path.join(base, name);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  }
  return null;
}

/* ---------- reading a PDF's own text (pypdf), when it has any ---------- */
function pdfText(file) {
  try {
    return execFileSync(
      "py",
      ["-I", "-c", "import sys,pypdf;r=pypdf.PdfReader(sys.argv[1]);print(r.pages[0].extract_text() or '')", file],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    return "";
  }
}

function isoFromText(text) {
  const hits = Object.keys(ISO).filter((n) => new RegExp(`ISO\\s*${n}\\b`, "i").test(text));
  return hits.length === 1 ? ISO[hits[0]] : null;
}

/* ---------- rendering ---------- */
let browser = null;
async function renderPdf(file) {
  if (!browser) {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({ channel: "chrome" });
  }
  const page = await browser.newPage({ viewport: { width: 1000, height: 1414 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(file).href + "#toolbar=0&navpanes=0&scrollbar=0&view=Fit");
  await page.waitForTimeout(2500);
  const shot = await page.screenshot();
  await page.close();
  // The viewer's grey around the page goes; a hairline more for its shadow.
  const trimmed = await sharp(shot).trim({ threshold: 40 }).toBuffer({ resolveWithObject: true });
  const { width, height } = trimmed.info;
  return sharp(trimmed.data)
    .extract({ left: 3, top: 3, width: Math.max(1, width - 6), height: Math.max(1, height - 6) })
    .toBuffer();
}

async function source(file) {
  return /\.pdf$/i.test(file) ? renderPdf(file) : sharp(file).rotate().toBuffer();
}

function watermarkSvg(w, h) {
  const size = Math.round(Math.max(w, h) / 44);
  const step = Math.round(size * 4.2);
  const span = Math.ceil(Math.hypot(w, h));
  const rows = [];
  for (let y = -span, r = 0; y < span * 2; y += step, r++) {
    const offset = r % 2 ? size * 12 : 0;
    for (let x = -span - offset; x < span * 2; x += size * 24) {
      rows.push(`<text x="${x}" y="${y}">${WATERMARK.replace(/&/g, "&amp;")}</text>`);
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<g transform="rotate(-30 ${w / 2} ${h / 2})" font-family="Arial, Helvetica, sans-serif" ` +
      `font-size="${size}" font-weight="700" fill="rgb(30,43,48)" fill-opacity="0.2">` +
      rows.join("") +
      `</g></svg>`,
  );
}

/* ---------- scrambling ----------
   The same three functions, in the same order, are in
   CertificateViewer.astro: change one, change both. */
function seedOf(name) {
  // FNV-1a, 32-bit: a fixed seed per certificate, so a rerun is identical.
  let h = 0x811c9dc5;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0;
  return h;
}

function random(seed) {
  // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tile i of the written file is tile order[i] of the certificate. */
function tileOrder(count, seed) {
  const order = Array.from({ length: count }, (_, i) => i);
  const next = random(seed);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

async function write(file, name) {
  const scaled = await sharp(await source(file))
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: false })
    .flatten({ background: "white" })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = scaled.info;
  const cols = Math.ceil(width / TILE);
  const rows = Math.ceil(height / TILE);
  // Watermarked, then padded white to whole tiles, as raw RGB.
  const marked = await sharp(scaled.data)
    .composite([{ input: watermarkSvg(width, height) }])
    .extend({ right: cols * TILE - width, bottom: rows * TILE - height, background: "white" })
    .removeAlpha()
    .raw()
    .toBuffer();
  const seed = seedOf(name);
  const order = tileOrder(cols * rows, seed);
  const stride = cols * TILE * 3;
  const mixed = Buffer.alloc(marked.length);
  order.forEach((from, to) => {
    const fx = (from % cols) * TILE * 3, fy = Math.floor(from / cols) * TILE;
    const tx = (to % cols) * TILE * 3, ty = Math.floor(to / cols) * TILE;
    for (let y = 0; y < TILE; y++) {
      marked.copy(mixed, (ty + y) * stride + tx, (fy + y) * stride + fx, (fy + y) * stride + fx + TILE * 3);
    }
  });
  fs.mkdirSync(OUT, { recursive: true });
  await sharp(mixed, { raw: { width: cols * TILE, height: rows * TILE, channels: 3 } })
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(OUT, `${name}.jpg`));
  layout[name] = { width, height, tile: TILE, seed };
  report.written.push(`${name}.jpg  ${width}x${height}, ${cols}x${rows} tiles  from ${path.basename(file)}`);
}

async function preview(file) {
  const out = path.join(os.tmpdir(), `kd-certificate-preview-${path.basename(file)}.jpg`);
  await sharp(await source(file)).resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside" }).jpeg().toFile(out);
  return out;
}

/* ---------- each folder ---------- */
for (const [folder, names] of Object.entries(FOLDERS)) {
  const dir = folderFor(folder);
  if (!dir) {
    report.missing.push(`${folder}/ (not in ${ROOT} or its parent)`);
    continue;
  }
  const files = fs.readdirSync(dir).filter((f) => READABLE.test(f)).sort();
  report.found.push(`${dir}: ${files.length ? files.join(", ") : "no readable file"}`);
  for (const f of files) {
    const file = path.join(dir, f);
    let name = map[f] ?? null;
    if (!name && names.length === 1 && files.length === 1) name = names[0];
    if (!name && /\.pdf$/i.test(f) && names.includes("iso-9001")) name = isoFromText(pdfText(file));
    if (!name || !names.includes(name)) {
      report.unmatched.push(`${folder}/${f}: read it, then add "${f}": "<${names.join(" | ")}>" to scripts/certificates.map.json. Preview: ${await preview(file)}`);
      continue;
    }
    if (taken.has(name)) {
      report.unmatched.push(`${folder}/${f}: ${name} is already ${taken.get(name)}; one file per certificate`);
      continue;
    }
    taken.set(name, `${folder}/${f}`);
    await write(file, name);
  }
}
if (browser) await browser.close();
if (report.written.length) {
  const sorted = Object.fromEntries(Object.keys(layout).sort().map((k) => [k, layout[k]]));
  fs.writeFileSync(LAYOUT_FILE, JSON.stringify(sorted, null, 2) + "\n");
}

/* ---------- images whose scan is gone ---------- */
const all = Object.values(FOLDERS).flat();
if (fs.existsSync(OUT)) {
  for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith(".jpg"))) {
    const name = f.replace(/\.jpg$/, "");
    if (!all.includes(name)) report.stale.push(`${f}: not a certificate name`);
    else if (!report.written.some((w) => w.startsWith(f))) report.stale.push(`${f}: kept from an earlier run (no scan for it now)`);
  }
}

/* ---------- validity, from the cards ---------- */
const { hse } = await import(pathToFileURL(path.join(ROOT, "src", "data", "pages.ts")).href);
const today = new Date();
for (const section of hse.sections) {
  for (const item of section.items) {
    if (!item.cert || item.retired) continue;
    const valid = item.facts?.find((f) => /valid/i.test(f.label));
    if (!valid) continue;
    const until = new Date(valid.value);
    if (Number.isNaN(until.getTime())) {
      report.warnings.push(`${item.title}: "Valid until" reads "${valid.value}", not a date this script can check`);
      continue;
    }
    const days = Math.floor((until - today) / 86400000);
    if (days < 0) report.warnings.push(`${item.title}: EXPIRED ${Math.floor((today - until) / 86400000)} day(s) ago (${valid.value})`);
    else if (days <= WARN_DAYS) report.warnings.push(`${item.title}: expires in ${days} day(s) (${valid.value})`);
  }
}

/* ---------- report ---------- */
const print = (head, lines) => {
  console.log(`\n${head}`);
  for (const l of lines.length ? lines : ["(none)"]) console.log(`  ${l}`);
};
print("Folders found", report.found);
print("Folders not found", report.missing);
print("Written to src/assets/certificates/", report.written);
print("Not matched (nothing written)", report.unmatched);
print("Images without a scan this run", report.stale);
print(`Validity warnings (expired, or within ${WARN_DAYS} days)`, report.warnings);
process.exit(report.unmatched.length || report.warnings.length ? 1 : 0);
