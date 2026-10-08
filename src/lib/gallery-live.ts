/* ============================================================
   The live gallery — src/data/gallery.ts with the studio's changes
   ------------------------------------------------------------
   gallery.ts is the BASELINE: the photographs, groups, order and
   captions the code ships with. The studio gallery manager
   (/studio/gallery) never edits that file. It appends rows to
   gallery_events (db/schema.sql) and every page that shows a
   photograph replays those rows over the baseline when it renders.

   Why replay instead of storing "the current gallery": the table is
   append-only, the same as content_edits and job_posting_events, so
   nothing a signed-in editor does can destroy anything. Any change can
   be undone (an `undo` row), and an undo can itself be undone.

   IF THE DATABASE CANNOT BE READ, the pages show the baseline. That is
   the same trade /careers makes: a slightly stale gallery beats a
   broken page.

   Server-only: imports the database pool.
   ============================================================ */
import type { RowDataPacket } from "mysql2";
import pool from "./db";
import { cleanText } from "./editable";
import {
  galleryParts,
  hseGalleries,
  plantGalleries,
  projectGalleries,
  railwayGalleries,
  socialGalleries,
  type GalleryPart,
  type GalleryPhoto,
  type ProjectGallery,
} from "../data/gallery";
import { galleryLibrary } from "../data/gallery-library";
import { projectDetails } from "../data/project-detail";
import { socialPages } from "../data/social-projects";

export type Section = "railway" | "social" | "plant" | "hse";

export interface GalleryEvent {
  readonly id: number;
  readonly action: "hide" | "show" | "move" | "caption" | "undo" | "add";
  readonly file: string | null;
  readonly target_group: string | null;
  readonly position: number | null;
  readonly caption: string | null;
  readonly ref_id: number | null;
  readonly created_at?: string;
}

/* ------------------------------------------------------------
   The groups a photograph may live in
   ------------------------------------------------------------
   Every baseline group, plus every project that has a page on the
   site but no photographs yet (Matunga LHB, Solapur, the Kharghar
   pages...). Moving a photograph into one of those creates its group,
   appended at the end of its section so no existing group's position
   (and so no stored heading edit) moves.
   ------------------------------------------------------------ */
export interface GroupInfo {
  readonly project: string;
  readonly section: Section;
  readonly href?: string;
}

/* A split project's parts (gallery.ts, galleryParts) are listed right
   after it, in its section — see "Split projects" below. */
const splitParts = new Map<string, ProjectGallery[]>();
for (const g of galleryParts) {
  if (!g.parent) continue;
  if (!splitParts.has(g.parent)) splitParts.set(g.parent, []);
  splitParts.get(g.parent)!.push(g);
}

function withParts(list: readonly ProjectGallery[], section: Section): GroupInfo[] {
  return list.flatMap((g) => [
    { project: g.project, section, href: g.href },
    ...(splitParts.get(g.project) ?? []).map((p) => ({ project: p.project, section })),
  ]);
}

const baselineGroups: readonly GroupInfo[] = [
  ...withParts(railwayGalleries, "railway"),
  ...withParts(socialGalleries, "social"),
  ...withParts(plantGalleries, "plant"),
  ...withParts(hseGalleries, "hse"),
];
const baselineNames = new Set(baselineGroups.map((g) => g.project));

const extraGroups: readonly GroupInfo[] = [
  ...projectDetails
    .filter((p) => !baselineNames.has(p.title))
    .map((p) => ({ project: p.title, section: "railway" as const })),
  ...Object.values(socialPages)
    .map((p) => p.detail.title)
    .filter((t) => !baselineNames.has(t))
    .map((t) => ({ project: t, section: "social" as const })),
];

/** Every group, baseline first, in site order. */
export const allGroups: readonly GroupInfo[] = [...baselineGroups, ...extraGroups];
const groupByName = new Map(allGroups.map((g) => [g.project, g]));

/* ------------------------------------------------------------
   Split projects
   ------------------------------------------------------------
   A project whose gallery is divided into parts (Matunga Workshop:
   civil, mechanical, electrical — gallery.ts) keeps its own group, but
   EMPTY: every photograph lives in one of the parts. So the parent is
   not somewhere a photograph can be put — isGroup() refuses it, and the
   manager never lists it — and an older event that put a photograph
   there (a reorder, a move or an upload made before the split) is
   replayed into the part instead: the part the photograph is in on the
   baseline, or the first part for one that never was.
   ------------------------------------------------------------ */

export function isSplitParent(name: string): boolean {
  return splitParts.has(name);
}

export function isGroup(name: unknown): name is string {
  return typeof name === "string" && groupByName.has(name) && !splitParts.has(name);
}

/* Every photograph the manager knows: the baseline plus the library.
   A file not in here cannot be shown, moved or captioned. */
const baselinePhotos: { file: string; caption: string; project: string }[] = [];
for (const g of [...railwayGalleries, ...socialGalleries, ...plantGalleries, ...hseGalleries, ...galleryParts]) {
  for (const p of g.photos) baselinePhotos.push({ file: p.file, caption: p.caption, project: g.project });
}
const knownFiles = new Set([...baselinePhotos.map((p) => p.file), ...galleryLibrary.map((p) => p.file)]);

