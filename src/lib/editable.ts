/* ============================================================
   PORTED FROM NESTING TREE — src/lib/editable.ts
   ------------------------------------------------------------
   FROZEN except where noted. Do not refactor, rename or tidy.

   Changed on the way across:
     · CACHE_PREFIX  "nt-edits:" -> "kd-edits:"
     · KNOWN_PATHS   this site's three routes
     · THE KEY FORMAT. Positional `tag:nth-of-type(n)` DOM paths are
       gone; an edit_key is now a declared named slot read straight off
       a `data-edit` attribute. See the long note at RE_EDIT_KEY — that
       change is the whole reason this was ported before any markup was
       written, and it is a migration rather than an edit once the table
       has rows in it.

   Everything else, including every comment, is the original.
   ============================================================ */
/* ============================================================
   Inline editing — the rules, in one place
   ------------------------------------------------------------
   Imported by BOTH sides of the feature:

     · the API routes in src/pages/api/content*        (server)
     · src/scripts/inline-edit.js                      (browser)

   That is the whole point of this file. What the browser will let you
   click into and what the server will let you save must never disagree,
   so both answers are computed from the rules here rather than from two
   copies that drift apart.

   WHAT IS CHECKED, as of the owner's decision on 13 Aug 2026:

     · the page is one of KNOWN_PATHS
     · the edit_key is shaped like a key we generated
     · the text is non-empty, and no longer than MAX_TEXT
     · the text is stripped of markup and control characters

   That is all. There is deliberately NO check on what the text SAYS.
   Until 13 Aug 2026 this file also carried a denylist that locked any
   string shaped like a figure off an official document — prices, RERA
   numbers, phone numbers, measurements. The owner asked for it gone, so
   it is gone: every run of copy on an editable page is now editable by
   anyone who loads the page, because this feature has no login.

   Keep this file free of server-only imports (no mysql2, no node:*): it
   is bundled into the client script.

   The character classes are built with new RegExp("...\\uXXXX...") on
   purpose. Several rules turn on characters you cannot see (nbsp,
   zero-width joiners) or cannot tell apart on screen (hyphen vs en dash
   vs minus); a literal one pasted into a regex is a silent bug.
   ============================================================ */

/** Longest text we will store, in characters. */
export const MAX_TEXT = 2000;

/** localStorage key prefix for the per-page edit cache. */
export const CACHE_PREFIX = "kd-edits:";

/* ------------------------------------------------------------
   Which pages may be edited
   ------------------------------------------------------------
   Hardcoded from src/pages rather than derived at runtime, so a stray
   `path` in a POST body can never reach the database.

   THE SITE IA IS EXACTLY THESE THREE. /about and /projects have no
   design yet and are not built; they are listed because the keys for
   them are already reserved by the naming rule (`about.*`,
   `projects.*`) and a page arriving later should not need this file
   edited to become editable. Add a page here when you add one to
   src/pages, and nowhere else.
   ------------------------------------------------------------ */
export const KNOWN_PATHS: readonly string[] = [
  "/",
  "/about",
  "/projects",
];

const KNOWN_PATH_SET = new Set(KNOWN_PATHS);

/**
 * Reduce a pathname to the single form we store: lower case, no query,
 * no hash, no trailing slash (except the root). "/About/" -> "/about".
 * Returns null if the result is not an editable page.
 */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let p = raw.trim();
  if (!p) return null;

  // Tolerate a full URL as well as a bare pathname.
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname;
    } catch {
      return null;
    }
  }
  p = p.split("?")[0].split("#")[0].toLowerCase();
  if (!p.startsWith("/")) return null;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  if (p === "") p = "/";

  return KNOWN_PATH_SET.has(p) ? p : null;
}

/* ------------------------------------------------------------
   Text normalisation
   ------------------------------------------------------------
   Prerendered HTML wraps copy across source lines, so the same sentence
   is "Homes that\n      grow" in the markup and "Homes that grow" on the
   screen. Both sides funnel every string through this before comparing
   or storing, so "does this element still hold the original text?" has
   one answer rather than two.
   ------------------------------------------------------------ */
const RE_NBSP = new RegExp("\\u00a0", "g");
const RE_ZERO_WIDTH = new RegExp("[\\u200b-\\u200d\\ufeff]", "g");

