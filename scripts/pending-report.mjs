/* ============================================================
   Pending report — what launch mode takes off the public site
   ------------------------------------------------------------
   Launch mode (HIDE_PENDING=1 at build time, src/lib/launch.ts) leaves
   every placeholder nobody has answered off the site. This lists,
   page by page, exactly what that is: each placeholder card, tile and
   row, the section headings and gallery blocks that go with them, and
   any project that goes whole (its tile, its page and its sitemap
   entry). Then the total, set against the open count in PRE-LAUNCH.md.

   It mirrors the renderers' rules, read off the same copy modules
   (scripts/placeholder-modules.mjs, shared with check-placeholders):

     · a placeholder goes unless a saved edit names a slot inside it;
       one that has one is KEPT, drawn exactly as in review, and its
       text belongs in the copy module before launch;
     · a section of nothing but placeholders goes with its kicker and
       heading, unless its header has a saved edit (then all of it is
       kept, as review);
     · a /projects tile that is a placeholder (unconfirmed work) takes
       its whole project off, unless something of Sir's is on the tile
       or the page (a saved edit, an added paragraph, a photograph).

   Usage:
     node scripts/pending-report.mjs
         From the copy modules alone: as if no placeholder had a saved
         edit on it. Needs no server.
     node scripts/pending-report.mjs <origin>
         Also reads each page's saved edits from <origin>/api/content
         (the open read route, read-only), so a placeholder Sir typed
         into is reported as kept. Any running build will do, either
         mode: the database is the same.
     node scripts/pending-report.mjs <origin> --served
         Also checks that <origin> SERVES launch mode as reported: no
         slot of anything reported hidden is on its page, no
         `data-pending` but the kept ones, a hidden project answers 404,
         is not in sitemap.xml and no page links to it, every sitemap
         page answers 200. Run it after building with HIDE_PENDING=1.
   Run it from PowerShell on Windows (Git Bash rewrites "/paths").
   Exit status 1 when a placeholder is one launch mode cannot hide, or
   on any --served failure. Read-only everywhere.
   ============================================================ */
import { readFileSync } from "node:fs";
import { MODULES, pagesOf, pendingItems, launchKind } from "./placeholder-modules.mjs";
import { slugify } from "../src/lib/slug.ts";

const args = process.argv.slice(2);
const SERVED = args.includes("--served");
const ORIGIN = args.find((a) => !a.startsWith("--"))?.replace(/\/+$/, "");
if (SERVED && !ORIGIN) {
  console.error("--served needs an origin: node scripts/pending-report.mjs <origin> --served");
  process.exit(2);
}

/* ------------------------------------------------------------
   Saved edits, per page, from the origin's open read route
   ------------------------------------------------------------ */
const savedCache = new Map();
async function savedKeys(route) {
  if (!ORIGIN) return [];
  if (!savedCache.has(route)) {
    const res = await fetch(`${ORIGIN}/api/content?path=${encodeURIComponent(route)}`);
    /* 503 is the database not answering: then nothing can be said. */
    if (!res.ok) throw new Error(`${ORIGIN}/api/content?path=${route} answered ${res.status}`);
    savedCache.set(route, Object.keys((await res.json()).edits ?? {}).map((k) => k.toLowerCase()));
  }
  return savedCache.get(route);
}
/** A saved edit on the key itself or on any key below it. */
const under = (keys, ...prefixes) =>
  prefixes.some((p) => {
    const q = p.toLowerCase();
    return keys.some((k) => k === q || k.startsWith(q + "."));
  });

/* ------------------------------------------------------------
   Every placeholder, with what launch mode does with it
   ------------------------------------------------------------ */
const rows = []; // { route, title, label, kind, unit, status, why }
const extras = []; // { route, text } — what goes with them
const hiddenUnits = []; // { route, unit } — slot prefixes that must be off the served page
const hiddenProjects = []; // { title, slug, route }

const social = (await import("../src/data/projects.ts")).projects.social;
const socialPagesMod = MODULES.find((m) => m.exportName === "socialPages");
const socialPages = await pagesOf(socialPagesMod);

/** Is the unconfirmed project at tile index `i` kept? Why, or null. */
async function projectKept(i) {
  const title = social.items[i].title;
  const slug = slugify(title);
  if (under(await savedKeys("/projects"), `projects.social.items.${i}`)) return "saved edit on its /projects tile";
  if ((await savedKeys(`/projects/${slug}`)).length) return "saved edit on its page";
  if (ORIGIN) {
    const res = await fetch(`${ORIGIN}/projects/${slug}`);
    const html = res.status === 200 ? await res.text() : "";
    if (html.includes('data-edit="projects.blocks.')) return "a paragraph added to its page";
    const page = socialPages.find((p) => p.route === `/projects/${slug}`);
    if (html && page?.copy.detail.photoNote && !html.includes('data-edit="projects.detail.photoNote.')) return "a photograph on its page";
  }
  return null;
}

