/* ============================================================
   POST   /api/edit-session   — sign in    { passphrase }
   DELETE /api/edit-session   — sign out
   GET    /api/edit-session   — { authed: boolean }
   ------------------------------------------------------------
   The passphrase goes in, a signed cookie comes out. See
   src/lib/edit-auth.ts for the shape of the token and for why there is
   no session store behind this.

   REACHABLE BY PATH ALONE, and that is on purpose. This endpoint does
   not know the secret slug and never checks it: the login page at
   /studio/<slug> is what the slug hides, and this is the plain API it
   posts to. Anybody can find /api/edit-session and POST to it.

   Do not "fix" that by moving the endpoint under the slug. It would
   put the secret in every fetch URL, in the browser's network log and
   in nginx's access log, and it would buy nothing: the passphrase is
   the protection, this route reveals nothing about it, and nginx caps
   it at 5 attempts a minute per address (deploy/nginx-nestingtree.conf).
   The slug's job is keeping the login page off crawlers and wordlists,
   not guarding this.
   ============================================================ */
import type { APIRoute } from "astro";
import {
  EDIT_COOKIE,
  EDIT_UI_COOKIE,
  TOKEN_TTL_SECONDS,
  checkPassphrase,
  isAuthed,
  issueToken,
} from "../../lib/edit-auth";

export const prerender = false;

/** Sign-in state, never cached — not by nginx, not by the browser. */
function json(body: unknown, status = 200, cookies: string[] = []): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  // Set-Cookie is the one header that legitimately repeats, so it has
  // to be appended rather than set.
  for (const c of cookies) headers.append("Set-Cookie", c);
  return new Response(JSON.stringify(body), { status, headers });
}

/* `Secure` is conditional, and only this. Everything else is fixed.

   The site is HTTPS in production, but it is stood up and tested on a
   bare EC2 address over plain HTTP first (see the PUBLIC_SITE_URL note
   in astro.config.mjs), and a Secure cookie set over HTTP is dropped by
   the browser without a word — the editor would simply never sign in,
   with nothing in any log to say why. nginx sets X-Forwarded-Proto on
   every proxied request, so the flag follows the real scheme.

   SameSite=Lax, not None: nothing on another origin has any business
   posting here. HttpOnly on the token so no script can read it, which
   is what keeps an XSS on any page of the site from lifting a session. */
function cookieLine(
  name: string,
  value: string,
  maxAge: number,
  secure: boolean,
  httpOnly: boolean
): string {
  const bits = [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ];
  if (httpOnly) bits.push("HttpOnly");
  if (secure) bits.push("Secure");
  return bits.join("; ");
}

function isHttps(request: Request): boolean {
  return request.headers.get("x-forwarded-proto") === "https";
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const passphrase =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).passphrase
      : null;

  /* One message for every failure — no body, wrong shape, wrong
     passphrase. Saying which part failed tells a script exactly what to
     vary next, and tells the person at the keyboard nothing they did
     not already know. */
  if (typeof passphrase !== "string" || !checkPassphrase(passphrase)) {
    return json({ error: "That passphrase is not right." }, 401);
  }

  const secure = isHttps(request);

  return json({ ok: true }, 200, [
    cookieLine(EDIT_COOKIE, issueToken(), TOKEN_TTL_SECONDS, secure, true),
    /* The hint. NOT HttpOnly, deliberately: BaseLayout reads it in the
       browser to decide whether to import the editor bundle, which is
       what keeps that chunk off every public page load. It carries no
       authority whatsoever — anyone can set `nt_edit_ui=1` in a console
       and all it earns them is a downloaded script whose every save is
       refused by the token check. The server must never read it. */
    cookieLine(EDIT_UI_COOKIE, "1", TOKEN_TTL_SECONDS, secure, false),
  ]);
};

export const DELETE: APIRoute = async ({ request }) => {
  const secure = isHttps(request);

  /* Max-Age=0 on both. The attributes have to match the ones they were
     set with — Path above all — or the browser clears nothing and
     quietly keeps the session. */
  return json({ ok: true }, 200, [
    cookieLine(EDIT_COOKIE, "", 0, secure, true),
    cookieLine(EDIT_UI_COOKIE, "", 0, secure, false),
  ]);
};

/** What the login page asks to decide which of its two faces to show.
    A boolean and nothing else: the token itself is never echoed back. */
export const GET: APIRoute = async ({ request }) => json({ authed: isAuthed(request) });