/** Control characters — but NOT \t \r \n, which are folded to spaces
    below rather than deleted, which would glue two words together. */
const RE_CONTROL = new RegExp(
  "[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]",
  "g"
);

export function normalizeText(raw: unknown): string {
  return String(raw ?? "")
    .replace(RE_NBSP, " ")
    .replace(RE_ZERO_WIDTH, "") // zero-width junk arrives with pasted text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Remove any markup. We store plain text and render it via textContent. */
export function stripTags(raw: unknown): string {
  return String(raw ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(RE_CONTROL, "");
}

/** stripTags + normalizeText: the form everything is judged in. */
export function cleanText(raw: unknown): string {
  return normalizeText(stripTags(raw));
}

/* ------------------------------------------------------------
   edit_key — A DECLARED NAMED SLOT
   ------------------------------------------------------------
   THIS IS THE ONE DELIBERATE DEPARTURE FROM NESTING TREE, and it is
   the reason the port happened before any markup was written.

   Nesting Tree keys an edit POSITIONALLY: the client walks up from the
   element to <body> and spells a path of `tag:nth-of-type(n)` segments
   against the rendered document. It works, and it is fragile in two
   ways that compound.

     · Any markup change renumbers the path. Wrap a section in a new
       <div>, move a paragraph, add a <br>, and every key below it now
       names a different element.
     · Any copy edit orphans the row's anchor. The row is filed under
       the text the page was BUILT with, and when that source text is
       rewritten the anchor names a string that is nowhere on the page,
       so the edit stops painting — silently, for everyone.

   Eighty-six of Nesting Tree's keys ended up inert that way, and by
   the time it was noticed the table had 350 rows in it. Migrating them
   meant a one-off re-anchoring script and a lot of guessing.

   K.D. uses a key the author writes down instead:

       <h1 data-edit="home.hero.headline">{copy.home.hero.headline}</h1>

   The key IS the string `home.hero.headline`. It is stored as-is, it
   is not computed from anything, and it survives the section around it
   being rewritten, re-wrapped, reordered or re-worded. `original_text`
   is still recorded, but as an audit note — what the page said when
   the edit was made — never as the thing the client matches on.

   The rule that keeps it honest: the key mirrors the copy object's
   path, with the page as its first segment. `copy.hero.headline` on the
   homepage is `home.hero.headline`. See DESIGN-SYSTEM.md §9.

   The server still never builds a key, and still refuses anything not
   shaped like one — the value goes back out to other visitors'
   browsers as a querySelector argument, so its character set is
   deliberately narrow: lower-case alphanumerics and hyphens within a
   segment, dots between segments, at least two segments. Nothing in
   that set needs escaping in an attribute selector.
   ------------------------------------------------------------ */
export const MAX_KEY = 512;

const KEY_SEGMENT = "[a-z0-9]+(?:-[a-z0-9]+)*";
export const RE_EDIT_KEY = new RegExp(
  "^" + KEY_SEGMENT + "(?:\\." + KEY_SEGMENT + ")+$"
);

export function isValidKey(raw: unknown): raw is string {
  return (
    typeof raw === "string" &&
    raw.length > 0 &&
    raw.length <= MAX_KEY &&
    RE_EDIT_KEY.test(raw)
  );
}

/* ------------------------------------------------------------
   Where an edit came from
   ------------------------------------------------------------
   Nobody logs in to edit this site, so the address and the user agent
   are the only record of who changed a line. That makes them audit
   data, and audit data has to be either true or absent — a wrong
   address is worse than none, so anything that does not parse is
   stored as NULL rather than as the raw string or a placeholder.

   The address arrives in X-Forwarded-For, which nginx sets. That header
   is a list: nginx appends the connecting address to whatever the client
   already sent, so a client can put anything it likes in front of it.
   The first entry is the closest thing to the real origin, and it is
   entirely attacker-controlled, which is why it is parsed rather than
   trusted. If it is not an address, we fall back to the socket address,
   which cannot be forged.

   These run server-side only, but they live here because this module is
   the one both halves share; nothing in them touches node:*, so the
   client bundle can still tree-shake them away.
   ------------------------------------------------------------ */

/** Longest an IPv6 address can print, which is what the column holds. */
const MAX_IP = 45;

/** Strict dotted quad. Leading zeros are rejected: "010" is ambiguous
    (octal to some parsers, decimal to others) and never appears in a
    header written by nginx. */
const RE_IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const RE_HEX_GROUP = /^[0-9a-f]{1,4}$/;

/** Split one side of a "::" into its groups; null if a stray colon
    left an empty one, as in ":1" or "1:". */
function ipv6Groups(part: string): string[] | null {
  if (part === "") return [];
  const groups = part.split(":");
  for (const g of groups) if (g === "") return null;
  return groups;
}

function isIPv6(raw: string): boolean {
  const s = raw.toLowerCase();
  if (s.length < 2 || s.length > MAX_IP) return false;
  if (!/^[0-9a-f:.]+$/.test(s)) return false;

  const halves = s.split("::");
  if (halves.length > 2) return false;
  const compressed = halves.length === 2;

  const head = ipv6Groups(halves[0]);
  const tail = compressed ? ipv6Groups(halves[1]) : [];
  if (head === null || tail === null) return false;

  const groups = head.concat(tail);
  let count = groups.length;

  // A trailing dotted quad ("::ffff:127.0.0.1") stands in for two groups.
  const last = groups[groups.length - 1];
  if (last !== undefined && last.includes(".")) {
    if (!RE_IPV4.test(last)) return false;
    count += 1;
    for (const g of groups.slice(0, -1))
      if (!RE_HEX_GROUP.test(g)) return false;
  } else {
    for (const g of groups) if (!RE_HEX_GROUP.test(g)) return false;
  }

  // "::" stands for at least one omitted group, so a compressed address
  // is short by definition; an uncompressed one must be all eight.
  return compressed ? count <= 7 : count === 8;
}

/**
 * An address we are willing to write down, or null.
 * IPv4-mapped IPv6 ("::ffff:203.0.113.4") is folded to its IPv4 form, so
 * the same visitor reads the same way whether they arrived over IPv4 or
 * a dual-stack socket.
 */
export function validIp(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s || s.length > MAX_IP) return null;

  // A bracketed literal, as in "[::1]".
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1);

  if (RE_IPV4.test(s)) return s;
  if (!isIPv6(s)) return null;

  const mapped = /^::ffff:(.+)$/i.exec(s);
  if (mapped && RE_IPV4.test(mapped[1])) return mapped[1];
  return s.toLowerCase();
}

