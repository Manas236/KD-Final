/* ============================================================
   Build gate — declared slots and copy fidelity
   ------------------------------------------------------------
   Loads the rendered page in a real browser and asserts four things.
   A real DOM rather than a regex over the HTML, because the questions
   here are about TEXT NODES, and "which runs of text does this document
   actually contain" is a parser's answer, not a pattern's.

     1. Every visible run of text in <body> sits in an element carrying
        a data-edit key. The only exceptions are runs explicitly opted
        out with data-no-edit, and they are listed rather than ignored.
     2. Every data-edit key is unique on the page.
     3. Every data-edit element is a TEXT LEAF — one text node and
        nothing else. The editor refuses to mark anything richer,
        because assigning textContent to it would delete its children,
        so a key on a non-leaf is a slot that silently does not work.
     4. Every string in src/data/home.ts is rendered exactly once, as
        the whole text of some slot.

   On (4), "exactly once" means once as a COMPLETE slot value, not once
   as a substring of the page. The approved copy repeats the company's
   legal name inside longer sentences — the hero sub-paragraph and the
   footer's legal line both contain it — so a substring count would
   report three hits for one correctly-rendered string. What the check
   is actually for is catching copy rendered TWICE by mistake, and a
   slot-level count catches that exactly.

   Usage:  node scripts/check-edit-keys.mjs [origin] [path]
   ============================================================ */
import { chromium } from "playwright";
import "dotenv/config";
import { home } from "../src/data/home.ts";

const ORIGIN = process.argv[2] || `http://localhost:${process.env.PORT || 4322}`;
const PAGE = process.argv[3] || "/";

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log("  FAIL  " + msg);
};
const pass = (msg) => console.log("  PASS  " + msg);

/* Every leaf string in the copy object, with its path. `meta` is
   skipped: it renders into <head> and deliberately appears more than
   once there (description, og:description). */
function leaves(node, path = [], out = []) {
  if (typeof node === "string") {
    if (node !== "") out.push({ path: path.join("."), value: node });
    return out;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) leaves(v, [...path, k], out);
  }
  return out;
}

const { meta, ...body } = home;
const copyLeaves = leaves(body);

async function launch() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return await chromium.launch();
  }
}

const browser = await launch();
const page = await (await browser.newContext()).newPage();
await page.goto(ORIGIN + PAGE, { waitUntil: "networkidle" });

const report = await page.evaluate(() => {
  const SKIP =
    " SCRIPT STYLE SVG INPUT TEXTAREA SELECT OPTION IFRAME NOSCRIPT " +
    "CANVAS VIDEO AUDIO IMG BR HR TEMPLATE ";
  const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

  const isLeaf = (el) =>
    el.childNodes.length === 1 &&
    el.firstChild.nodeType === 3 &&
    norm(el.firstChild.nodeValue) !== "";

  /* Every text node that renders. Walked from <body>, skipping the
     editor's own furniture and anything hidden. */
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const uncovered = [];
  const optedOut = [];
  let node;
  while ((node = walker.nextNode())) {
    if (norm(node.nodeValue) === "") continue;
    const p = node.parentElement;
    if (!p) continue;
    if (SKIP.indexOf(" " + p.tagName + " ") !== -1) continue;
    if (p.closest("[data-nt-ui]")) continue;
    if (p.closest("[aria-hidden='true']")) continue;

    if (p.closest("[data-no-edit]")) {
      optedOut.push({ text: norm(node.nodeValue), tag: p.tagName.toLowerCase() });
      continue;
    }
    if (!p.closest("[data-edit]")) {
      uncovered.push({
        text: norm(node.nodeValue).slice(0, 80),
        tag: p.tagName.toLowerCase(),
        cls: (p.getAttribute("class") || "").slice(0, 60),
      });
    }
  }

  const slots = [...document.querySelectorAll("[data-edit]")].map((el) => ({
    key: el.getAttribute("data-edit"),
    tag: el.tagName.toLowerCase(),
    text: norm(el.textContent),
    leaf: isLeaf(el),
  }));

  return { uncovered, optedOut, slots };
});

await browser.close();

