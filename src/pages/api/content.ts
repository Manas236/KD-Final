/* ============================================================
   GET  /api/content?path=<pathname>   — the edits for one page
   POST /api/content                   — save one edit
   ------------------------------------------------------------
   The read half runs on every page view, so it stays cheap: one
   indexed query, no session, no cookies. It must STAY open. This is
   what paints the edited copy for the public — put a check on the GET
   and every visitor sees the text the site was built with instead of
   the text it now says.

   The write half is behind a signed-cookie session (src/lib/edit-auth.ts)
   and, once past that, still trusts nothing in the request body. Every
   field goes through validateEdit() in src/lib/editable.ts, which is the
   same module the browser uses to decide what it will let you click into.

   The two do different jobs and neither substitutes for the other.
   isAuthed() answers "may this caller write at all" — before this
   existed, the answer was yes, to everyone who could load a page, and
   prices, RERA numbers and the sales phone were one POST away for any
   visitor. validateEdit() only checks the SHAPE of a request — known
   page, well-formed key, non-empty text under the length cap, markup
   stripped — and, since the denylist was removed on 13 Aug 2026,
   nothing whatever about what the text SAYS. So the session is what
   decides who edits; validation is what stops a signed-in editor
   posting something the page cannot hold.

   content_edits is APPEND-ONLY. A save is an INSERT; the current text
   for a key is the row with the highest id. Nothing here UPDATEs or
   DELETEs, so the table doubles as the audit trail of who changed what
   to what (and /api/content/revert can walk back through it).
   ============================================================ */
import type { APIRoute } from "astro";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../lib/db";
import { isAuthed } from "../../lib/edit-auth";
import {
  cleanText,
  clientIpFrom,
  normalizePath,
  userAgentFrom,
  validateEdit,
} from "../../lib/editable";

export const prerender = false;

/** Every response here is per-visitor state that must never be cached. */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/* ------------------------------------------------------------
   GET — the latest row per edit_key for one page.

   The inner query finds the highest id per key (that is "current"),
   the join pulls the text back out. idx_page keeps it to the rows for
   this one page.
   ------------------------------------------------------------ */
/* Columns are named one by one, and client_ip / user_agent are not among
   them. This response goes to the browser — never widen it to SELECT *. */
const SELECT_LATEST = `
  SELECT e.id, e.edit_key, e.original_text, e.new_text
    FROM content_edits e
    JOIN (
      SELECT edit_key, MAX(id) AS max_id
        FROM content_edits
       WHERE page_path = ?
       GROUP BY edit_key
    ) latest ON latest.max_id = e.id
`;

export const GET: APIRoute = async ({ url }) => {
  const path = normalizePath(url.searchParams.get("path"));

  // An unknown page simply has no edits. The head script fires this
  // request on every page — including ones that are not editable — and
  // a 400 there would be console noise, not information.
  if (!path) return json({ edits: {} });

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(SELECT_LATEST, [path]);

    const edits: Record<
      string,
      { text: string; original: string; id: number }
    > = {};
    for (const row of rows) {
      edits[row.edit_key] = {
        text: row.new_text,
        original: row.original_text,
        id: row.id,
      };
    }
    return json({ edits });
  } catch (err) {
    console.error("Failed to read content edits:", err);
    // 503, not 500: the client keeps showing its localStorage copy
    // rather than snapping the page back to the built-in text.
    return json({ edits: {}, error: "Edits are unavailable right now." }, 503);
  }
};

/* ------------------------------------------------------------
   POST — save one edit.
   Body: { path, key, original, text }

   `original_text` means one thing throughout this table: the text the
   page was BUILT with. That is what makes an edit findable months later
   — the browser looks the element up by key, and if the markup has
   shifted underneath it, falls back to hunting for the string this edit
   replaced. If each save filed itself under the PREVIOUS save's text
   instead, a second edit would already have no string on the page to
   match, and the whole page's edits would quietly stop applying for new
   visitors. So the anchor does not follow the edits.

   IT DOES, HOWEVER, FOLLOW THE BUILD, and it has to. Read this before
   pinning it back to the first row.

   The site's own copy gets rewritten — the owner's 12 and 13 Aug 2026
   reviews rewrote most of it. When the source text under a key changes,
   the anchor on file names a string that is now nowhere on the page, and
   applyOne() in BaseLayout.astro refuses to write an edit onto an
   element it cannot recognise. Every edit under that key becomes
   invisible. Worse, it stays invisible: the browser sends the text it
   actually found on the page, and if this route discards that in favour
   of the dead anchor, the next save is filed under the dead anchor too.
   That is a line nobody can edit again — it saves, answers 200, and is
   gone on reload, for ever. Sixty of two hundred and twenty-four stored
   edits were in exactly that state on 17 Aug 2026.

   So the rule is: the anchor is kept while the browser still reports it,
   and adopted from the browser when it does not. The browser reads
   `original` off the live DOM, so what arrives here is by definition a
   string that WAS on the page — which is precisely what applyOne() needs
   to match on the next load. A key that has drifted heals itself on its
   first edit; the rows already stranded need the one-off re-anchor pass
   in scripts/reanchor-content-edits.mjs.
   ------------------------------------------------------------ */
