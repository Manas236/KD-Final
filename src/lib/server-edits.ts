/* ============================================================
   Saved edits, written into the page on the server (27 Oct 2026)
   ------------------------------------------------------------
   Until this date a saved edit (content_edits) reached the page only in
   the browser: the head script in BaseLayout.astro fetched
   /api/content and wrote each edit onto its slot after the page had
   loaded. So everything that reads the HTML without running it, a
   WhatsApp or LinkedIn preview, a search engine's first read, a visitor
   with JavaScript off, saw the text the site was built with, not the
   text Sir had saved.

   Now src/middleware.ts hands every editable page through here before
   it is sent:

     1. editsForPage(): the latest row per key for the page, the same
        query GET /api/content runs (SELECT_LATEST, below, which that
        route imports), from a small in-process cache.
     2. applySavedEdits(): the page is parsed with parse5 (the HTML
        parser of the spec, so the tree is the one a browser builds) and
        each edit is written with ntApplyCore() from ./edit-apply.js,
        which is the browser's own apply function, the same source the
        head script runs. Only the slot's text and its data-nt-*
        attributes change; every other byte of the page is left as it
        was rendered.

   THE RULES ARE THE BROWSER'S, by construction: latest row per key; a
   key is written only onto the first element in <body> carrying it, and
   only while that element is a text leaf, so a retired key (its card off
   the page) writes nothing, here as there.

   META. A page whose <title>, og:title, meta description or
   og:description is drawn from a field that is also an edit slot names
   that slot's key on the tag (`data-nt-from`, BaseLayout's
   `editSources`): the project pages' titles, and the description of a
   project page that uses its first paragraph. When that key's edit is
   written, the tag's text follows it. Every other page's meta is its own
   copy, which no edit reaches, and stays as it is.

   THE BROWSER DOES NOT WRITE IT AGAIN. Each slot written here carries
   `data-nt-server`; the head script's read path skips those and still
   applies any edit the server did not (BaseLayout.astro, applyAll). The
   editor is untouched: the attributes it reads (data-nt-original,
   -key, -edited) are exactly the ones the browser would have set.

   THE CACHE. One entry per page, the edits only (never the HTML: pages
   such as /careers and the project pages render database rows of their
   own on every request). Dropped the moment an edit is saved or undone
   through the API (forgetEdits(), called by POST /api/content and
   /api/content/revert), so a save shows on the next page load. A row
   written any other way (by hand on the server) shows within TTL_MS.
   It is per process: the site runs as one Node process.

   NO DATABASE, NO CHANGE. If the query fails or takes longer than
   TIMEOUT_MS, the page is sent with its built-in text, exactly as before
   this existed, one line goes to the log, and the browser's read path
   applies whatever it can fetch. Never a 500. SERVER_EDITS=0 in .env
   turns the whole thing off, read at request time like SITE_NOINDEX.
   ============================================================ */
import "dotenv/config"; // as src/lib/db.ts and src/lib/staging.ts do
import { parse } from "parse5";
import type { DefaultTreeAdapterTypes } from "parse5";
import type { RowDataPacket } from "mysql2";
import pool from "./db";
import { normalizeText } from "./editable";
import { ntApplyCore } from "./edit-apply.js";

type ParentNode = DefaultTreeAdapterTypes.ParentNode;
type Element = DefaultTreeAdapterTypes.Element;
type TextNode = DefaultTreeAdapterTypes.TextNode;
type CommentNode = DefaultTreeAdapterTypes.CommentNode;

/* The latest row per edit_key for one page: the highest id is current.
   Columns named one by one, never client_ip or user_agent: the API sends
   this to the browser. GET /api/content runs this same string. */
export const SELECT_LATEST = `
  SELECT e.id, e.edit_key, e.original_text, e.new_text
    FROM content_edits e
    JOIN (
      SELECT edit_key, MAX(id) AS max_id
        FROM content_edits
       WHERE page_path = ?
       GROUP BY edit_key
    ) latest ON latest.max_id = e.id
`;

export interface SavedEdit {
  text: string;
  original: string;
  id: number;
}
export type SavedEdits = Record<string, SavedEdit>;

/** key -> latest edit, uncached. Throws if the database does. */
export async function readLatest(path: string): Promise<SavedEdits> {
  const [rows] = await pool.execute<RowDataPacket[]>(SELECT_LATEST, [path]);
  const edits: SavedEdits = {};
  for (const row of rows) {
    edits[row.edit_key] = { text: row.new_text, original: row.original_text, id: row.id };
  }
  return edits;
}

