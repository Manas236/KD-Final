/* ============================================================
   POST /api/content/revert
   ------------------------------------------------------------
   Body: { path, key, toId? }

   Reverting does not delete anything. It reads an older row and writes
   a NEW row carrying that row's text forward, so the history stays a
   straight line you can keep walking back along:

     id 7  "Homes that grow"   <- someone edited it
     id 9  "Homes that GROW"   <- and again
     id 12 "Homes that grow"   <- revert to id 7: a new row, not a delete

   With no `toId` this is one step back — what the "Undo last change"
   pill in the toolbar sends. With a `toId` it restores that specific
   version, which is what the per-element version menu sends.
   ============================================================ */
import type { APIRoute } from "astro";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../../lib/db";
import { isAuthed } from "../../../lib/edit-auth";
import {
  MAX_TEXT,
  cleanText,
  clientIpFrom,
  isValidKey,
  normalizePath,
  userAgentFrom,
} from "../../../lib/editable";

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

const SELECT_HISTORY = `
  SELECT id, original_text, new_text
    FROM content_edits
   WHERE page_path = ? AND edit_key = ?
   ORDER BY id DESC
`;

/* A revert is an edit like any other and is attributed like one. */
const INSERT_EDIT = `
  INSERT INTO content_edits
    (page_path, edit_key, original_text, new_text, client_ip, user_agent)
  VALUES (?, ?, ?, ?, ?, ?)
`;

export const POST: APIRoute = async (context) => {
  const { request } = context;

  /* A revert writes a row like any other edit, so it is gated like any
     other edit — first thing, before the body is read. */
  if (!isAuthed(request))
    return json({ error: "Your editing session has ended." }, 401);

  // See the note in api/content.ts: only a fallback, and it must not throw.
  let socket: string | null = null;
  try {
    socket = context.clientAddress;
  } catch {
    socket = null;
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read the request." }, 400);
  }
  if (!body || typeof body !== "object")
    return json({ error: "Could not read the request." }, 400);

  const path = normalizePath(body.path);
  if (!path) return json({ error: "That page cannot be edited." }, 400);
  if (!isValidKey(body.key))
    return json({ error: "Could not identify the text on the page." }, 400);

  // toId is optional. When present it must be one of THIS key's rows —
  // looked up within the result set below, never trusted as a bare id.
  let toId: number | null = null;
  if (body.toId !== undefined && body.toId !== null) {
    toId = Number(body.toId);
    if (!Number.isInteger(toId) || toId <= 0)
      return json({ error: "That version is not valid." }, 400);
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(SELECT_HISTORY, [
      path,
      body.key,
    ]);
    if (rows.length === 0)
      return json({ error: "This text has not been changed yet." }, 400);

    const current = rows[0];

    let target: string;
    if (toId !== null) {
      const row = rows.find((r) => r.id === toId);
      if (!row) return json({ error: "That version is no longer here." }, 400);
      target = row.new_text;
    } else if (rows.length > 1) {
      // One step back: whatever the text was before the current row.
      target = rows[1].new_text;
    } else {
      // Only one edit ever made, so a step back lands on the text the
      // page was built with.
      target = current.original_text;
    }

    target = cleanText(target);

    // A stored row was legal when it was written, and the limits may have
    // tightened since. Re-check rather than let an old row smuggle an
    // over-long string back onto the page.
    if (!target || target.length > MAX_TEXT)
      return json({ error: "That version can no longer be restored." }, 400);

    if (target === cleanText(current.new_text))
      return json({ error: "That is already what the page says." }, 400);

    /* The anchor in force, which is the NEWEST row's — not the oldest.
       Rows for one key no longer all carry the same anchor: when the
       site's own copy is rewritten under a key, the next save adopts the
       text the browser found there (see the long note in api/content.ts).
       Taking the oldest row here would walk that back and re-strand every
       edit on this line, which is the bug the adoption exists to fix.

       A revert is a new row like any other, so it files itself under
       whatever anchor is current. */
    const anchor = rows[0].original_text;

    const [res] = await pool.execute<ResultSetHeader>(INSERT_EDIT, [
      path,
      body.key,
      anchor,
      target,
      clientIpFrom(request, socket),
      userAgentFrom(request),
    ]);
    return json({ ok: true, id: res.insertId, text: target });
  } catch (err) {
    console.error("Failed to revert content edit:", err);
    return json({ error: "Could not undo — please try again." }, 500);
  }
};
