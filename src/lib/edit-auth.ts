/* ============================================================
   PORTED FROM NESTING TREE — src/lib/edit-auth.ts
   ------------------------------------------------------------
   FROZEN. Do not refactor, rename or tidy. This is a working
   implementation lifted whole; the comments below are the original
   author's and are worth more than any improvement to them.

   Changed on the way across, and nothing else:
     · EDIT_COOKIE      nt_edit    -> kd_edit
     · EDIT_UI_COOKIE   nt_edit_ui -> kd_edit_ui
       Cookies are not port-scoped. Nesting Tree's dev server runs on
       localhost:4321 and this one on localhost:4322, so a browser
       signed in there would send `nt_edit_ui=1` here, load the editor
       against a server whose EDIT_SECRET cannot verify the token, and
       have every save refused. Distinct names, distinct sessions.
     · comments naming Nesting Tree's DEPLOYMENT.md and systemd unit
       repointed at this repo's .env.example. Prose only.
   ============================================================ */
/* ============================================================
   Editor sign-in — the shared rules
   ------------------------------------------------------------
   Two layers, and it matters that they are not confused with each
   other:

     the SECRET PATH (`EDIT_LOGIN_SLUG`) controls DISCOVERY. It is
     what keeps /studio/<slug> off every crawler, every wordlist and
     every bored visitor's address bar. It is not authorisation, and
     nothing in this file or anywhere else may treat "knows the URL"
     as "may write". The login page is the only thing that ever reads
     it, and all it unlocks is the sight of a passphrase box.

     the PASSPHRASE (`EDIT_PASSPHRASE`) is the actual protection. It
     is what turns into a signed cookie, and that cookie is what every
     write route checks.

   STATELESS ON PURPOSE. A session is a signed string the browser
   carries, not a row in a table and not a Map in this process. There
   is one node process behind nginx and it gets restarted for every
   content deploy; an in-memory session store would sign the
   person editing out in the middle of a sentence, every single
   deploy. Nothing here is written
   down, so nothing can be lost.

   The cost of that trade is the one to know about: a token cannot be
   revoked individually. Signing everybody out is done by changing
   EDIT_SECRET or EDIT_PASSPHRASE, which invalidates every token at
   once. For one shared passphrase held by one or two people, that is
   the right shape.
   ============================================================ */
import crypto from "node:crypto";
import "dotenv/config"; // loads the .env file into process.env, as src/lib/db.ts does

export const EDIT_COOKIE = "kd_edit";

/* Read by the browser, never trusted by the server. It exists so a page
   can decide whether to download the editor bundle at all — see the
   note on it in src/pages/api/edit-session.ts. */
export const EDIT_UI_COOKIE = "kd_edit_ui";

/** Seven days. Long enough that a week of edits needs one sign-in. */
export const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const SECRET = process.env.EDIT_SECRET ?? "";

/* Loud, at import time, naming the variable. A signing key that is
   missing must stop the routes from working at all — the alternative is
   an HMAC keyed on "", which anybody who has read this file can forge,
   and the site would look like it was working. Fail closed, and fail
   where somebody will see it: it lands in the server's log.

   KNOW THE BLAST RADIUS. src/pages/api/content.ts imports this module
   for its POST guard, so a missing EDIT_SECRET takes its GET down too
   and every /api/content read answers 500. Visitors still get a working
   site — the pages are prerendered with real copy and that is what they
   see — but no edit is applied to any of them. It is loud rather than
   subtle by design. Do not "fix" it
   by giving this a default. */
if (!SECRET) {
  throw new Error(
    "EDIT_SECRET is not set. The in-page editor cannot sign or verify " +
      "sessions without it. Set EDIT_SECRET (32+ random bytes) in .env " +
      "— see .env.example."
  );
}

/* ------------------------------------------------------------
   Constant-time comparison

   crypto.timingSafeEqual throws unless both buffers are the same
   length, so comparing two secrets directly would either throw or
   need a length check first — and that length check is itself a
   timing tell, one that leaks how long the passphrase is.

   Hashing both sides first makes every comparison 32 bytes against
   32 bytes: constant-time and length-independent, whatever was typed.
   ------------------------------------------------------------ */
function digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

function sameSecret(input: string, expected: string): boolean {
  // An unset or empty env var can never be matched. Without this, an
  // empty submission against an unconfigured server would succeed.
  if (!expected) return false;
  return crypto.timingSafeEqual(digest(input), digest(expected));
}

/**
 * Is this the secret second path segment? Discovery only — a true here
 * means "show the passphrase box", never "you may write".
 */
export function checkSlug(slug: string): boolean {
  return sameSecret(slug, process.env.EDIT_LOGIN_SLUG ?? "");
}

/** Is this the shared passphrase? This is the one that grants anything. */
export function checkPassphrase(input: string): boolean {
  return sameSecret(input, process.env.EDIT_PASSPHRASE ?? "");
}

/* ------------------------------------------------------------
   The token: <expiryEpochSeconds>.<hmac>

   The expiry travels in the clear, which is fine — it is signed, so
   moving it invalidates the signature. Keeping it in the token rather
   than only in the cookie's Max-Age is what makes the server the one
   deciding when a session is over: Max-Age is a request to the
   browser, and a browser can be told to ignore it.
   ------------------------------------------------------------ */
function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function issueToken(): string {
  const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  return `${expiry}.${sign(String(expiry))}`;
}

export function verifyToken(token: string | null): boolean {
  if (!token) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const expiry = token.slice(0, dot);
  const mac = token.slice(dot + 1);

  // Digits only. Number() would happily take " 12e9" or "0x…", and a
  // signature is checked below anyway — but a payload that does not
  // round-trip as its own string is malformed, not merely expired.
  if (!/^\d+$/.test(expiry)) return false;

  // Signature first, then expiry: an unsigned token is never worth
  // reading the clock for.
  if (!sameSecret(mac, sign(expiry))) return false;

  return Number(expiry) > Math.floor(Date.now() / 1000);
}

/* ------------------------------------------------------------
   Cookies

   Deliberately hand-parsed rather than reached for through Astro's
   `context.cookies`: this is called from API routes and from a page,
   and the only thing either has in common is the Request.
   ------------------------------------------------------------ */
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    return part.slice(eq + 1).trim();
  }
  return null;
}

/**
 * The only question the write routes ask. Everything else in this file
 * exists to make this one answerable without a server-side store.
 */
export function isAuthed(request: Request): boolean {
  return verifyToken(readCookie(request, EDIT_COOKIE));
}