/* ---------- 1. coverage ---------- */
if (report.uncovered.length === 0) {
  pass("every rendered text node is inside a data-edit slot");
} else {
  fail(`${report.uncovered.length} text node(s) with no data-edit key:`);
  for (const u of report.uncovered) console.log(`          <${u.tag}> "${u.text}"`);
}
if (report.optedOut.length) {
  console.log(
    `  NOTE  ${report.optedOut.length} run(s) explicitly opted out with data-no-edit: ` +
      report.optedOut.map((o) => `"${o.text}"`).join(", ")
  );
}

/* ---------- 2. uniqueness ---------- */
const seen = new Map();
for (const s of report.slots) seen.set(s.key, (seen.get(s.key) || 0) + 1);
const dupes = [...seen].filter(([, n]) => n > 1);
if (dupes.length === 0) pass(`all ${report.slots.length} data-edit keys are unique`);
else for (const [k, n] of dupes) fail(`key "${k}" appears ${n} times`);

/* ---------- 3. every slot is a text leaf ---------- */
const notLeaf = report.slots.filter((s) => !s.leaf);
if (notLeaf.length === 0) pass("every slot holds exactly one run of text");
else
  for (const s of notLeaf)
    fail(`slot "${s.key}" (<${s.tag}>) is not a text leaf — the editor will skip it`);

/* ---------- 4. every copy string reaches its own slot, once ----------
   Checked key by key rather than by counting text on the page, and the
   difference matters. The approved copy uses the same WORDS in two
   different places on purpose: Home / About / Projects appear in both
   the nav and the footer, and "Civil · Mechanical · Electrical" badges
   both the Matunga Workshop and the Sanpada Carshed. Counting text
   would call all eight of those a duplicate and be wrong every time.

   What must hold is that each string in home.ts reaches the slot whose
   key mirrors its path, and reaches it whole. Rendering something
   twice by mistake still fails, because keys are already unique (check
   2) and a stray second copy of a value would have to come from a slot
   whose own copy value it is not. */
const slotByKey = new Map(report.slots.map((s) => [s.key, s]));
const attrPaths = /\.(href|alt|logoAlt|backdropAlt)$/;
const rendered = copyLeaves.filter((l) => !attrPaths.test(l.path));

let bad = 0;
for (const leaf of rendered) {
  const key = "home." + leaf.path;
  const slot = slotByKey.get(key);
  const wanted = leaf.value.replace(/\s+/g, " ").trim();
  if (!slot) {
    bad++;
    fail(`copy.${leaf.path} has no slot "${key}" on the page`);
  } else if (slot.text !== wanted) {
    bad++;
    fail(`slot "${key}" renders "${slot.text.slice(0, 60)}" but copy says "${wanted.slice(0, 60)}"`);
  }
}
if (!bad) pass(`all ${rendered.length} copy strings render into their own slot, verbatim`);

/* A slot on the page whose key is not in home.ts is a hardcoded string
   or a stale key — both are defects. */
const copyKeys = new Set(rendered.map((l) => "home." + l.path));
const orphans = report.slots.filter((s) => !copyKeys.has(s.key));
if (orphans.length === 0) pass("no slot on the page is missing from home.ts");
else for (const o of orphans) fail(`slot "${o.key}" has no matching string in home.ts`);

/* Informational: distinct slots that legitimately carry the same words. */
const sameWords = new Map();
for (const s of report.slots) {
  if (!sameWords.has(s.text)) sameWords.set(s.text, []);
  sameWords.get(s.text).push(s.key);
}
const shared = [...sameWords.values()].filter((k) => k.length > 1);
if (shared.length) {
  console.log(`  NOTE  ${shared.length} wording(s) appear in more than one slot, by design:`);
  for (const keys of shared) console.log("          " + keys.join("  ==  "));
}

/* ---------- the full key list ---------- */
console.log(`\n--- ${report.slots.length} declared slots on ${PAGE} ---`);
for (const s of report.slots) console.log(`  ${s.key}`.padEnd(52) + `<${s.tag}>`);

console.log(failures ? `\n${failures} FAILURE(S)` : "\nAll slot and copy checks passed.");
process.exit(failures ? 1 : 0);