/* The unconfirmed projects first: their pages' placeholders go with them. */
const projectRoutes = new Map(); // route -> { kept, why }
for (const [i, item] of social.items.entries()) {
  if (item.retired || !item.pending) continue;
  const why = await projectKept(i);
  projectRoutes.set(`/projects/${slugify(item.title)}`, { kept: !!why, why, title: item.title });
}

for (const row of MODULES) {
  for (const page of await pagesOf(row)) {
    const keys = await savedKeys(page.route);
    const found = [...pendingItems(page.copy)];
    const project = projectRoutes.get(page.route);

    /* Sections of nothing but placeholders (InfoSections.astro). */
    const sectionOf = new Map(); // section index -> found rows in it
    for (const f of found) {
      const m = f.path.join(".").match(/^sections\.(\d+)\.items\.\d+$/);
      if (m && launchKind(row.exportName, f.path) === "card") {
        sectionOf.set(+m[1], [...(sectionOf.get(+m[1]) ?? []), f]);
      }
    }
    const sectionVerdict = new Map(); // s -> "gone" | "kept"
    for (const [s, list] of sectionOf) {
      const section = page.copy.sections[s];
      const live = section.items.filter((it) => !it.retired);
      const unanswered = list.filter((f) => !under(keys, `${row.prefix}.${f.path.join(".")}`));
      if (unanswered.length !== live.length) continue;
      const header = ["kicker", "heading", "intro"].map((x) => `${row.prefix}.sections.${s}.${x}`);
      if (under(keys, ...header)) {
        sectionVerdict.set(s, "kept");
      } else {
        sectionVerdict.set(s, "gone");
        extras.push({ route: page.route, text: `the section "${section.kicker}": "${section.heading}", its kicker and heading go with its cards (${row.prefix}.sections.${s})` });
        hiddenUnits.push(...header.map((unit) => ({ route: page.route, unit })));
      }
    }

    let factsGone = 0;
    for (const { path, item } of found) {
      const kind = launchKind(row.exportName, path);
      const slot = `${row.prefix}.${path.join(".")}`;
      const base = { route: page.route, title: item.title, label: item.pending, kind: kind ?? "not handled", unit: slot };
      if (!kind) {
        rows.push({ ...base, status: "NOT HIDDEN", why: "no launch-mode renderer for this item" });
        continue;
      }
      if (project) {
        rows.push({ ...base, status: project.kept ? "kept" : "hidden", why: project.kept ? `the project is kept: ${project.why}` : "with its page" });
        continue;
      }
      if (kind === "project") {
        const p = projectRoutes.get(`/projects/${slugify(item.title)}`);
        rows.push({ ...base, status: p.kept ? "kept" : "hidden", why: p.kept ? p.why : "the project goes: tile, page and sitemap entry" });
        if (!p.kept) {
          hiddenUnits.push({ route: page.route, unit: slot });
          hiddenProjects.push({ title: item.title, slug: slugify(item.title), route: `/projects/${slugify(item.title)}` });
        }
        continue;
      }
      const s = path[0] === "sections" ? +path[1] : -1;
      if (sectionVerdict.get(s) === "kept") {
        rows.push({ ...base, status: "kept", why: "its section's header has a saved edit" });
        continue;
      }
      /* The unit a saved edit keeps: the item, or for a drill card only its badge,
         or for the photograph card the gallery block with its kicker. */
      const unit =
        kind === "drill card's missing fact"
          ? [`${slot}.pending`]
          : kind === "photograph card"
            ? [slot, `${row.prefix}.detail.galleryKicker`]
            : [slot];
      if (under(keys, ...unit)) {
        rows.push({ ...base, status: "kept", why: "saved edit on it" });
        continue;
      }
      rows.push({ ...base, status: "hidden", why: kind === "drill card's missing fact" ? "the badge only; the card stays" : "" });
      hiddenUnits.push(...unit.map((u) => ({ route: page.route, unit: u })));
      if (kind === "photograph card") extras.push({ route: page.route, text: "the gallery block goes with it, its kicker included" });
      if (kind === "hero tile") factsGone++;
    }
    const tiles = page.copy.detail?.facts ?? page.copy.rmc?.stats ?? page.copy.plant?.stats;
    if (tiles && factsGone === tiles.length) extras.push({ route: page.route, text: "no figure tile is left: the hero has none" });
    if (project && !project.kept) extras.push({ route: page.route, text: "the whole page: its address answers the site's 404, and it leaves the sitemap" });
  }
}

