/* ============================================================
   Deploy check: is there a saved edit on a key whose default changed?
   ------------------------------------------------------------
   READ-ONLY, over HTTP: asks the running site's open read route,
   GET /api/content?path=<page>, for each page's latest saved edit per
   key, and compares those keys with a list of (page, key) pairs whose
   built-in text a pass changed. A saved edit always shows over the
   built-in text, so on such a key the new wording would not appear, and
   the saved row is Sir's: it is never changed. Any match stops the
   deploy until someone has decided what to do.

   The list is a TSV with a header row: page_path, edit_key,
   old_default, new_default (docs/changed-defaults-<date>.tsv, written
   with the pass). Uses nothing but Node's own fetch, so it runs from a
   copy taken with `git show` before the pull, against the old build.

   Usage:  node scripts/check-changed-defaults.mjs <origin> <list.tsv>
   Exit status 1 if any listed key has a saved edit, 2 if a page's edits
   could not be read.
   ============================================================ */
import { readFileSync } from "node:fs";

const [origin, list] = process.argv.slice(2);
if (!origin || !list) {
  console.error("usage: node scripts/check-changed-defaults.mjs <origin> <list.tsv>");
  process.exit(2);
}

const rows = readFileSync(list, "utf8")
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.split("\t"));
const byPage = new Map();
for (const [page, key, was, now] of rows) {
  if (!byPage.has(page)) byPage.set(page, []);
  byPage.get(page).push({ key, was, now });
}

let hits = 0;
let unreadable = 0;
for (const [page, keys] of byPage) {
  const res = await fetch(`${origin.replace(/\/+$/, "")}/api/content?path=${encodeURIComponent(page)}`);
  if (!res.ok) {
    unreadable++;
    console.log(`  ??    ${page}: /api/content answered ${res.status}`);
    continue;
  }
  const { edits = {} } = await res.json();
  for (const { key, now } of keys) {
    const saved = edits[key];
    if (!saved) continue;
    hits++;
    console.log(`  SAVED ${page}  ${key}  row #${saved.id}  "${String(saved.text).slice(0, 90)}"`);
    console.log(`        the new default under it would be "${now.slice(0, 90)}"`);
  }
}

console.log(`\n${rows.length} changed defaults on ${byPage.size} pages checked; ${hits} with a saved edit.`);
if (unreadable) {
  console.log(`STOP  ${unreadable} page(s) could not be read`);
  process.exit(2);
}
console.log(hits ? "STOP  a saved edit sits on a changed key: deploy nothing, report it" : "PASS  no saved edit on any changed key");
process.exit(hits ? 1 : 0);
