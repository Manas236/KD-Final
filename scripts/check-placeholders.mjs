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

   Usage:  node scripts/check-placeholders.mjs
   ============================================================ */

/* One row per copy export, with the route it renders on — stated, not
   derived from the export name, because the two differ as soon as a
   page lives under another (`plant` → /resources/vindhane-plant). Keep
   in step with PAGES in check-edit-keys.mjs. */
const MODULES = [
  { file: "../src/data/home.ts", exportName: "home", route: "/" },
  { file: "../src/data/about.ts", exportName: "about", route: "/about" },
  { file: "../src/data/projects.ts", exportName: "projects", route: "/projects" },
  { file: "../src/data/pages.ts", exportName: "capabilities", route: "/capabilities" },
  { file: "../src/data/pages.ts", exportName: "resources", route: "/resources" },
  { file: "../src/data/pages.ts", exportName: "hse", route: "/hse" },
  { file: "../src/data/pages.ts", exportName: "clients", route: "/clients" },
  { file: "../src/data/pages.ts", exportName: "contact", route: "/contact" },
  { file: "../src/data/pages.ts", exportName: "csr", route: "/csr" },
  { file: "../src/data/pages.ts", exportName: "careers", route: "/careers" },
  { file: "../src/data/plant.ts", exportName: "plant", route: "/resources/vindhane-plant" },
  { file: "../src/data/rmc-plant.ts", exportName: "rmcPlant", route: "/resources/rmc-plant-karjat" },
  { file: "../src/data/gallery-page.ts", exportName: "galleryPage", route: "/gallery" },
  { file: "../src/data/legal.ts", exportName: "privacy", route: "/privacy" },
  { file: "../src/data/legal.ts", exportName: "terms", route: "/terms" },
  { file: "../src/data/not-found.ts", exportName: "notFound", route: "/404" },
  /* Keyed by slug, one page per key — `each` gives every page its own
     route, /projects/<slug>, instead of one route for the export. */
  { file: "../src/data/social-projects.ts", exportName: "socialPages", route: "/projects", each: true },
];

/* Walk any object; yield every object that carries a `pending` field,
   with the path that reached it. */
function* pendingItems(value, path = []) {
  if (!value || typeof value !== "object") return;
  if (typeof value.pending === "string") yield { path, item: value };
  for (const [k, v] of Object.entries(value)) yield* pendingItems(v, [...path, k]);
}

const found = [];
for (const { file, exportName, route, each } of MODULES) {
  const mod = await import(file);
  const pages = each
    ? Object.entries(mod[exportName]).map(([k, v]) => ({ route: `${route}/${k}`, base: [exportName, k], copy: v }))
    : [{ route, base: [exportName], copy: mod[exportName] }];
  for (const page of pages) {
    for (const { path, item } of pendingItems(page.copy)) {
      found.push({ route: page.route, key: [...page.base, ...path].join("."), title: item.title, label: item.pending });
    }
  }
}

if (found.length === 0) {
  console.log("  PASS  no placeholders — nothing on the site is marked pending");
  process.exit(0);
}

console.log(`  FAIL  ${found.length} placeholder${found.length === 1 ? "" : "s"} still on the site — fill or remove each before go-live (PRE-LAUNCH.md):\n`);
for (const f of found) {
  console.log(`        ${f.route}  ·  ${f.title}  ·  [${f.label}]  ·  ${f.key}`);
}
process.exit(1);
