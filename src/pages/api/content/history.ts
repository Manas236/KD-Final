/* ============================================================
   GET /api/content/history?path=<pathname>&key=<edit_key>
   ------------------------------------------------------------
   Every version of one piece of text, newest first. The client shows
   the last five in the right-click menu; the full list is returned
   because the table is append-only and this is the only way to read
   the trail.

   `original` on the OLDEST row is the text the page was built with.

   SIGNED IN ONLY, even though it writes nothing. This is a GET and it
   reads text — the tempting call is to leave it open the way
   `GET /api/content` is. The difference is what each returns.
   /api/content returns the CURRENT copy, which is on the page for
   anybody to read anyway; this returns every version there has ever
   been, with timestamps. That is a record of what the site said about
   a price, a carpet area or a RERA number at each moment, and of when
   somebody thought better of it — not public copy, and not something
   to leave enumerable a key at a time.

   Nothing is given up by closing it: the version menu in the editor is
   the only caller, and the editor now only exists for a signed-in
   browser. The check is here rather than only in the UI because the UI
   is not a security boundary.
   ============================================================ */
import type { APIRoute } from "astro";
import type { RowDataPacket } from "mysql2";
import pool from "../../../lib/db";
import { isAuthed } from "../../../lib/edit-auth";
import { isValidKey, normalizePath } from "../../../lib/editable";

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

/* client_ip and user_agent are deliberately absent: this response is
   read by the browser, and the audit columns stay on the server. */
const SELECT_HISTORY = `
  SELECT id, original_text, new_text, created_at
    FROM content_edits
   WHERE page_path = ? AND edit_key = ?
   ORDER BY id DESC
`;

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthed(request))
    return json({ error: "Your editing session has ended." }, 401);

  const path = normalizePath(url.searchParams.get("path"));
  if (!path) return json({ error: "That page cannot be edited." }, 400);

  const key = url.searchParams.get("key");
  if (!isValidKey(key))
    return json({ error: "Could not identify the text on the page." }, 400);

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(SELECT_HISTORY, [
      path,
      key,
    ]);

    return json({
      path,
      key,
      history: rows.map((r) => ({
        id: r.id,
        text: r.new_text,
        original: r.original_text,
        created_at:
          r.created_at instanceof Date
            ? r.created_at.toISOString()
            : String(r.created_at),
      })),
    });
  } catch (err) {
    console.error("Failed to read content history:", err);
    return json({ error: "History is unavailable right now." }, 503);
  }
};
