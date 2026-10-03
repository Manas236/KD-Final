/* ============================================================
   GET  /api/gallery   — the whole gallery for the studio manager
   POST /api/gallery   — one change: hide, show, move, caption, undo
   ------------------------------------------------------------
   Both halves are behind the same signed-cookie session as
   /api/content and /api/careers, checked before the body is read. The
   public pages never call this: they read the live gallery themselves
   when they render (src/lib/gallery-live.ts).

   Body for POST:
     { action: "hide",    file }
     { action: "show",    file }
     { action: "move",    file, group, position? }   position omitted = end
     { action: "caption", file, caption }
     { action: "undo",    ref }                      ref = an event id

   gallery_events is APPEND-ONLY (db/schema.sql): every POST is one
   INSERT, an undo is a row of its own, and nothing is UPDATEd or
   DELETEd. Each POST answers with the fresh state, so the manager
   repaints from what the server now holds rather than from a guess.

   client_ip and user_agent are audit columns and are never sent back.
   ============================================================ */
import type { APIRoute } from "astro";
import type { RowDataPacket } from "mysql2";
import pool from "../../lib/db";
import { isAuthed } from "../../lib/edit-auth";
import { cleanText, clientIpFrom, userAgentFrom } from "../../lib/editable";
import {
  allGroups,
  effectiveEvents,
  isGroup,
  isKnownFile,
  readEvents,
  replay,
  type GalleryEvent,
} from "../../lib/gallery-live";

export const prerender = false;

const MAX_CAPTION = 200;
const HISTORY = 60;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Everything the manager draws. */
function snapshot(events: readonly GalleryEvent[]) {
  const state = replay(events);
  const groups = allGroups.map((g) => ({
    project: g.project,
    section: g.section,
    photos: state.groups.get(g.project) ?? [],
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

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthed(request)) return json({ error: "Not signed in." }, 401);
  const events = await readEvents();
  if (!events) return json({ error: "Could not read the gallery. Try again in a moment." }, 503);
  return json(snapshot(events));
};

interface Insert {
  action: GalleryEvent["action"];
  file: string | null;
  group: string | null;
  position: number | null;
  caption: string | null;
  ref: number | null;
}

function validate(body: Record<string, unknown>): Insert | string {
  const action = body.action;
  const file = body.file;

  if (action === "undo") {
    const ref = Number(body.ref);
    if (!Number.isInteger(ref) || ref < 1) return "Nothing to undo.";
    return { action, file: null, group: null, position: null, caption: null, ref };
  }

  if (!isKnownFile(file)) return "That photograph is not in the gallery.";

  switch (action) {
    case "hide":
    case "show":
      return { action, file, group: null, position: null, caption: null, ref: null };
    case "move": {
      if (!isGroup(body.group)) return "That project has no page to show photographs on.";
      let position: number | null = null;
      if (body.position != null) {
        const p = Number(body.position);
        if (!Number.isInteger(p) || p < 0 || p > 5000) return "That position is not valid.";
        position = p;
      }
      return { action, file, group: body.group, position, caption: null, ref: null };
    }
    case "caption": {
      const caption = cleanText(body.caption);
      if (!caption) return "A caption cannot be empty.";
      if (caption.length > MAX_CAPTION) return `Keep captions under ${MAX_CAPTION} characters.`;
      return { action, file, group: null, position: null, caption, ref: null };
    }
    default:
      return "Unknown change.";
  }
}

const INSERT = `
  INSERT INTO gallery_events
    (action, file, target_group, position, caption, ref_id, client_ip, user_agent)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

const MAX_BODY = 4096;

export const POST: APIRoute = async (context) => {
  const { request } = context;
  if (!isAuthed(request)) return json({ error: "Not signed in." }, 401);

  // clientAddress throws where the adapter cannot supply one.
  let socket: string | null = null;
  try {
    socket = context.clientAddress;
  } catch {
    socket = null;
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return json({ error: "That request is too large." }, 413);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Could not read the request." }, 400);
  }
  if (!body || typeof body !== "object") return json({ error: "Could not read the request." }, 400);

  const change = validate(body);
  if (typeof change === "string") return json({ error: change }, 400);

  try {
    if (change.action === "undo") {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM gallery_events WHERE id = ?",
        [change.ref]
      );
      if (!rows.length) return json({ error: "That change no longer exists." }, 400);
    }
    await pool.execute(INSERT, [
      change.action,
      change.file,
      change.group,
      change.position,
      change.caption,
      change.ref,
      clientIpFrom(request, socket),
      userAgentFrom(request),
    ]);
  } catch (err) {
    console.error("Failed to save gallery change:", err);
    return json({ error: "Could not save. Nothing was changed." }, 500);
  }

  const events = await readEvents();
  if (!events) return json({ error: "Saved, but could not reload. Refresh the page." }, 503);
  return json(snapshot(events));
};