/* ------------------------------------------------------------
   The report
   ------------------------------------------------------------ */
const routes = [...new Set([...rows.map((r) => r.route), ...extras.map((e) => e.route)])];
console.log(
  `Launch mode (HIDE_PENDING=1): what it takes off the public site` +
    (ORIGIN ? `, with the saved edits on ${ORIGIN}` : ", from the copy modules (no saved edits read)") +
    "\n"
);
for (const route of routes) {
  console.log(route);
  for (const r of rows.filter((x) => x.route === route)) {
    const why = r.why ? `  (${r.why})` : "";
    console.log(`  ${r.status.padEnd(10)} ${r.kind.padEnd(26)} ${r.title} [${r.label}]  ${r.unit}${why}`);
  }
  for (const e of extras.filter((x) => x.route === route)) console.log(`  ${"with it".padEnd(10)} ${e.text}`);
  console.log("");
}

const hidden = rows.filter((r) => r.status === "hidden");
const kept = rows.filter((r) => r.status === "kept");
const loose = rows.filter((r) => r.status === "NOT HIDDEN");
const pages = new Set(hidden.map((r) => r.route)).size;
console.log(
  `Total: ${rows.length} placeholders. Launch mode leaves ${hidden.length} off the site, on ${pages} pages; ` +
    `keeps ${kept.length} for a saved edit; cannot hide ${loose.length}.`
);
if (hiddenProjects.length) console.log(`Projects that go whole: ${hiddenProjects.map((p) => p.title).join(", ")}.`);

/* PRE-LAUNCH.md's own count, "**N placeholders on the site**". */
const doc = readFileSync(new URL("../PRE-LAUNCH.md", import.meta.url), "utf8");
const listed = Number(doc.match(/\*\*(\d+) placeholders on the site\*\*/)?.[1]);
if (!Number.isFinite(listed)) console.log("PRE-LAUNCH.md: no open placeholder count found.");
else if (listed === rows.length) console.log(`PRE-LAUNCH.md lists ${listed} open placeholders: the same.`);
else console.log(`PRE-LAUNCH.md lists ${listed} open placeholders: ${rows.length - listed > 0 ? "+" : ""}${rows.length - listed} against the copy modules.`);

let failures = loose.length;

/* ------------------------------------------------------------
   --served: the origin serves exactly that
   ------------------------------------------------------------ */
if (SERVED) {
  console.log(`\nChecking ${ORIGIN} serves launch mode:`);
  const fail = (msg) => {
    failures++;
    console.log(`  FAIL  ${msg}`);
  };
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const html = new Map();
  for (const p of new Set([...paths, ...routes.filter((r) => r !== "/404")])) {
    const res = await fetch(ORIGIN + p, { redirect: "manual" });
    html.set(p, { status: res.status, body: await res.text() });
  }
  for (const p of paths) if (html.get(p).status !== 200) fail(`${p} is in the sitemap but answers ${html.get(p).status}`);
  for (const pr of hiddenProjects) {
    if (html.get(pr.route)?.status !== 404) fail(`${pr.route} answers ${html.get(pr.route)?.status}, not 404`);
    if (paths.includes(pr.route)) fail(`${pr.route} is in the sitemap`);
    for (const [p, { body }] of html) if (body.includes(`href="${pr.route}"`)) fail(`${p} links to ${pr.route}`);
  }
  for (const { route, unit } of hiddenUnits) {
    const page = html.get(route);
    if (page?.status === 200 && new RegExp(`data-edit="${esc(unit)}(\\.[^"]*)?"`, "i").test(page.body)) fail(`${route}: ${unit} is on the page`);
  }
  for (const [p, { status, body }] of html) {
    if (status !== 200) continue;
    const marked = (body.match(/\sdata-pending(=""|\s|>)/g) ?? []).length;
    const allowed = kept.filter((r) => r.route === p).length;
    if (marked > allowed) fail(`${p}: ${marked} data-pending element${marked === 1 ? "" : "s"}, ${allowed} kept`);
  }
  if (failures === loose.length) console.log(`  PASS  ${html.size} pages read: nothing reported hidden is served`);
}

process.exit(failures ? 1 : 0);
