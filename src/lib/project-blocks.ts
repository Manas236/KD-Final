/* ============================================================
   Text blocks on project pages — server side
   ------------------------------------------------------------
   A signed-in editor can add a heading or a paragraph to any
   /projects/<slug> page, in edit mode, below the page's own overview
   text (src/scripts/project-blocks-editor.js → src/pages/api/project-blocks.ts).
   Added 8 Oct 2026 at the owner's request.

   Stored in project_text_events (db/schema.sql), which is APPEND-ONLY
   like every other table here:

     add     a row with action = 'add'; its own id IS the block id
     remove  action = 'remove', block_id = that id
     move    action = 'move', block_id, position = its new index

   The blocks on a page = its 'add' rows in id order, minus the removed
   ones, with the moves replayed over them.

   A block's WORDING is changed like any other text on the site: it is
   an ordinary editable element under the key projects.blocks.<id>, so
   its edits and their history live in content_edits.

   The table is created on first use if it does not exist, so a deploy
   needs no manual migration step. If that fails (no CREATE privilege),
   run the statement in db/schema.sql by hand; until then the pages show
   no blocks and adding one says so.

   Server-only: this imports the database pool.
   ============================================================ */
import type { RowDataPacket } from "mysql2";
import pool from "./db";
import { MAX_TEXT, cleanText } from "./editable";
import { getProjectDetail } from "../data/project-detail";
import { getSocialPage } from "../data/social-projects";

export type BlockKind = "heading" | "paragraph";

export interface TextBlock {
  readonly id: number;
  readonly kind: BlockKind;
  readonly text: string;
}

export const MAX_HEADING = 160;

/* Kept identical to db/schema.sql. */
const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS project_text_events (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    action        ENUM('add', 'remove', 'move') NOT NULL,
    page_slug     VARCHAR(160)  NOT NULL,
    block_id      INT           NULL,
    kind          ENUM('heading', 'paragraph') NULL,
    text          TEXT          NULL,
    position      INT           NULL,
    client_ip     VARCHAR(45)   NULL,
    user_agent    VARCHAR(255)  NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (page_slug)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
`;

let ready: Promise<void> | null = null;

/** Create the table once per process. A failure is retried on the next
    call rather than remembered, in case it was the connection. */
export function ensureTable(): Promise<void> {
  if (!ready) {
    ready = pool
      .query(CREATE_TABLE)
      .then(() => undefined)
      .catch((err) => {
        ready = null;
        throw err;
      });
  }
  return ready;
}

/** Whether `slug` is a project page this route serves. */
export function isProjectSlug(slug: unknown): slug is string {
  return typeof slug === "string" && !!(getProjectDetail(slug) || getSocialPage(slug));
}

interface Row {
  id: number;
  action: "add" | "remove" | "move";
  block_id: number | null;
  kind: BlockKind | null;
  text: string | null;
  position: number | null;
}

const SELECT_EVENTS = `
  SELECT id, action, block_id, kind, text, position
    FROM project_text_events
   WHERE page_slug = ?
   ORDER BY id ASC
`;

/** Replay one page's rows into its blocks, in page order. */
export function replayBlocks(rows: readonly Row[]): TextBlock[] {
  const list: TextBlock[] = [];
  for (const r of rows) {
    if (r.action === "add" && r.kind && r.text) {
      list.push({ id: r.id, kind: r.kind, text: r.text });
    } else if (r.action === "remove") {
      const i = list.findIndex((b) => b.id === r.block_id);
      if (i >= 0) list.splice(i, 1);
    } else if (r.action === "move" && r.position != null) {
      const i = list.findIndex((b) => b.id === r.block_id);
      if (i < 0) continue;
      const [b] = list.splice(i, 1);
      list.splice(Math.max(0, Math.min(r.position, list.length)), 0, b);
    }
  }
  return list;
}

/** The blocks on one project page. Never throws: if the database cannot
    be read the page simply shows none, like /careers does. */
export async function blocksFor(slug: string): Promise<TextBlock[]> {
  try {
    await ensureTable();
    const [rows] = await pool.execute<RowDataPacket[]>(SELECT_EVENTS, [slug]);
    return replayBlocks(rows as Row[]);
  } catch (err) {
    console.error("Failed to read project text blocks:", err);
    return [];
  }
}

export type BlockCheck =
  | { ok: true; kind: BlockKind; text: string }
  | { ok: false; reason: string };

/** One validation pass for a new block. */
export function validateBlock(input: Record<string, unknown>): BlockCheck {
  const kind = input.kind;
  if (kind !== "heading" && kind !== "paragraph")
    return { ok: false, reason: "Choose a heading or a paragraph." };
  const text = cleanText(input.text);
  if (!text) return { ok: false, reason: "Type the text first." };
  const max = kind === "heading" ? MAX_HEADING : MAX_TEXT;
  if (text.length > max) return { ok: false, reason: `Keep it under ${max} characters.` };
  return { ok: true, kind, text };
}
