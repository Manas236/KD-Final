/* ============================================================
   /api/launch — the launch mode switch (signed-in editors only)
   ------------------------------------------------------------
   GET   { on, forced, lastEvent }
   POST  { action: "set", on }       flip the switch; logged
         { action: "preview", on }   this browser previews launch mode,
                                     or stops; nothing public changes
         { action: "view", view }    this browser's view, off, preview or
                                     removed (the floating bar's buttons);
                                     nothing public changes, nothing logged

   Every answer to anyone without a valid session is the same 401, with
   nothing written. The switch itself: src/lib/launch-switch.ts.
   ============================================================ */
import type { APIRoute } from "astro";
import { isAuthed } from "../../lib/edit-auth";
import { userAgentFrom } from "../../lib/editable";
import { clientIp } from "../../lib/client-ip";
import { HIDE_PENDING } from "../../lib/launch";
import { isViewFlag, viewCookieLine } from "../../lib/launch-editor";
import { launchSwitchOn, setLaunchSwitch, switchEvents } from "../../lib/launch-switch";

export const prerender = false;

function json(body: unknown, status = 200, cookie?: string): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

const SIGNED_OUT = { error: "Your editing session has ended. Sign in again." };

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthed(request)) return json(SIGNED_OUT, 401);
  const events = await switchEvents(1);
  return json({ on: HIDE_PENDING || (await launchSwitchOn()), forced: HIDE_PENDING, lastEvent: events?.[0]?.id ?? null });
};

export const POST: APIRoute = async (context) => {
  const { request } = context;
  if (!isAuthed(request)) return json(SIGNED_OUT, 401);

  let body: { action?: unknown; on?: unknown; view?: unknown } | null = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  /* The cookie means nothing without a session (src/lib/launch-editor.ts). */
  if (body?.action === "view") {
    if (!isViewFlag(body.view)) return json({ error: "Say off, preview or removed." }, 400);
    return json({ ok: true, view: body.view }, 200, viewCookieLine(body.view, request));
  }

  if (typeof body?.on !== "boolean") return json({ error: "Say on or off." }, 400);

  if (body.action === "preview") {
    return json({ ok: true, preview: body.on }, 200, viewCookieLine(body.on ? "preview" : "off", request));
  }

  if (body.action !== "set") return json({ error: "Unknown action." }, 400);
  if (HIDE_PENDING) {
    return json({ error: "This build has HIDE_PENDING=1, which forces launch mode on. Take it out and rebuild first." }, 409);
  }

  try {
    await setLaunchSwitch(body.on, clientIp(context), userAgentFrom(request));
  } catch (err) {
    console.error("Failed to flip launch mode:", err);
    return json({ error: "The database refused the change, so nothing changed. Has db/migrate.sql been run, with its grants?" }, 503);
  }
  return json({ ok: true, on: body.on });
};
