/* ============================================================
   Go-live gate — no placeholder may ship
   ------------------------------------------------------------
   Every piece of content the company has not yet supplied is on the
   site as a VISIBLE placeholder during review — a `pending` item in a
   copy module — so the client sees the gap instead of a missing page
   (OPEN-QUESTIONS.md #32). This script is the other half of that
   bargain: it lists every one, and exits non-zero while any exists, so
   `npm run build:release` cannot produce a launch build with a
   "To be added" card on it. PRE-LAUNCH.md is the same list for people.

   It reads the copy modules, not the rendered pages, so it needs no
   server and no browser; a placeholder is a `pending` field on an item
   in src/data/*.ts, and that is what it looks for. Reports the page,
   the item's title and its label, so the line can be matched to
   PRE-LAUNCH.md by eye.

   LAUNCH MODE (31 Oct 2026). With HIDE_PENDING=1 (in the environment
   or .env, as the build reads it) the build leaves every unanswered
   placeholder off the site (src/lib/launch.ts), so a placeholder still
   in the data does not ship. Then this passes as long as each one is a
   kind of item launch mode knows how to leave out, lists them, and
   fails on any it does not. Whether one stays because Sir typed into it
   is for the database to say: scripts/pending-report.mjs, after the
   build.

   Usage:  node scripts/check-placeholders.mjs
   ============================================================ */
import dotenv from "dotenv";
import { MODULES, pagesOf, pendingItems, launchKind } from "./placeholder-modules.mjs";

dotenv.config({ quiet: true });

const launch = ["1", "true"].includes(String(process.env.HIDE_PENDING ?? "").trim().toLowerCase());

const found = [];
for (const row of MODULES) {
  for (const page of await pagesOf(row)) {
    for (const { path, item } of pendingItems(page.copy)) {
      found.push({
        route: page.route,
        key: [...page.base, ...path].join("."),
        title: item.title,
        label: item.pending,
        kind: launchKind(row.exportName, path),
      });
    }
  }
}

if (found.length === 0) {
  console.log("  PASS  no placeholders — nothing on the site is marked pending");
  process.exit(0);
}

if (launch) {
  const unknown = found.filter((f) => !f.kind);
  if (!unknown.length) {
    console.log(
      `  PASS  HIDE_PENDING=1: the build leaves these ${found.length} placeholders off the site, ` +
        `except any with a saved edit on it (node scripts/pending-report.mjs <origin> says which):\n`
    );
    for (const f of found) console.log(`        ${f.route}  ·  ${f.title}  ·  [${f.label}]  ·  ${f.kind}`);
    process.exit(0);
  }
  console.log(`  FAIL  HIDE_PENDING=1, but launch mode cannot leave ${unknown.length} placeholder${unknown.length === 1 ? "" : "s"} off the site (src/lib/launch.ts):\n`);
  for (const f of unknown) console.log(`        ${f.route}  ·  ${f.title}  ·  [${f.label}]  ·  ${f.key}`);
  process.exit(1);
}

console.log(`  FAIL  ${found.length} placeholder${found.length === 1 ? "" : "s"} still on the site — fill or remove each before go-live (PRE-LAUNCH.md):\n`);
for (const f of found) {
  console.log(`        ${f.route}  ·  ${f.title}  ·  [${f.label}]  ·  ${f.key}`);
}
process.exit(1);