/**
 * The address to file an edit under: the first entry of X-Forwarded-For
 * if it parses, otherwise the socket address, otherwise nothing.
 */
export function clientIpFrom(
  request: Request,
  clientAddress?: string | null
): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = validIp(forwarded.split(",")[0]);
    if (first) return first;
  }
  return validIp(clientAddress);
}

/** The User-Agent, trimmed to what the column holds, or null. */
export function userAgentFrom(request: Request): string | null {
  const ua = request.headers.get("user-agent");
  if (!ua) return null;
  const clean = ua.replace(RE_CONTROL, "").trim();
  return clean ? clean.slice(0, 255) : null;
}

/* ------------------------------------------------------------
   One validation pass, shared by every write route
   ------------------------------------------------------------ */
export interface EditInput {
  path?: unknown;
  key?: unknown;
  original?: unknown;
  text?: unknown;
}

export type EditCheck =
  | { ok: true; path: string; key: string; original: string; text: string }
  | { ok: false; reason: string };

export function validateEdit(input: EditInput): EditCheck {
  const path = normalizePath(input.path);
  if (!path) return { ok: false, reason: "That page cannot be edited." };

  if (!isValidKey(input.key))
    return { ok: false, reason: "Could not identify the text on the page." };
  const key = String(input.key);

  const original = cleanText(input.original);
  const text = cleanText(input.text);

  if (!original) return { ok: false, reason: "The original text is missing." };
  if (original.length > MAX_TEXT)
    return { ok: false, reason: "That block of text is too long to edit." };

  if (!text) return { ok: false, reason: "Text cannot be empty." };
  if (text.length > MAX_TEXT)
    return { ok: false, reason: `Keep it under ${MAX_TEXT} characters.` };

  // Note there is no "text === original" check here. `original` is the
  // text the page was BUILT with, not necessarily what it says now, so
  // typing a page's own words back into a twice-edited element is a
  // real change. Only the route knows the current value, so the route
  // makes that call.
  return { ok: true, path, key, original, text };
}
