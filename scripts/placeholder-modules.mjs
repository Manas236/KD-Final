/* ============================================================
   The copy exports that can carry a placeholder, and where they render
   ------------------------------------------------------------
   Shared by scripts/check-placeholders.mjs (the go-live gate) and
   scripts/pending-report.mjs (what launch mode takes off), so the two
   always read the same pages.

   One row per copy export, with the route it renders on — stated, not
   derived from the export name, because the two differ as soon as a
   page lives under another (`plant` → /resources/vindhane-plant). Keep
   in step with PAGES in check-edit-keys.mjs. `prefix` is the first
   segment of the page's edit keys (DESIGN-SYSTEM §9), the same as
   PAGES there: an item at copy path `a.b.2` has the slot keys
   `<prefix>.a.b.2.*`. `file` is relative to this folder.
   ============================================================ */
export const MODULES = [
  { file: "../src/data/home.ts", exportName: "home", route: "/", prefix: "home" },
  { file: "../src/data/about.ts", exportName: "about", route: "/about", prefix: "about" },
  { file: "../src/data/projects.ts", exportName: "projects", route: "/projects", prefix: "projects" },
  /* Sections of /about since 21 Oct 2026 (aboutSections in pages.ts). */
  { file: "../src/data/pages.ts", exportName: "capabilities", route: "/about", prefix: "capabilities" },
  { file: "../src/data/pages.ts", exportName: "resources", route: "/about", prefix: "resources" },
  { file: "../src/data/pages.ts", exportName: "hse", route: "/hse", prefix: "hse" },
  { file: "../src/data/pages.ts", exportName: "clients", route: "/about", prefix: "clients" },
  { file: "../src/data/pages.ts", exportName: "contact", route: "/contact", prefix: "contact" },
  { file: "../src/data/pages.ts", exportName: "csr", route: "/about", prefix: "csr" },
  { file: "../src/data/pages.ts", exportName: "company", route: "/about", prefix: "company" },
  { file: "../src/data/pages.ts", exportName: "careers", route: "/careers", prefix: "careers" },
  { file: "../src/data/plant.ts", exportName: "plant", route: "/resources/vindhane-plant", prefix: "resources" },
  { file: "../src/data/rmc-plant.ts", exportName: "rmcPlant", route: "/resources/rmc-plant-karjat", prefix: "resources" },
  { file: "../src/data/gallery-page.ts", exportName: "galleryPage", route: "/gallery", prefix: "gallery" },
  { file: "../src/data/legal.ts", exportName: "privacy", route: "/privacy", prefix: "privacy" },
  { file: "../src/data/legal.ts", exportName: "terms", route: "/terms", prefix: "terms" },
  { file: "../src/data/not-found.ts", exportName: "notFound", route: "/404", prefix: "not-found" },
  /* Keyed by slug, one page per key — `each` gives every page its own
     route, /projects/<slug>, instead of one route for the export. */
  { file: "../src/data/social-projects.ts", exportName: "socialPages", route: "/projects", prefix: "projects", each: true },
];

/** Every page a row stands for: its route, the copy it renders, and
    the base of check-placeholders.mjs' printed key. */
export async function pagesOf({ file, exportName, route, each }) {
  const mod = await import(file);
  return each
    ? Object.entries(mod[exportName]).map(([k, v]) => ({ route: `${route}/${k}`, base: [exportName, k], copy: v }))
    : [{ route, base: [exportName], copy: mod[exportName] }];
}

/* What launch mode (HIDE_PENDING=1, src/lib/launch.ts) does with a
   placeholder at `path` in the copy of export `exportName`: the kind of
   unit that renderer leaves out, or null where no renderer of launch
   mode knows the item, which then would still show. Mirrors the
   renderers, so keep it in step with them. */
const INFO_PAGES = new Set(["capabilities", "resources", "hse", "clients", "contact", "csr", "company", "careers"]);
export function launchKind(exportName, path) {
  const p = path.join(".");
  if (INFO_PAGES.has(exportName) && /^sections\.\d+\.items\.\d+$/.test(p)) return "card";
  if (exportName === "hse" && /^record\.bands\.\d+\.cards\.\d+$/.test(p)) return "drill card's missing fact";
  if (exportName === "hse" && /^record\.bands\.\d+\.media\.\d+$/.test(p)) return "tile";
  if (exportName === "projects" && /^social\.items\.\d+$/.test(p)) return "project";
  if (exportName === "socialPages" && /^detail\.facts\.\d+$/.test(p)) return "hero tile";
  if (exportName === "socialPages" && /^detail\.notes\.\d+$/.test(p)) return "card";
  if (exportName === "socialPages" && p === "detail.photoNote") return "photograph card";
  if (exportName === "plant" && /^plant\.stats\.\d+$/.test(p)) return "hero tile";
  if (exportName === "plant" && /^plant\.(products|machinery)\.items\.\d+$/.test(p)) return "list row";
  if (exportName === "rmcPlant" && /^rmc\.stats\.\d+$/.test(p)) return "hero tile";
  if (exportName === "rmcPlant" && /^rmc\.(supplies|equipment)\.items\.\d+$/.test(p)) return "list row";
  return null;
}

/* Walk any object; yield every object that carries a `pending` field,
   with the path that reached it. A `retired` object renders nowhere
   (its slot is only kept so later indexes do not move), so nothing in it
   is on the site. */
export function* pendingItems(value, path = []) {
  if (!value || typeof value !== "object") return;
  if (value.retired === true) return;
  if (typeof value.pending === "string") yield { path, item: value };
  for (const [k, v] of Object.entries(value)) yield* pendingItems(v, [...path, k]);
}
