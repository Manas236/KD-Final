/* ============================================================
   Enquiries from /contact: server side (12 Nov 2026)
   ------------------------------------------------------------
   The enquiry form on /contact posts to /api/enquiry (as JSON from its
   script, or as a plain form without JavaScript). receiveEnquiry() below
   is the whole of what happens to one, in this order:

     1. Spam: the honeypot (`website`, a field people never see) or a
        form sent less than MIN_FILL_MS after the page was served (the
        signed time in `t`) is answered exactly as a real enquiry is,
        and nothing is saved or sent.
     2. The rate limit: ENQUIRY_RATE_PER_HOUR from one address (5 when
        unset), DAY_LIMIT a day from everyone. Counted before the fields
        are checked, so a script cannot try endlessly. The sender is told.
     3. The fields (src/lib/enquiry-rules.ts, the browser's own rules).
     4. Saved: one row in `enquiries`, created by db/migrate.sql, never by
        the app. kd_app has INSERT and SELECT on it and UPDATE of
        mail_status alone, so the app can never change or delete one.
     5. Only then emailed, through Resend (src/lib/enquiry-mail.ts), which
        records the result in mail_status. The email never changes the
        answer: it gives up after 10 s and never throws.

   THE SENDER'S ADDRESS IS NOT STORED. `ip_hash` is a keyed hash of it
   (HMAC-SHA256 under a key drawn from EDIT_SECRET), enough to see that
   two enquiries came from one address, not to recover it. The rate limit
   counts raw addresses in memory only, and forgets them within the hour.

   THE TIME TOKEN. /contact writes `t` into its form when it renders: the
   time in ms and an HMAC of it, so a script cannot claim to have opened
   the form earlier than it did. A missing, forged or too-young token is
   step 1's "looks automated". There is no upper age: a form left open
   overnight is still a person's. The key comes from EDIT_SECRET
   (required on every install, src/lib/edit-auth.ts), so it survives a
   restart and a page served before one still sends.

   Server-only: database pool and node:crypto.
   ============================================================ */
import "dotenv/config";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "./db";
import { checkEnquiry, type EnquiryField, type EnquiryValues } from "./enquiry-rules";
import { readMailStatus, type MailState } from "./applications";
import { mailEnquiry } from "./enquiry-mail";

/** A person needs longer than this to fill four fields and 20 characters. */
export const MIN_FILL_MS = 3000;

const DAY_LIMIT = 200;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/* ------------------------------------------------------------
   Keys
   ------------------------------------------------------------ */
let fallbackSecret: string | null = null;

function rootSecret(): string {
  const s = (process.env.EDIT_SECRET ?? "").trim();
  if (s) return s;
  if (!fallbackSecret) {
    fallbackSecret = randomBytes(32).toString("hex");
    console.error("enquiry: EDIT_SECRET is empty; using a key that lasts until the next restart");
  }
  return fallbackSecret;
}

function keyFor(purpose: string): Buffer {
  return createHmac("sha256", rootSecret()).update(`kd-enquiry:${purpose}`).digest();
}

/* ------------------------------------------------------------
   The time token
   ------------------------------------------------------------ */
function sign(ms: number): string {
  return createHmac("sha256", keyFor("form-time")).update(String(ms)).digest().subarray(0, 16).toString("base64url");
}

/** The value /contact writes into the form's hidden `t` field. */
export function formToken(now = Date.now()): string {
  return `${now}.${sign(now)}`;
}

/** Why a token does not pass, or null when it does. */
export function tokenProblem(raw: unknown, now = Date.now()): string | null {
  const m = /^(\d{13})\.([A-Za-z0-9_-]{22})$/.exec(String(raw ?? ""));
  if (!m) return "no time token";
  const ms = Number(m[1]);
  const given = Buffer.from(m[2]);
  const wanted = Buffer.from(sign(ms));
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return "time token does not verify";
  if (ms > now + 60_000) return "time token from the future";
  if (now - ms < MIN_FILL_MS) return "sent too fast";
  return null;
}

