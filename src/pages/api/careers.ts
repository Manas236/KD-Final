/* ============================================================
   POST /api/careers — add or remove a job posting on /careers
   ------------------------------------------------------------
   Body: { action: "add", title, details, linkedin, indeed, days }
      or { action: "remove", id }

   Behind the same signed-cookie session as /api/content, checked before
   the body is read. job_posting_events is append-only: a removal is an
   INSERT pointing at the posting it takes down (db/schema.sql). The
   page reads the open postings itself when it renders, so there is no
   GET here. Validation lives in src/lib/job-postings.ts.
   ============================================================ */
import type { APIRoute } from "astro";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../lib/db";
import { isAuthed } from "../../lib/edit-auth";
import { clientIpFrom, userAgentFrom } from "../../lib/editable";
import { OPEN_WHERE, ensureExpiryColumn, validatePosting } from "../../lib/job-postings";

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

const INSERT_ADD = `
  INSERT INTO job_posting_events
    (action, title, details, linkedin_url, indeed_url, open_days, client_ip, user_agent)
  VALUES ('add', ?, ?, ?, ?, ?, ?, ?)
`;

const INSERT_REMOVE = `
  INSERT INTO job_posting_events (action, posting_id, client_ip, user_agent)
  VALUES ('remove', ?, ?, ?)
`;

/* Only an open posting can be removed: an id that was never added, was
   removed already, or has expired gets a 404 rather than a remove row. */
const SELECT_OPEN_ONE = `
  SELECT a.id FROM job_posting_events a
   WHERE a.id = ? AND ${OPEN_WHERE}
`;

const MAX_BODY = 8 * 1024;

export const POST: APIRoute = async (context) => {
  const { request } = context;
  if (!isAuthed(request))
    return json({ error: "Your editing session has ended." }, 401);

  let socket: string | null = null;
  try {
    socket = context.clientAddress;
  } catch {
    socket = null;
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return json({ error: "That is too much text." }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read the change." }, 400);
  }
  if (!body || typeof body !== "object")
    return json({ error: "Could not read the change." }, 400);

  const ip = clientIpFrom(request, socket);
  const ua = userAgentFrom(request);

  try {
    await ensureExpiryColumn();
    if (body.action === "add") {
      const check = validatePosting(body);
      if (!check.ok) return json({ error: check.reason }, 400);
      const [res] = await pool.execute<ResultSetHeader>(INSERT_ADD, [
        check.title,
        check.details,
        check.linkedin,
        check.indeed,
        check.days,
        ip,
        ua,
      ]);
      return json({ ok: true, id: res.insertId });
    }

    if (body.action === "remove") {
      const id = Number(body.id);
      if (!Number.isInteger(id) || id < 1)
        return json({ error: "Could not identify the posting." }, 400);
      const [rows] = await pool.execute<RowDataPacket[]>(SELECT_OPEN_ONE, [id]);
      if (!rows.length) return json({ error: "That posting is already gone." }, 404);
      await pool.execute<ResultSetHeader>(INSERT_REMOVE, [id, ip, ua]);
      return json({ ok: true });
    }

    return json({ error: "Could not read the change." }, 400);
  } catch (err) {
    console.error("Failed to save job posting:", err);
    return json({ error: "Could not save — please try again." }, 500);
  }
};
