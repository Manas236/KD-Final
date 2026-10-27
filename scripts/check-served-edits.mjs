/* ============================================================
   Check: saved edits are IN the HTML the server sends
   ------------------------------------------------------------
   READ-ONLY. Reads each page the way a link preview or a search engine
   does, with no JavaScript, plus the page's saved edits from
   GET /api/content (the open read route, the latest row per key, the
   same rows the server writes into the page). Writes nothing anywhere.

   For every saved edit on every page it says one of:

     written   the edit's slot is on the page and holds the saved text,
               exactly once, marked data-nt-server (src/lib/server-
               edits.ts wrote it, so the browser will not write it again)
     retired   the key names no slot on the page now (a retired card),
               or none the editor could write to. Its text must appear
               nowhere on the page, and that is checked
     FAIL      anything else: a slot that should hold the saved text and
               does not, a retired row's text on the page, the page
               rendered twice

   and, per page, the <title>, meta description, og:title and
   og:description, saying where one follows a saved edit (a project
   page's title, BaseLayout's `editSources`). The anchoring count at the
   end ("anchored N of M", the retired rows' ids) is the snapshot a
   deploy compares before and after.

   Usage:  node scripts/check-served-edits.mjs [origin] [path ...]
           origin defaults to http://localhost:<PORT from .env>; with no
           paths, every page in the origin's sitemap.xml is read.
           Run it from PowerShell on Windows: Git Bash rewrites a "/path"
           argument (see scripts/check-edit-keys.mjs).
   Exit status 1 on any FAIL.
   ============================================================ */
import "dotenv/config";
import { parse } from "parse5";

const args = process.argv.slice(2);
const ORIGIN = (args[0] || `http://localhost:${process.env.PORT || 4322}`).replace(/\/+$/, "");
let paths = args.slice(1);
if (!paths.length) {
  const sitemap = await (await fetch(ORIGIN + "/sitemap.xml")).text();
  paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

/* src/lib/editable.ts normalizeText(), the comparison every side uses. */
const norm = (s) =>
  String(s ?? "")
    .replace(/ /g, " ")
    .replace(/[​-‍﻿]/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const attr = (el, name) => el.attrs?.find((a) => a.name === name)?.value ?? null;
const childEl = (parent, name) => parent?.childNodes?.find((n) => n.nodeName === name);
function walk(root, visit) {
  for (const n of root.childNodes ?? []) {
    visit(n);
    if (n.childNodes) walk(n, visit);
  }
}
const isLeaf = (el) => el.childNodes.length === 1 && el.childNodes[0].nodeName === "#text" && norm(el.childNodes[0].value) !== "";

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log("  FAIL  " + msg);
};
let total = 0;
let anchored = 0;
const retiredIds = [];

for (const path of paths) {
  const res = await fetch(ORIGIN + path, { redirect: "manual" });
  const page = await res.text();
  const api = await fetch(`${ORIGIN}/api/content?path=${encodeURIComponent(path)}`);
  const edits = api.ok ? (await api.json()).edits ?? {} : null;
  const keys = edits ? Object.keys(edits) : [];
  if (!keys.length && res.status === 200) continue;

  console.log(`\n${path}  (HTTP ${res.status}, ${keys.length} saved edit${keys.length === 1 ? "" : "s"}${edits ? "" : ", /api/content answered " + api.status})`);
  if (res.status !== 200) {
    fail(`${path} answered ${res.status}`);
    continue;
  }

  const doc = parse(page);
  const html = childEl(doc, "html");
  const head = childEl(html, "head");
  const body = childEl(html, "body");
  if ((page.match(/<body[\s>]/g) || []).length !== 1) fail(`${path}: the page has more than one <body>`);

  const first = new Map();
  const count = new Map();
  const texts = [];
  walk(body, (n) => {
    if (n.nodeName === "#text") {
      const t = norm(n.value);
      if (t) texts.push(t);
      return;
    }
    const key = n.attrs ? attr(n, "data-edit") : null;
    if (key === null) return;
    count.set(key, (count.get(key) ?? 0) + 1);
    if (!first.has(key)) first.set(key, n);
  });
  const bodyText = texts.join("\n");

  for (const key of keys) {
    const edit = edits[key];
    const want = norm(edit.text);
    total++;
    const el = first.get(key);
    if (!el || !isLeaf(el)) {
      retiredIds.push(edit.id);
      const shown = want.length >= 6 && bodyText.includes(want);
      console.log(`  ${shown ? "FAIL " : "ok   "} retired  #${edit.id} ${key}${shown ? "  (its text IS on the page)" : ""}`);
      if (shown) failures++;
      continue;
    }
    anchored++;
    const got = norm(el.childNodes[0].value);
    const served = attr(el, "data-nt-server") !== null;
    const times = bodyText.split(want).length - 1;
    const dash = want.includes("—") ? "  (em dash kept)" : "";
    if (!served) fail(`#${edit.id} ${key}: slot is on the page but the server did not write it`);
    else if (got !== want) fail(`#${edit.id} ${key}: slot says "${got.slice(0, 80)}", saved text is "${want.slice(0, 80)}"`);
    else if ((count.get(key) ?? 0) !== 1) fail(`#${edit.id} ${key}: ${count.get(key)} slots carry this key`);
    else console.log(`  ok    written  #${edit.id} ${key}  "${want.slice(0, 70)}${want.length > 70 ? "…" : ""}"  (in the page text ${times}x)${dash}`);
  }

  // The head: what a link preview shows.
  const metas = {};
  if (head) {
    walk(head, (n) => {
      if (n.nodeName === "title") metas.title = { value: norm(n.childNodes[0]?.value), from: attr(n, "data-nt-from") };
      if (n.nodeName !== "meta") return;
      const name = attr(n, "name") ?? attr(n, "property");
      if (name === "description" || name === "og:description" || name === "og:title") {
        metas[name] = { value: norm(attr(n, "content")), from: attr(n, "data-nt-from") };
      }
    });
  }
  for (const name of ["title", "og:title", "description", "og:description"]) {
    const m = metas[name];
    if (!m) continue;
    let note = "";
    if (m.from && edits[m.from]) {
      const want = norm(edits[m.from].text);
      if (first.get(m.from) && isLeaf(first.get(m.from))) {
        if (m.value.includes(want)) note = `  (follows the saved ${m.from})`;
        else fail(`${name} should follow the saved ${m.from} and does not`);
      }
    }
    console.log(`        ${name.padEnd(14)} ${m.value.slice(0, 110)}${m.value.length > 110 ? "…" : ""}${note}`);
  }
}

console.log(`\nanchored ${anchored} of ${total} saved edits (latest per key)${retiredIds.length ? `; retired: #${retiredIds.sort((a, b) => a - b).join(", #")}` : ""}`);
console.log(failures ? `FAIL  ${failures} problem(s)` : "PASS");
process.exit(failures ? 1 : 0);