/* ------------------------------------------------------------
   The sender's address
   ------------------------------------------------------------ */
export function ipHash(ip: string | null): string | null {
  return ip ? createHmac("sha256", keyFor("ip")).update(ip).digest("hex") : null;
}

/** ENQUIRY_RATE_PER_HOUR, read at request time; 5 when unset or not a number. */
export function perHourLimit(): number {
  const n = Number.parseInt((process.env.ENQUIRY_RATE_PER_HOUR ?? "").trim(), 10);
  return Number.isFinite(n) && n >= 1 && n <= 1000 ? n : 5;
}

const recent = new Map<string, number[]>();
let daily: number[] = [];

/** Counts this request; true when it is over a limit (and then not counted). */
function rateLimited(key: string): boolean {
  const now = Date.now();
  daily = daily.filter((t) => now - t < DAY_MS);
  const list = (recent.get(key) ?? []).filter((t) => now - t < HOUR_MS);
  recent.set(key, list);
  if (list.length >= perHourLimit() || daily.length >= DAY_LIMIT) return true;
  list.push(now);
  daily.push(now);
  // Keep the map from growing without bound on a busy day.
  if (recent.size > 5000) for (const [k, v] of recent) if (!v.length) recent.delete(k);
  return false;
}

/* ------------------------------------------------------------
   One enquiry
   ------------------------------------------------------------ */
export type Outcome =
  | { readonly kind: "saved"; readonly id: number }
  /** Looked automated: answered as "saved", nothing kept or sent. */
  | { readonly kind: "dropped"; readonly why: string }
  | { readonly kind: "limited" }
  | { readonly kind: "invalid"; readonly fields: readonly EnquiryField[] }
  | { readonly kind: "error" };

export async function receiveEnquiry(
  input: Record<string, unknown>,
  ip: string | null,
  userAgent: string | null
): Promise<Outcome> {
  const why = String(input.website ?? "").trim() ? "honeypot filled" : tokenProblem(input.t);
  if (why) {
    console.log(`enquiry: not saved, it looked automated (${why})`);
    return { kind: "dropped", why };
  }

  if (rateLimited(ip ?? "unknown")) {
    console.log("enquiry: refused, over the rate limit");
    return { kind: "limited" };
  }

  const { values, invalid } = checkEnquiry(input);
  if (invalid.length) return { kind: "invalid", fields: invalid };

  const at = new Date();
  let id: number;
  try {
    const [saved] = await pool.execute<ResultSetHeader>(
      `INSERT INTO enquiries (name, company, phone, email, message, ip_hash, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [values.name, values.company || null, values.phone, values.email, values.message, ipHash(ip), userAgent]
    );
    id = saved.insertId;
  } catch (err) {
    console.error("Failed to record an enquiry:", err);
    return { kind: "error" };
  }

  // Saved: now the email. Bounded at 10 s and never throws; the catch is
  // only a second guard, so the answer is the same either way.
  await mailEnquiry({ id, at, ...values }).catch(() => undefined);
  return { kind: "saved", id };
}

/* ------------------------------------------------------------
   Reading them back: /studio/enquiries
   ------------------------------------------------------------ */
export interface Enquiry extends EnquiryValues {
  readonly id: number;
  readonly at: Date;
  readonly mail: MailState;
}

export async function listEnquiries(limit = 500): Promise<Enquiry[] | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, company, phone, email, message, mail_status, created_at
         FROM enquiries ORDER BY id DESC LIMIT ?`,
      [limit]
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      company: r.company ?? "",
      phone: r.phone,
      email: r.email,
      message: r.message,
      mail: readMailStatus(r.mail_status, false),
      at: new Date(r.created_at),
    }));
  } catch (err) {
    console.error("Failed to read enquiries:", err);
    return null;
  }
}
