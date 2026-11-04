/* ============================================================
   What launch mode takes off the site, worked out from the copy
   ------------------------------------------------------------
   One reading of the launch rules (src/lib/launch.ts), used by two
   callers so they can never disagree:

     · scripts/pending-report.mjs, from the command line;
     · /studio/launch, for the counts in the switch's confirm dialog
       (src/lib/launch-summary.ts).

   It mirrors the renderers, read off the same copy modules:

     · a placeholder goes unless a saved edit names a slot inside it;
       one that has one is KEPT, drawn exactly as in review, and its
       text belongs in the copy module before launch;
     · a section of nothing but placeholders goes with its kicker and
       heading, unless its header has a saved edit (then all of it is
       kept, as review);
     · a /projects tile that is a placeholder (unconfirmed work) takes
       its whole project off, unless something of Sir's is on the tile
       or the page (a saved edit, an added paragraph, a photograph).

   PURE: no database and no Astro, so plain Node can load it. The caller
   hands in where saved edits and the copy come from.

   MODULES, launchKind and pendingItems are shared with
   scripts/check-placeholders.mjs through scripts/placeholder-modules.mjs.
   ============================================================ */
import { slugify } from "./slug.ts";

/* One row per copy export, with the route it renders on — stated, not
   derived from the export name, because the two differ as soon as a
   page lives under another (`plant` → /resources/vindhane-plant). Keep
   in step with PAGES in check-edit-keys.mjs. `prefix` is the first
   segment of the page's edit keys (DESIGN-SYSTEM §9), the same as
   PAGES there: an item at copy path `a.b.2` has the slot keys
   `<prefix>.a.b.2.*`. `file` is relative to scripts/. */
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
] as const;

export type ModuleRow = (typeof MODULES)[number];

/* What launch mode (src/lib/launch.ts) does with a placeholder at `path`
   in the copy of export `exportName`: the kind of unit that renderer
   leaves out, or null where no renderer of launch mode knows the item,
   which then would still show. Mirrors the renderers, so keep it in step
   with them. */
const INFO_PAGES = new Set(["capabilities", "resources", "hse", "clients", "contact", "csr", "company", "careers"]);
export function launchKind(exportName: string, path: string[]): string | null {
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
export function* pendingItems(value: any, path: string[] = []): Generator<{ path: string[]; item: any }> {
  if (!value || typeof value !== "object") return;
  if (value.retired === true) return;
  if (typeof value.pending === "string") yield { path, item: value };
  for (const [k, v] of Object.entries(value)) yield* pendingItems(v, [...path, k]);
}

/** A saved edit on the key itself or on any key below it. */
const under = (keys: readonly string[], ...prefixes: string[]) =>
  prefixes.some((p) => {
    const q = p.toLowerCase();
    return keys.some((k) => k === q || k.startsWith(q + "."));
  });

export interface ReportPage {
  readonly route: string;
  readonly copy: any;
}

export interface ReportInput {
  /** Every page a copy export renders on. */
  pagesOf(row: ModuleRow): ReportPage[] | Promise<ReportPage[]>;
  /** `projects.social` from src/data/projects.ts. */
  social: { items: readonly any[] };
  /** The page's saved edit keys, lower case. */
  savedKeys(route: string): Promise<string[]>;
  /** Why the unconfirmed project at tile `i` stays, or null. */
  projectKept(i: number): Promise<string | null>;
}

export interface ReportRow {
  route: string;
  title: string;
  label: string;
  kind: string;
  unit: string;
  status: "hidden" | "kept" | "NOT HIDDEN";
  why: string;
}

export interface LaunchReport {
  rows: ReportRow[];
  /** What goes with the placeholders, as a line of text. */
  extras: { route: string; text: string }[];
  /** Slot prefixes that must be off the served page. */
  hiddenUnits: { route: string; unit: string }[];
  /** Sections that go with their heading. */
  hiddenSections: { route: string; kicker: string; heading: string }[];
  /** Projects that go whole: tile, page and sitemap entry. */
  hiddenProjects: { title: string; slug: string; route: string }[];
}

export async function buildLaunchReport({ pagesOf, social, savedKeys, projectKept }: ReportInput): Promise<LaunchReport> {
  const rows: ReportRow[] = [];
  const extras: LaunchReport["extras"] = [];
  const hiddenUnits: LaunchReport["hiddenUnits"] = [];
  const hiddenSections: LaunchReport["hiddenSections"] = [];
  const hiddenProjects: LaunchReport["hiddenProjects"] = [];

  /* The unconfirmed projects first: their pages' placeholders go with them. */
  const projectRoutes = new Map<string, { kept: boolean; why: string | null; title: string }>();
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
      const sectionOf = new Map<number, typeof found>(); // section index -> found rows in it
      for (const f of found) {
        const m = f.path.join(".").match(/^sections\.(\d+)\.items\.\d+$/);
        if (m && launchKind(row.exportName, f.path) === "card") {
          sectionOf.set(+m[1], [...(sectionOf.get(+m[1]) ?? []), f]);
        }
      }
      const sectionVerdict = new Map<number, "gone" | "kept">();
      for (const [s, list] of sectionOf) {
        const section = page.copy.sections[s];
        const live = section.items.filter((it: any) => !it.retired);
        const unanswered = list.filter((f) => !under(keys, `${row.prefix}.${f.path.join(".")}`));
        if (unanswered.length !== live.length) continue;
        const header = ["kicker", "heading", "intro"].map((x) => `${row.prefix}.sections.${s}.${x}`);
        if (under(keys, ...header)) {
          sectionVerdict.set(s, "kept");
        } else {
          sectionVerdict.set(s, "gone");
          extras.push({ route: page.route, text: `the section "${section.kicker}": "${section.heading}", its kicker and heading go with its cards (${row.prefix}.sections.${s})` });
          hiddenSections.push({ route: page.route, kicker: section.kicker, heading: section.heading });
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
          const p = projectRoutes.get(`/projects/${slugify(item.title)}`)!;
          rows.push({ ...base, status: p.kept ? "kept" : "hidden", why: p.kept ? p.why! : "the project goes: tile, page and sitemap entry" });
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
  return { rows, extras, hiddenUnits, hiddenSections, hiddenProjects };
}
