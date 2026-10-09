/* ============================================================
   POST /api/applications/delete — remove one job application
   ------------------------------------------------------------
   Body: { id }. Signed-in editors only, for the Delete button on
   /studio/applications: how HR honours a "please delete my data"
   request, as /privacy promises. Removes the database row and the
   resume file (src/lib/applications.ts). Anyone else gets a 401.
   ============================================================ */
import type { APIRoute } from "astro";
import { isAuthed } from "../../../lib/edit-auth";
import { deleteApplication } from "../../../lib/applications";

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthed(request)) return json({ error: "Your editing session has ended." }, 401);

  let id: unknown;
  try {
    ({ id } = (await request.json()) as { id?: unknown });
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1) return json({ error: "Bad request." }, 400);

  try {
    return (await deleteApplication(id)) ? json({ ok: true }) : json({ error: "Already deleted." }, 404);
  } catch (err) {
    console.error("Failed to delete a job application:", err);
    return json(
      { error: "Could not delete. The database user may lack DELETE permission on job_applications (db/schema.sql)." },
      500
    );
  }
};
