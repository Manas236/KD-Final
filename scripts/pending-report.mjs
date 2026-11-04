/* ============================================================
   Pending report — what launch mode takes off the public site
   ------------------------------------------------------------
   Launch mode (the switch on /studio/launch, or HIDE_PENDING=1 at build
   time; src/lib/launch.ts) leaves every placeholder nobody has answered
   off the site. This lists, page by page, exactly what that is: each
   placeholder card, tile and row, the section headings and gallery blocks
   that go with them, and any project that goes whole (its tile, its page
   and its sitemap entry). Then the total, set against the open count in
   PRE-LAUNCH.md. The rules are src/lib/launch-report.ts, which the switch's
   confirm dialog reads too.

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
         page answers 200. Run it with the switch on, or after building
         with HIDE_PENDING=1.
   Run it from PowerShell on Windows (Git Bash rewrites "/paths").
   Exit status 1 when a placeholder is one launch mode cannot hide, or
   on any --served failure. Read-only everywhere.
   ============================================================ */
import { readFileSync } from "node:fs";
import { pagesOf } from "./placeholder-modules.mjs";
import { buildLaunchReport } from "../src/lib/launch-report.ts";
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

/* ------------------------------------------------------------
   Every placeholder, with what launch mode does with it
   ------------------------------------------------------------ */
const social = (await import("../src/data/projects.ts")).projects.social;
const socialPages = await pagesOf({ file: "../src/data/social-projects.ts", exportName: "socialPages", route: "/projects", each: true });

/** Is the unconfirmed project at tile index `i` kept? Why, or null. */
async function projectKept(i) {
  const title = social.items[i].title;
  const slug = slugify(title);
  const under = (keys, prefix) => keys.some((k) => k === prefix || k.startsWith(prefix + "."));
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

const { rows, extras, hiddenUnits, hiddenProjects } = await buildLaunchReport({ pagesOf, social, savedKeys, projectKept });

/* ------------------------------------------------------------
   The report
   ------------------------------------------------------------ */
const routes = [...new Set([...rows.map((r) => r.route), ...extras.map((e) => e.route)])];
console.log(
  `Launch mode: what it takes off the public site` +
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