export function serverEditsEnabled(): boolean {
  return (process.env.SERVER_EDITS ?? "").trim() !== "0";
}

/* ------------------------------------------------------------
   The cache
   ------------------------------------------------------------ */
const TTL_MS = 60_000;
const TIMEOUT_MS = 1_000;

const cache = new Map<string, { at: number; edits: SavedEdits }>();
/* Bumped by forgetEdits(). A read that was already under way when an
   edit was saved finishes with the rows from before the save; it may
   answer its own request, but it must not go back into the cache. */
const generation = new Map<string, number>();

/** Drop a page's cached edits: called after every save and undo. */
export function forgetEdits(path: string): void {
  cache.delete(path);
  generation.set(path, (generation.get(path) ?? 0) + 1);
}

/** The page's saved edits, or null when the database cannot say. */
export async function editsForPage(path: string): Promise<SavedEdits | null> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.edits;

  const gen = generation.get(path) ?? 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const edits = await Promise.race([
      readLatest(path),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`no answer in ${TIMEOUT_MS} ms`)), TIMEOUT_MS);
      }),
    ]);
    if ((generation.get(path) ?? 0) === gen) cache.set(path, { at: Date.now(), edits });
    return edits;
  } catch (err) {
    const why = (err as { code?: string; message?: string })?.code ?? (err as Error)?.message ?? String(err);
    console.error(`server-edits: ${path}: saved edits not read (${why}); built-in text sent`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------
   Writing the edits into the HTML
   ------------------------------------------------------------ */
const attrOf = (el: Element, name: string): string | null =>
  el.attrs.find((a) => a.name === name)?.value ?? null;

function childElement(parent: ParentNode | undefined, name: string): Element | undefined {
  return parent?.childNodes.find((n): n is Element => n.nodeName === name);
}

/** Every element under `root`, in document order. <template> contents
    are not children in parse5's tree, as they are not in the browser's
    querySelector, so they are not walked either. */
function walk(root: ParentNode, visit: (el: Element) => void): void {
  for (const node of root.childNodes) {
    if (!("tagName" in node)) continue;
    visit(node);
    walk(node, visit);
  }
}

/* data-nt-original <-> dataset.ntOriginal, as the browser maps them. */
const dataAttr = (prop: string) => "data-" + prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

/** One element, seen through the few DOM members ntApplyCore() uses.
    Writes are recorded, not made: the tree is only read, and the
    recorded changes are spliced into the HTML string afterwards. */
class Slot {
  readonly sets = new Map<string, string>();
  text: string | undefined;
  readonly dataset: Record<string, string | undefined>;

  constructor(readonly node: Element) {
    this.dataset = new Proxy({} as Record<string, string | undefined>, {
      get: (_, prop) => (typeof prop === "string" ? this.getAttribute(dataAttr(prop)) ?? undefined : undefined),
      set: (_, prop, value) => {
        this.setAttribute(dataAttr(String(prop)), value);
        return true;
      },
    });
  }

  get childNodes() {
    return this.node.childNodes;
  }

  get firstChild() {
    const c = this.node.childNodes[0];
    if (!c) return null;
    if (c.nodeName === "#text") return { nodeType: 3, nodeValue: (c as TextNode).value };
    if (c.nodeName === "#comment") return { nodeType: 8, nodeValue: (c as CommentNode).data };
    return { nodeType: 1, nodeValue: null };
  }

  getAttribute(name: string): string | null {
    return this.sets.has(name) ? this.sets.get(name)! : attrOf(this.node, name);
  }

  setAttribute(name: string, value: unknown): void {
    this.sets.set(name, String(value));
  }

  hasAttribute(name: string): boolean {
    return this.getAttribute(name) !== null;
  }

  set textContent(value: string) {
    this.text = String(value);
  }
}

const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

interface Cut {
  from: number;
  to: number;
  text: string;
}

/** The changes recorded on one element, as cuts in the source string. */
function cutsFor(page: string, node: Element, sets: Map<string, string>, text: string | undefined): Cut[] {
  const loc = node.sourceCodeLocation!;
  const tag = loc.startTag!;
  const cuts: Cut[] = [];
  let added = "";
  for (const [name, value] of sets) {
    const at = loc.attrs?.[name];
    const written = `${name}="${escapeAttr(value)}"`;
    if (at) cuts.push({ from: at.startOffset, to: at.endOffset, text: written });
    else added += " " + written;
  }
  if (added) {
    // Before the start tag's closing ">" (or "/>").
    let at = tag.endOffset - 1;
    if (page.charAt(at - 1) === "/") at -= 1;
    cuts.push({ from: at, to: at, text: added });
  }
  if (text !== undefined) {
    const t = node.childNodes[0].sourceCodeLocation!;
    cuts.push({ from: t.startOffset, to: t.endOffset, text: escapeText(text) });
  }
  return cuts;
}

/** Has a source position for everything a write would replace. */
function locatable(el: Element): boolean {
  const first = el.childNodes[0];
  return Boolean(el.sourceCodeLocation?.startTag && (!first || first.sourceCodeLocation));
}

/**
 * Write a page's saved edits into its HTML. Returns the page and the keys
 * written. Keys not written here (no slot, not a leaf) are left for the
 * browser, which will not write them either, by the same rule.
 */
export function applySavedEdits(page: string, edits: SavedEdits): { html: string; applied: string[] } {
  /* Cheap first: a key that is not in the markup at all cannot be
     written, and most pages have no edits that are. Astro always writes
     the attribute as data-edit="<key>", and a key needs no escaping. */
  const keys = Object.keys(edits).filter((key) => page.includes(`data-edit="${key}"`));
  if (!keys.length) return { html: page, applied: [] };

  const doc = parse(page, { sourceCodeLocationInfo: true });
  const root = childElement(doc, "html");
  const head = childElement(root, "head");
  const body = childElement(root, "body");
  if (!body) return { html: page, applied: [] };

  // The first element in <body> per key: document.body.querySelector().
  const first = new Map<string, Element>();
  walk(body, (el) => {
    const key = attrOf(el, "data-edit");
    if (key !== null && !first.has(key)) first.set(key, el);
  });

  const slots = new Map<Element, Slot>();
  const find = (key: string): Slot | null => {
    const el = first.get(key);
    if (!el || !locatable(el)) return null;
    let slot = slots.get(el);
    if (!slot) slots.set(el, (slot = new Slot(el)));
    return slot;
  };
  const core = ntApplyCore(find, normalizeText);

  const applied: string[] = [];
  const before = new Map<string, string>(); // key -> the built text it replaced
  for (const key of keys) {
    const edit = edits[key];
    const slot = core.applyOne(key, edit.text, edit.original) as Slot | null;
    if (!slot) continue;
    slot.setAttribute("data-nt-server", "");
    applied.push(key);
    before.set(key, normalizeText((slot.node.childNodes[0] as TextNode).value));
  }
  if (!applied.length) return { html: page, applied };

  const cuts: Cut[] = [];
  for (const slot of slots.values()) {
    if (slot.text === undefined && !slot.sets.size) continue;
    cuts.push(...cutsFor(page, slot.node, slot.sets, slot.text));
  }

  /* Meta drawn from a slot that was just written (see the header). */
  if (head) {
    walk(head, (el) => {
      const key = attrOf(el, "data-nt-from");
      const was = key === null ? undefined : before.get(key);
      if (key === null || was === undefined) return;
      const now = normalizeText(edits[key].text);
      if (el.nodeName === "title") {
        const t = el.childNodes[0] as TextNode | undefined;
        if (!t?.sourceCodeLocation) return;
        const value = normalizeText(t.value);
        if (value.includes(was)) {
          cuts.push({
            from: t.sourceCodeLocation.startOffset,
            to: t.sourceCodeLocation.endOffset,
            text: escapeText(value.replace(was, () => now)),
          });
        }
      } else if (el.nodeName === "meta") {
        const content = attrOf(el, "content");
        const at = el.sourceCodeLocation?.attrs?.content;
        if (content === null || !at) return;
        const value = normalizeText(content);
        if (value.includes(was)) {
          cuts.push({ from: at.startOffset, to: at.endOffset, text: `content="${escapeAttr(value.replace(was, () => now))}"` });
        }
      }
    });
  }

  cuts.sort((a, b) => b.from - a.from || b.to - a.to);
  let out = page;
  for (const cut of cuts) out = out.slice(0, cut.from) + cut.text + out.slice(cut.to);
  return { html: out, applied };
}

/**
 * The response with the page's saved edits in its HTML, or the response
 * untouched when there are none to write (and then it still streams).
 * `pending` is editsForPage() for the page's path.
 */
export async function withSavedEdits(
  response: Response,
  path: string,
  pending: Promise<SavedEdits | null>
): Promise<Response> {
  const edits = await pending;
  if (!edits || !Object.keys(edits).length) return response;

  const page = await response.text();
  let out = page;
  try {
    out = applySavedEdits(page, edits).html;
  } catch (err) {
    console.error(`server-edits: ${path}: edits not written (${(err as Error)?.message ?? err}); built-in text sent`);
  }
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(out, { status: response.status, statusText: response.statusText, headers });
}
