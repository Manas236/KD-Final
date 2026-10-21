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
   word of it. JPEG, no metadata.

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

/* Folder -> the certificates it holds, by the fixed name each is written
   under (and named by on its card, `cert` in src/data/pages.ts). */
const FOLDERS = {
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

/* A byte-order mark (Notepad, PowerShell) is not part of the JSON. */
const map = fs.existsSync(MAP_FILE)
  ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8").replace(/^﻿/, ""))
  : {};
const report = { found: [], written: [], unmatched: [], missing: [], stale: [], warnings: [] };

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

async function write(file, name) {
  const scaled = await sharp(await source(file))
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: false })
    .flatten({ background: "white" })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = scaled.info;
  fs.mkdirSync(OUT, { recursive: true });
  const out = path.join(OUT, `${name}.jpg`);
  await sharp(scaled.data)
    .composite([{ input: watermarkSvg(width, height) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  report.written.push(`${name}.jpg  ${width}x${height}  from ${path.basename(file)}`);
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
  const taken = new Map();
  for (const f of files) {
    const file = path.join(dir, f);
    let name = map[f] ?? null;
    if (!name && names.length === 1 && files.length === 1) name = names[0];
    if (!name && /\.pdf$/i.test(f) && folder === "ISO_Certificates") name = isoFromText(pdfText(file));
    if (!name || !names.includes(name)) {
      report.unmatched.push(`${folder}/${f}: read it, then add "${f}": "<${names.join(" | ")}>" to scripts/certificates.map.json. Preview: ${await preview(file)}`);
      continue;
    }
    if (taken.has(name)) {
      report.unmatched.push(`${folder}/${f}: ${name} is already ${taken.get(name)}; one file per certificate`);
      continue;
    }
    taken.set(name, f);
    await write(file, name);
  }
}
if (browser) await browser.close();

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
