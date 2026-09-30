/* ============================================================
   Job postings on /careers — server side
   ------------------------------------------------------------
   Each open role is a card on /careers linking to its LinkedIn and/or
   Indeed post. The cards are added and removed from the page itself, in
   edit mode (src/scripts/careers-editor.js → src/pages/api/careers.ts),
   and stored in job_posting_events (db/schema.sql), which is
   append-only: a removal is a row of its own, never a DELETE.

   Server-only: this imports the database pool, so it must never reach
   a client bundle.
   ============================================================ */
import type { RowDataPacket } from "mysql2";
import pool from "./db";
import { cleanText } from "./editable";

export interface JobPosting {
  readonly id: number;
  readonly title: string;
  readonly details: string;
  readonly linkedin: string | null;
  readonly indeed: string | null;
}

export const MAX_TITLE = 120;
export const MAX_DETAILS = 200;
const MAX_URL = 500;

/* Newest first — a role just posted is the one a visitor is most
   likely to be looking for. */
const SELECT_OPEN = `
  SELECT a.id, a.title, a.details, a.linkedin_url, a.indeed_url
    FROM job_posting_events a
   WHERE a.action = 'add'
     AND NOT EXISTS (
       SELECT 1 FROM job_posting_events r
        WHERE r.action = 'remove' AND r.posting_id = a.id
     )
   ORDER BY a.id DESC
`;

/** The open postings, or null when the database cannot be reached — the
    page then shows its "no openings listed" card rather than failing. */
export async function openPostings(): Promise<JobPosting[] | null> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(SELECT_OPEN);
    return rows.map((r) => ({
      id: r.id,
      title: r.title ?? "",
      details: r.details ?? "",
      linkedin: r.linkedin_url || null,
      indeed: r.indeed_url || null,
    }));
  } catch (err) {
    console.error("Failed to read job postings:", err);
    return null;
  }
}

/* Where each link may point. Held to the two job sites so that an
   editor's typo — or a pasted link to somewhere else entirely — cannot
   put an arbitrary destination behind an "Apply" button. */
const HOSTS = {
  linkedin: ["linkedin.com", "lnkd.in"],
  indeed: ["indeed.com", "indeed.co.in"],
} as const;

export type JobSite = keyof typeof HOSTS;

/**
 * An https URL on the given job site, normalised; "" for a blank field;
 * null when it is not one.
 */
export function postingUrl(raw: unknown, site: JobSite): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (s.length > MAX_URL) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  url.protocol = "https:";
  const host = url.hostname.toLowerCase();
  const ok = HOSTS[site].some((d) => host === d || host.endsWith("." + d));
  return ok ? url.toString() : null;
}

export type PostingCheck =
  | { ok: true; title: string; details: string; linkedin: string | null; indeed: string | null }
  | { ok: false; reason: string };

/** One validation pass for a new posting. */
export function validatePosting(input: Record<string, unknown>): PostingCheck {
  const title = cleanText(input.title);
  const details = cleanText(input.details);
  if (!title) return { ok: false, reason: "Give the role a title." };
  if (title.length > MAX_TITLE)
    return { ok: false, reason: `Keep the title under ${MAX_TITLE} characters.` };
  if (details.length > MAX_DETAILS)
    return { ok: false, reason: `Keep the details under ${MAX_DETAILS} characters.` };

  const linkedin = postingUrl(input.linkedin, "linkedin");
  if (linkedin === null) return { ok: false, reason: "The LinkedIn link must be a linkedin.com address." };
  const indeed = postingUrl(input.indeed, "indeed");
  if (indeed === null) return { ok: false, reason: "The Indeed link must be an indeed.com address." };
  if (!linkedin && !indeed)
    return { ok: false, reason: "Add the LinkedIn link, the Indeed link, or both." };

  return { ok: true, title, details, linkedin: linkedin || null, indeed: indeed || null };
}