export function isKnownFile(file: unknown): file is string {
  return typeof file === "string" && knownFiles.has(file);
}

/* ------------------------------------------------------------
   Replay
   ------------------------------------------------------------ */
export interface LivePhoto extends GalleryPhoto {
  readonly hidden: boolean;
  /** In src/data/gallery-library.ts rather than gallery.ts. */
  readonly library: boolean;
  /** Uploaded in the studio: its files are in MEDIA_DIR, not src/assets. */
  readonly upload: boolean;
  /** The caption the code ships with, before any studio edit. */
  readonly baseCaption: string;
}

export interface LiveState {
  /** Every group with every photo, hidden ones included, in order. */
  readonly groups: ReadonlyMap<string, readonly LivePhoto[]>;
  /** False when the events could not be read: this is the baseline. */
  readonly fromDatabase: boolean;
}

/** Which events count, after undo rows have been applied. An undo
    toggles its target, so undoing an undo puts the change back. */
export function effectiveEvents(events: readonly GalleryEvent[]): GalleryEvent[] {
  const cancelled = new Set<number>();
  // Walk backwards: the latest undo decides. An undo that is itself
  // cancelled by a later undo does not cancel its target.
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e.action !== "undo" || e.ref_id == null) continue;
    if (cancelled.has(e.id)) continue;
    cancelled.add(e.ref_id);
  }
  return events.filter((e) => e.action !== "undo" && !cancelled.has(e.id));
}

export function replay(events: readonly GalleryEvent[], fromDatabase = true): LiveState {
  const order = new Map<string, string[]>();
  const caption = new Map<string, string>();
  const baseCaption = new Map<string, string>();
  const hidden = new Set<string>();
  const library = new Set<string>();
  const uploads = new Set<string>();
  const placement = new Map<string, string>();

  for (const g of allGroups) order.set(g.project, []);
  for (const p of baselinePhotos) {
    order.get(p.project)!.push(p.file);
    placement.set(p.file, p.project);
    caption.set(p.file, p.caption);
    baseCaption.set(p.file, p.caption);
  }
  for (const p of galleryLibrary) {
    if (placement.has(p.file)) continue;
    const project = groupByName.has(p.project) ? p.project : allGroups[0].project;
    order.get(project)!.push(p.file);
    placement.set(p.file, project);
    caption.set(p.file, p.caption);
    baseCaption.set(p.file, p.caption);
    hidden.add(p.file);
    library.add(p.file);
  }

  /* Where an event aimed at a split parent lands — see "Split projects". */
  const homePart = new Map(placement);
  const target = (group: string | null, file: string): string | null => {
    const parts = group ? splitParts.get(group) : undefined;
    if (!parts) return group;
    const home = homePart.get(file);
    return parts.some((p) => p.project === home) ? home! : parts[0].project;
  };

  for (const raw of effectiveEvents(events)) {
    const file = raw.file;
    if (!file) continue;
    const e = raw.target_group ? { ...raw, target_group: target(raw.target_group, file) } : raw;
    // An upload enters the gallery here: at the end of its project (or
    // at `position`), visible, with the caption it was uploaded with.
    // Undoing the `add` row takes it off the site again.
    if (e.action === "add") {
      if (placement.has(file) || !e.target_group || !order.has(e.target_group)) continue;
      const to = order.get(e.target_group)!;
      const at = e.position == null ? to.length : Math.max(0, Math.min(e.position, to.length));
      to.splice(at, 0, file);
      placement.set(file, e.target_group);
      caption.set(file, e.caption ?? "");
      baseCaption.set(file, e.caption ?? "");
      uploads.add(file);
      continue;
    }
    if (!placement.has(file)) continue;
    switch (e.action) {
      case "hide":
        hidden.add(file);
        break;
      case "show":
        hidden.delete(file);
        break;
      case "caption":
        if (e.caption) caption.set(file, e.caption);
        break;
      case "move": {
        if (!e.target_group || !order.has(e.target_group)) break;
        const from = order.get(placement.get(file)!)!;
        from.splice(from.indexOf(file), 1);
        const to = order.get(e.target_group)!;
        const at = e.position == null ? to.length : Math.max(0, Math.min(e.position, to.length));
        to.splice(at, 0, file);
        placement.set(file, e.target_group);
        hidden.delete(file);
        break;
      }
    }
  }

  const groups = new Map<string, LivePhoto[]>();
  for (const [project, files] of order) {
    groups.set(
      project,
      files.map((file) => ({
        file,
        caption: caption.get(file)!,
        baseCaption: baseCaption.get(file)!,
        hidden: hidden.has(file),
        library: library.has(file),
        upload: uploads.has(file),
      }))
    );
  }
  return { groups, fromDatabase };
}

const SELECT_EVENTS = `
  SELECT id, action, file, target_group, position, caption, ref_id, created_at
    FROM gallery_events
   ORDER BY id ASC
`;

