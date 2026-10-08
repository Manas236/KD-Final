/* ============================================================
   GET /api/applications/resume?file=<name> — one applicant's resume
   ------------------------------------------------------------
   Signed-in editors only (the edit session), for the download links in
   /studio/applications. Anyone else gets a bare 404, the same answer as
   a name that does not exist. readResume() only accepts the exact names
   storeResume() writes, so no path can leave the folder.
   ============================================================ */
import type { APIRoute } from "astro";
import { isAuthed } from "../../../lib/edit-auth";
import { RESUME_TYPES, kindOf, readResume } from "../../../lib/applications";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthed(request)) return new Response(null, { status: 404 });
  const file = url.searchParams.get("file") ?? "";
  const data = await readResume(file);
  if (!data) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": RESUME_TYPES[kindOf(file)],
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
};
