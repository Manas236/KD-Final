/* ============================================================
   The K.D. Constructions credit, into the photographs in the repo
   ------------------------------------------------------------
   Walks src/assets and public, sorts every image (scripts/photo-classes.mjs)
   and writes the credit (src/lib/photo-credit.ts) into the REAL ones that
   do not have it. Nothing else is touched, and no picture is re-encoded.

   THE PROOF, for every file it writes, before the file is replaced:
     · the decoded pixels hash the same before and after;
     · taking the three inserted segments out gives back the old file,
       byte for byte.
   One failure stops the run with nothing further written.

   A file already credited is left alone, so it can be run any number of
   times. RUN IT AFTER build-gallery, build-share-images or build-hero-video
   --poster: those write fresh files with no metadata, and
   `npm run check:photo-credit` fails until this has been run.

   Usage:
     node scripts/credit-photos.mjs                 report only
     node scripts/credit-photos.mjs --write         write the credit
         [--proof <file.tsv>]                       one line per file written
         [--names <dist/client/_astro>]             see below
     node scripts/credit-photos.mjs --check         read only: exit 1 if a
                                                    REAL file lacks the credit,
                                                    any other file has it, or
                                                    a file has no class

   --names: a credit changes a file's bytes, so the hash in its /_astro name
   would change, and with it every <img> URL on the site. Given the
   _astro folder of a build made BEFORE the credit, it records each file's
   hash there in scripts/photo-asset-names.json, keyed by the credited
   file's SHA-256 (scripts/keep-photo-urls.mjs), so the URLs and the HTML
   stay byte for byte. A later change to the photograph changes its SHA-256,
   the entry stops matching, and it gets a new name like any other file.
   ============================================================ */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { classify } from "./photo-classes.mjs";
import { JPEG_CREDIT, hasCredit, withCredit } from "../src/lib/photo-credit.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const CHECK = args.includes("--check");
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const PROOF = option("--proof");
const NAMES_FROM = option("--names");
const NAMES_FILE = join(ROOT, "scripts", "photo-asset-names.json");

const IMAGE = /\.(jpe?g|png|webp|avif|gif|svg|ico|tiff?|heic)$/i;
function walk(dir, out = []) {
  for (const entry of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (IMAGE.test(entry)) out.push(rel);
  }
  return out;
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function pixels(bytes) {
  const { data, info } = await sharp(bytes, { failOn: "none" }).raw().toBuffer({ resolveWithObject: true });
  return `${info.width}x${info.height}x${info.channels}:${sha256(data)}`;
}

/** The file with the three segments taken out again, or null. */
function withoutCredit(bytes) {
  const first = JPEG_CREDIT[0];
  const at = Buffer.from(bytes).indexOf(Buffer.from(first));
  if (at < 0) return null;
  const size = JPEG_CREDIT.reduce((n, s) => n + s.length, 0);
  return Buffer.concat([bytes.subarray(0, at), bytes.subarray(at + size)]);
}

const files = [...walk("src/assets"), ...walk("public")].sort();
const counts = { REAL: 0, AI: 0, GRAPHIC: 0, UNSURE: 0 };
const unsure = [];
const problems = [];
const proof = ["file\tbytes_before\tbytes_after\tpixels_before\tpixels_after\tpixels_same\tbytes_restored"];
const names = existsSync(NAMES_FILE) ? JSON.parse(readFileSync(NAMES_FILE, "utf8")) : {};

/* The build from before the credit: its _astro files by content. */
const built = new Map();
if (NAMES_FROM) {
  for (const entry of readdirSync(NAMES_FROM)) {
    if (/\.jpe?g$/i.test(entry)) built.set(sha256(readFileSync(join(NAMES_FROM, entry))), entry);
  }
}

let written = 0;
let already = 0;
for (const file of files) {
  const { cls, why } = classify(file);
  counts[cls]++;
  const path = join(ROOT, file);
  const bytes = readFileSync(path);
  const credited = hasCredit(bytes);

  if (cls === "UNSURE") unsure.push({ file, why });
  if (cls !== "REAL") {
    if (credited) problems.push(`${file}: ${cls}, but it carries the credit`);
    continue;
  }
  if (credited) {
    already++;
    continue;
  }
  if (!WRITE) {
    if (CHECK) problems.push(`${file}: REAL, no credit (npm run photos:credit)`);
    continue;
  }

  const after = Buffer.from(withCredit(bytes));
  const [before, now] = await Promise.all([pixels(bytes), pixels(after)]);
  const restored = withoutCredit(after);
  const sameBytes = restored !== null && restored.equals(bytes);
  if (before !== now || !sameBytes || !hasCredit(after)) {
    console.error(`STOP  ${file}: pixels same ${before === now}, bytes restored ${sameBytes}. Nothing written for it.`);
    process.exit(1);
  }
  writeFileSync(path, after);
  written++;
  proof.push(`${file}\t${bytes.length}\t${after.length}\t${before}\t${now}\tyes\tyes`);
  if (NAMES_FROM && file.startsWith("src/assets/")) {
    const hash = built.get(sha256(bytes))?.match(/\.([\w-]{8})\.[a-z]+$/i)?.[1];
    if (hash) names[sha256(after)] = hash;
    else problems.push(`${file}: not in ${NAMES_FROM}, so its URL will change`);
  }
}

console.log(`Images under src/assets and public: ${files.length}`);
console.log(`  REAL     ${counts.REAL}  (${already} already credited, ${written} written now)`);
console.log(`  AI       ${counts.AI}`);
console.log(`  GRAPHIC  ${counts.GRAPHIC}`);
console.log(`  UNSURE   ${counts.UNSURE}`);
for (const { file, why } of unsure) console.log(`    ${relative(ROOT, join(ROOT, file)).replace(/\\/g, "/")}: ${why}`);

if (WRITE && NAMES_FROM) writeFileSync(NAMES_FILE, JSON.stringify(names, Object.keys(names).sort(), 1) + "\n");
if (WRITE && PROOF) writeFileSync(PROOF, proof.join("\n") + "\n");
for (const p of problems) console.log(`  PROBLEM  ${p}`);
if (CHECK) console.log(problems.length ? `FAIL  ${problems.length} problem(s)` : "PASS");
process.exit(problems.length ? 1 : 0);