const SELECT_CURRENT = `
  SELECT original_text, new_text
    FROM content_edits
   WHERE page_path = ? AND edit_key = ?
   ORDER BY id DESC
   LIMIT 1
`;

const INSERT_EDIT = `
  INSERT INTO content_edits
    (page_path, edit_key, original_text, new_text, client_ip, user_agent)
  VALUES (?, ?, ?, ?, ?, ?)
`;

/** Roughly 8x the longest legal edit. nginx caps this too. */
const MAX_BODY = 16 * 1024;

export const POST: APIRoute = async (context) => {
  const { request } = context;

  /* Before the body is read, before it is validated, before anything
     touches the database. An unauthenticated caller gets one answer and
     costs one HMAC. The wording is what the editor puts on screen when
     a session runs out mid-edit — see endSession() in
     src/scripts/inline-edit.js. */
  if (!isAuthed(request))
    return json({ error: "Your editing session has ended." }, 401);

  // The socket address, used only if X-Forwarded-For does not parse.
  // Astro throws here rather than returning undefined when the adapter
  // cannot report it, and a save must not 500 over an audit column.
  let socket: string | null = null;
  try {
    socket = context.clientAddress;
  } catch {
    socket = null;
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return json({ error: "That is too much text." }, 413);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read the change." }, 400);
  }
  if (!body || typeof body !== "object")
    return json({ error: "Could not read the change." }, 400);

  const check = validateEdit(body as Record<string, unknown>);
  if (!check.ok) return json({ error: check.reason }, 400);

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(SELECT_CURRENT, [
      check.path,
      check.key,
    ]);
    const latest = rows[0];

    /* The row on file, but only while its anchor is still LIVE — while
       `original_text` is a string the browser reports finding on the
       page. Both decisions below turn on that one question, so it is
       asked once, here, rather than answered twice and drifting apart.

       Compared cleaned, because a row written before this route cleaned
       its input may differ from `check.original` only in whitespace, and
       that is not drift. Anything else means the page moved underneath
       the key. */
    const live =
      latest && cleanText(latest.original_text) === check.original
        ? latest
        : null;

    /* Kept verbatim while the browser still reports it; when it does
       not, the browser's reading of the page becomes the anchor. */
    const anchor = live ? live.original_text : check.original;

    /* What the page ACTUALLY says under this key — which is not always
       what the newest row claims it says. A row whose anchor is dead
       never paints: applyOne() in BaseLayout.astro can find no element
       to write it to, so the copy the page was BUILT with renders in its
       place — and that built copy is exactly what the browser has just
       sent as `original`.

       Reading `new_text` in that state is what made a stranded line
       permanently unfixable. Retyping the edit that is not showing
       matched the row on file, answered 400 "that is already what the
       page says" about words nowhere on the screen, and returned BEFORE
       the adoption above could give the row a live anchor. The one
       gesture that heals a stranded key was the one gesture this guard
       refused. So when the anchor is dead, "already what the page says"
       has to mean the page, not the row.

       Both sides of the comparison are cleaned: `check.original` and
       `check.text` come out of validateEdit() already through
       cleanText(), so `latest.new_text` is given the same treatment
       rather than compared raw. */
    const current = live ? cleanText(live.new_text) : check.original;

    if (current === check.text)
      return json({ error: "That is already what the page says." }, 400);

    const [res] = await pool.execute<ResultSetHeader>(INSERT_EDIT, [
      check.path,
      check.key,
      anchor,
      check.text,
      clientIpFrom(request, socket),
      userAgentFrom(request),
    ]);
    return json({ ok: true, id: res.insertId, text: check.text });
  } catch (err) {
    console.error("Failed to save content edit:", err);
    return json({ error: "Could not save — please try again." }, 500);
  }
};
