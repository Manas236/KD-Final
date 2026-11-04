/* ============================================================
   The launch mode switch: read at request time, flipped from /studio
   ------------------------------------------------------------
   Until 4 Nov 2026 launch mode was a build flag (HIDE_PENDING), so going
   into it took a rebuild and a restart. Every page renders on request
   anyway, so the renderers can ask per request, and this is where they
   get the answer. What launch mode hides is still src/lib/launch.ts.

   THE TABLES (db/migrate.sql). The app's database user may only SELECT
   and INSERT, so site_settings is append-only like content_edits: a flip
   is a new row and the highest id per key is current. site_settings_events
   records each flip with the old value, the new one, the address and the
   browser. Both rows go in one transaction, so no flip is unlogged.

   FAILS TO OFF. No row, no table, no database, no grant, or no answer in
   TIMEOUT_MS: launch mode is off and the site is exactly what it was
   before this existed. One line goes to the log, only when the reason
   changes, and never a 500.

   THE CACHE. Each process keeps the answer for TTL_MS, so a page view
   costs at most one small query every few seconds. A flip drops it at once
   in the process that served the flip; a second process would follow
   within TTL_MS.
   ============================================================ */
import type { RowDataPacket } from "mysql2";
import pool from "./db";

const KEY = "launch_mode";
const TTL_MS = 5_000;
const TIMEOUT_MS = 1_000;

const SELECT_CURRENT = "SELECT value FROM site_settings WHERE `key` = ? ORDER BY id DESC LIMIT 1";

let complaint = "";
const reasonOf = (err: unknown) => (err as { code?: string })?.code ?? (err as Error)?.message ?? String(err);

async function read(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const [rows] = await Promise.race([
      pool.execute<RowDataPacket[]>(SELECT_CURRENT, [KEY]),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`no answer in ${TIMEOUT_MS} ms`)), TIMEOUT_MS);
      }),
    ]);
    complaint = "";
    return rows[0]?.value === "1";
  } catch (err) {
    const why = reasonOf(err);
    if (why !== complaint) console.error(`launch-switch: not read (${why}); launch mode off`);
    complaint = why;
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/* The promise is what is kept, so a burst of requests shares one query,
   and a flip cannot be undone by a read that was already under way. */
let cached: { at: number; on: Promise<boolean> } | null = null;

/** Is the switch on? Never throws, never takes much over TIMEOUT_MS. */
export function launchSwitchOn(): Promise<boolean> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.on;
  const on = read();
  cached = { at: Date.now(), on };
  return on;
}

export interface SwitchEvent {
  id: number;
  at: Date;
  from: string | null;
  to: string;
  ip: string | null;
  browser: string | null;
}

/** Flip it. Throws if the database refuses: the page says so. */
export async function setLaunchSwitch(on: boolean, ip: string | null, browser: string | null): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute<RowDataPacket[]>(SELECT_CURRENT, [KEY]);
    const value = on ? "1" : "0";
    await conn.execute("INSERT INTO site_settings (`key`, value) VALUES (?, ?)", [KEY, value]);
    await conn.execute(
      "INSERT INTO site_settings_events (`key`, old_value, new_value, client_ip, user_agent) VALUES (?, ?, ?, ?, ?)",
      [KEY, rows[0]?.value ?? null, value, ip, browser]
    );
    await conn.commit();
    cached = null;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

/** The latest flips, newest first, or null when they cannot be read. */
export async function switchEvents(limit = 50): Promise<SwitchEvent[] | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, created_at, old_value, new_value, client_ip, user_agent FROM site_settings_events WHERE `key` = ? ORDER BY id DESC LIMIT ?",
      [KEY, limit]
    );
    return rows.map((r) => ({ id: r.id, at: r.created_at, from: r.old_value, to: r.new_value, ip: r.client_ip, browser: r.user_agent }));
  } catch (err) {
    console.error(`launch-switch: log not read (${reasonOf(err)})`);
    return null;
  }
}
