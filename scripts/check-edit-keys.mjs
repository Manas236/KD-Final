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
     4. Every string in the page's copy module is rendered exactly once,
        as the whole text of some slot.

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

const ORIGIN = process.argv[2] || `http://localhost:${process.env.PORT || 4322}`;
const PAGE = process.argv[3] || "/";

/* ------------------------------------------------------------
   Which copy module answers for which route
   ------------------------------------------------------------
   Hardcoded rather than derived, the same way KNOWN_PATHS is in
   src/lib/editable.ts, and for the same reason: the check is only worth
   anything if the page it loads and the object it compares against were
   named together. `prefix` is the first segment of every slot key on
   that page, which by the naming rule in DESIGN-SYSTEM §9 is the page.

   Add a route here when you add one to src/pages, and remember that the
   shared chrome (Nav, SiteFooter) renders under the page's own prefix —
   which is why each page's copy module re-exports home.ts's `nav` and
   `footer` rather than the components hardcoding "home.".
   ------------------------------------------------------------ */
const PAGES = {
  "/": { module: "../src/data/home.ts", exportName: "home", prefix: "home" },
  "/about": { module: "../src/data/about.ts", exportName: "about", prefix: "about" },
  "/projects": { module: "../src/data/projects.ts", exportName: "projects", prefix: "projects" },
  "/capabilities": { module: "../src/data/pages.ts", exportName: "capabilities", prefix: "capabilities" },
  "/resources": { module: "../src/data/pages.ts", exportName: "resources", prefix: "resources" },
  "/hse": { module: "../src/data/pages.ts", exportName: "hse", prefix: "hse" },
  "/clients": { module: "../src/data/pages.ts", exportName: "clients", prefix: "clients" },
  "/contact": { module: "../src/data/pages.ts", exportName: "contact", prefix: "contact" },
  "/csr": { module: "../src/data/pages.ts", exportName: "csr", prefix: "csr" },
  /* `runtime`: the job-posting cards come from the database, not the
     module (src/pages/careers.astro), so keys and copy under these
     paths are neither required on the page nor orphans when present. */
  "/careers": {
    module: "../src/data/pages.ts",
    exportName: "careers",
    prefix: "careers",
    runtime: ["jobs.", "openings.", "form.general", "form.sending"],
  },
  /* A child of /resources: Nav and SiteFooter render there under the
     `resources` prefix, and the page's own keys are `resources.plant.*`
     — see the note at the top of src/data/plant.ts. */
  "/resources/vindhane-plant": { module: "../src/data/plant.ts", exportName: "plant", prefix: "resources" },
  "/resources/rmc-plant-karjat": { module: "../src/data/rmc-plant.ts", exportName: "rmcPlant", prefix: "resources" },
  "/gallery": { module: "../src/data/gallery-page.ts", exportName: "galleryPage", prefix: "gallery" },
  /* The 404 page. Loaded at its own address for the check; on the site
     it renders for any address that is not a page (src/pages/404.astro). */
  "/404": { module: "../src/data/not-found.ts", exportName: "notFound", prefix: "not-found" },
};

/* The "Beyond the railway" project pages — one route per tile on
   /projects, all from one module (OPEN-QUESTIONS.md #36). Its export is
   keyed by slug, each value one page's whole copy, so `pick` names the
   page. Enumerated from the module rather than listed, because the
   module itself refuses to build without a page for every tile. The
   railway project pages are still not here — see the note in
   src/components/projects/ProjectDetailPage.astro. */
const SOCIAL = "../src/data/social-projects.ts";
for (const slug of Object.keys((await import(SOCIAL)).socialPages)) {
  /* `blocks.`: headings and paragraphs an editor added in edit mode —
     database rows (src/lib/project-blocks.ts), not module copy. */
  PAGES[`/projects/${slug}`] = { module: SOCIAL, exportName: "socialPages", pick: slug, prefix: "projects", runtime: ["blocks."] };
}

const route = PAGES[PAGE.replace(/(.)\/+$/, "$1")];
if (!route) {
  console.log(
    `  FAIL  no copy module registered for "${PAGE}" — known: ${Object.keys(PAGES).join(", ")}`
  );
  process.exit(1);
}

const exported = (await import(route.module))[route.exportName];
const copy = route.pick ? exported[route.pick] : exported;

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

const { meta, ...body } = copy;
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
/* `file` names a gallery image (src/data/gallery.ts), `logo` a client
   mark (src/data/pages.ts) and `id` a section's element id
   (InfoPage.astro) — an attribute's source, like `alt`, never a run of
   text. `video` names a clip in public/video/ and `tone` a band surface
   (both /hse, src/components/hse/Record.astro). `parent` is the href a
   nav link drops down from (home.ts nav.links). `embed` and `embedTitle`
   are /contact's map iframe src and title (pages.ts contact.map). */
const attrPaths = /\.(href|alt|logoAlt|backdropAlt|file|logo|id|video|tone|parent|embed|embedTitle)$/;
const runtime = route.runtime ?? [];
/* Gallery captions are runtime data on every page since 3 Oct 2026:
   one caption per photograph, edited in /studio/gallery and replayed
   over gallery.ts when a page renders (src/lib/gallery-live.ts). They
   carry no data-edit slot, so a caption in the copy object is neither
   required on the page nor an orphan. See GalleryGrid.astro. */
const galleryCaption = /(?:^|\.)(?:photos|gallery)\.\d+\.caption$/;
const isRuntime = (path) => runtime.some((r) => path.startsWith(r)) || galleryCaption.test(path);
const rendered = copyLeaves.filter((l) => !attrPaths.test(l.path) && !isRuntime(l.path));

let bad = 0;
for (const leaf of rendered) {
  const key = route.prefix + "." + leaf.path;
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
const copyKeys = new Set(rendered.map((l) => route.prefix + "." + l.path));
const orphans = report.slots.filter(
  (s) => !copyKeys.has(s.key) && !isRuntime(s.key.slice(route.prefix.length + 1))
);
if (orphans.length === 0)
  pass(`no slot on the page is missing from ${route.module.replace("../", "")}`);
else for (const o of orphans)
  fail(`slot "${o.key}" has no matching string in ${route.module.replace("../", "")}`);

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
