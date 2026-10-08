/* ============================================================
   The studio gallery manager's view of the gallery
   ------------------------------------------------------------
   What GET /api/gallery, POST /api/gallery and POST /api/gallery/upload
   all answer with: every group with every photo (hidden ones too), and
   the recent history with what each Undo / Redo button needs.
   Server-only.
   ============================================================ */
import {
  allGroups,
  effectiveEvents,
  isSplitParent,
  replay,
  uploadSizes,
  type GalleryEvent,
} from "./gallery-live";

const HISTORY = 60;

/** Everything the manager draws. */
export async function snapshot(events: readonly GalleryEvent[]) {
  const state = replay(events);
  const sizes = await uploadSizes();
  // A split project's parent holds no photographs (see gallery-live.ts):
  // the manager shows its parts instead.
  const groups = allGroups.filter((g) => !isSplitParent(g.project)).map((g) => ({
    project: g.project,
    section: g.section,
    photos: (state.groups.get(g.project) ?? []).map((p) => (p.upload ? { ...p, ...sizes.get(p.file) } : p)),
  }));

  // Which non-undo events are in force, and which undo row cancelled
  // each one that is not: that row is what "Redo" undoes. Same walk as
  // effectiveEvents(): newest first, a cancelled undo cancels nothing.
  const active = new Set(effectiveEvents(events).map((e) => e.id));
  const cancelledBy = new Map<number, number>();
  const cancelled = new Set<number>();
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e.action !== "undo" || e.ref_id == null || cancelled.has(e.id)) continue;
    cancelled.add(e.ref_id);
    if (!cancelledBy.has(e.ref_id)) cancelledBy.set(e.ref_id, e.id);
  }

  const history = events
    .filter((e) => e.action !== "undo")
    .slice(-HISTORY)
    .reverse()
    .map((e) => ({
      id: e.id,
      action: e.action,
      file: e.file,
      group: e.target_group,
      position: e.position,
      caption: e.caption,
      at: e.created_at,
      undone: !active.has(e.id),
      undoneBy: active.has(e.id) ? null : (cancelledBy.get(e.id) ?? null),
    }));

  return { groups, history };
}