export async function readEvents(): Promise<GalleryEvent[] | null> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(SELECT_EVENTS);
    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      file: r.file,
      target_group: r.target_group,
      position: r.position,
      caption: r.caption,
      ref_id: r.ref_id,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at ?? ""),
    }));
  } catch (err) {
    console.error("Failed to read gallery events:", err);
    return null;
  }
}

/** Longest caption, in characters. */
export const MAX_CAPTION = 200;

/** A caption cleaned and checked, or the reason it cannot be used. */
export function checkCaption(raw: unknown): { caption: string } | { error: string } {
  const caption = cleanText(raw);
  if (!caption) return { error: "A caption cannot be empty." };
  if (caption.length > MAX_CAPTION) return { error: `Keep captions under ${MAX_CAPTION} characters.` };
  return { caption };
}

/** Width and height of every studio upload, from gallery_uploads. The
    manager uses them to label a photo landscape or portrait. */
export async function uploadSizes(): Promise<Map<string, { w: number; h: number }>> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT file, width, height FROM gallery_uploads");
    return new Map(rows.map((r) => [r.file as string, { w: r.width as number, h: r.height as number }]));
  } catch (err) {
    console.error("Failed to read gallery uploads:", err);
    return new Map();
  }
}

/** Whether a photograph is anywhere in this state, hidden or not —
    baseline, library or upload. What the API checks a `file` against. */
export function hasPhoto(state: LiveState, file: unknown): file is string {
  if (typeof file !== "string") return false;
  for (const photos of state.groups.values()) if (photos.some((p) => p.file === file)) return true;
  return false;
}

/** The live gallery for one page render. Never throws. */
export async function liveState(): Promise<LiveState> {
  const events = await readEvents();
  return events ? replay(events) : replay([], false);
}

/* ------------------------------------------------------------
   What pages render
   ------------------------------------------------------------ */
function visible(state: LiveState, project: string): GalleryPhoto[] {
  return (state.groups.get(project) ?? [])
    .filter((p) => !p.hidden)
    .map((p) => ({ file: p.file, caption: p.caption }));
}

/** A split project's parts that have photographs on the site, or null
    for a project that is not split. */
export function liveParts(state: LiveState, project: string): GalleryPart[] | null {
  const parts = splitParts.get(project);
  if (!parts) return null;
  return parts
    .map((p) => ({ label: p.label ?? p.project, photos: visible(state, p.project) }))
    .filter((p) => p.photos.length);
}

/** One project's photographs as they are on the site now — for a split
    project, every part's, in part order. */
export function livePhotos(state: LiveState, project: string): GalleryPhoto[] {
  const parts = liveParts(state, project);
  return parts ? parts.flatMap((p) => p.photos) : visible(state, project);
}

/** A baseline list of groups with the live photographs: empty groups
    dropped, and groups the studio created for the given sections
    appended at the end. A split project is one group carrying its
    `parts`; the parts are never groups of their own here. */
export function liveGroups(
  state: LiveState,
  baseline: readonly ProjectGallery[],
  sections: readonly Section[]
): ProjectGallery[] {
  const out: ProjectGallery[] = [];
  for (const g of baseline) {
    const parts = liveParts(state, g.project);
    const photos = parts ? parts.flatMap((p) => p.photos) : visible(state, g.project);
    if (photos.length) out.push(parts ? { ...g, photos, parts } : { ...g, photos });
  }
  for (const g of extraGroups) {
    if (!sections.includes(g.section)) continue;
    const photos = visible(state, g.project);
    if (photos.length) out.push({ project: g.project, photos });
  }
  return out;
}

/* The baseline lists, re-exported so pages import one module. */
export { hseGalleries, plantGalleries, projectGalleries, railwayGalleries, socialGalleries };

const sectionOf = new Map<readonly ProjectGallery[], Section>([
  [railwayGalleries, "railway"],
  [socialGalleries, "social"],
  [plantGalleries, "plant"],
  [hseGalleries, "hse"],
]);

/** One /gallery section's groups, live. `baseline` must be one of the
    four section lists gallery.ts exports (gallery-page.ts uses them
    as-is). */
export function liveSection(state: LiveState, baseline: readonly ProjectGallery[]): ProjectGallery[] {
  const section = sectionOf.get(baseline);
  if (!section) throw new Error("liveSection: not one of gallery.ts's section lists");
  return liveGroups(state, baseline, [section]);
}

/** The /projects Gallery tab: every group, live, in allGalleries order. */
export function liveAllGalleries(state: LiveState): ProjectGallery[] {
  return [
    ...liveGroups(state, projectGalleries, ["railway", "social"]),
    ...liveGroups(state, plantGalleries, ["plant"]),
    ...liveGroups(state, hseGalleries, ["hse"]),
  ];
}

/** A plant page's photographs, found by the page's own address. */
export function livePlantPhotos(state: LiveState, href: string): GalleryPhoto[] {
  const group = plantGalleries.find((g) => g.href === href);
  return group ? livePhotos(state, group.project) : [];
}
