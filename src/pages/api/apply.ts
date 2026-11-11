/* ============================================================
   POST /api/apply — a job application from /careers
   ------------------------------------------------------------
   PUBLIC: anyone can post here, so it is the one write endpoint without
   the edit session. Body (application/json, at most ~7 MB):

     { name, email, phone, role, message,
       website,              the honeypot — a field hidden from people;
                             a bot that fills it gets a quiet "ok" and
                             nothing is saved or sent
       elapsed,              ms between the form appearing and Send; under
                             2 s is a script, treated like the honeypot
       resume: { name, data } the file, base64, PDF / DOC / DOCX ≤ 5 MB }

   WHY JSON AND NOT A FORM POST: Astro refuses a multipart POST whose
   Origin does not match the URL it thinks it serves, which behind
   nginx/an HTTPS proxy is every request (see /api/gallery/upload). A
   resume of 5 MB is ~6.7 MB as base64, well inside nginx's limit that
   the gallery's 25 MB uploads already need.

   Limits: 5 applications an hour from one address, 200 a day in all —
   enough for any real hiring round, small enough that a script cannot
   fill the disk or HR's inbox.

   Order: rate, size, honeypot, fields, resume bytes, then store the
   file and INSERT the row (src/lib/applications.ts). If either fails the
   applicant is told so and nothing is emailed. Only once both are saved
   is HR emailed through Resend (src/lib/application-mail.ts), which
   records the result in the row's mail_status. The email never changes
   the answer: it gives up after 10 s, it never throws, and the applicant
   is told it worked whether it went, failed or was skipped. HR can see
   every application, and what happened to its email, in
   /studio/applications.
   ============================================================ */
import type { APIRoute } from "astro";
import type { ResultSetHeader } from "mysql2";
import pool from "../../lib/db";
import { clientIpFrom, userAgentFrom } from "../../lib/editable";
import {
  MAX_RESUME_BYTES,
  purgeExpired,
  sniffResume,
  storeResume,
  validateApplicant,
} from "../../lib/applications";
import { mailApplication } from "../../lib/application-mail";

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

const MAX_BODY = Math.ceil((MAX_RESUME_BYTES * 4) / 3) + 16 * 1024;

const PER_IP = 5;
const PER_IP_MS = 60 * 60 * 1000;
const PER_DAY = 200;
const DAY_MS = 24 * 60 * 60 * 1000;
const recent = new Map<string, number[]>();
let daily: number[] = [];

function rateLimited(key: string): boolean {
  const now = Date.now();
  daily = daily.filter((t) => now - t < DAY_MS);
  const list = (recent.get(key) ?? []).filter((t) => now - t < PER_IP_MS);
  recent.set(key, list);
  if (list.length >= PER_IP || daily.length >= PER_DAY) return true;
  list.push(now);
  daily.push(now);
  // Keep the map from growing without bound on a busy day.
  if (recent.size > 5000) for (const [k, v] of recent) if (!v.length) recent.delete(k);
  return false;
}

export const POST: APIRoute = async (context) => {
  const { request } = context;
  let socket: string | null = null;
  try {
    socket = context.clientAddress;
  } catch {
    socket = null;
  }
  const ip = clientIpFrom(request, socket);
  const ua = userAgentFrom(request);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY)
    return json({ error: "That file is too large. Please send a resume under 5 MB." }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY)
      return json({ error: "That file is too large. Please send a resume under 5 MB." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Could not read the application. Please try again." }, 400);
  }
  if (!body || typeof body !== "object")
    return json({ error: "Could not read the application. Please try again." }, 400);

  // Bots: answer as if it worked, keep nothing.
  if (String(body.website ?? "").trim() || Number(body.elapsed) < 2000) return json({ ok: true });

  if (rateLimited(ip ?? "unknown"))
    return json(
      { error: "We have received several applications from you already. Please try again later." },
      429
    );

  const check = validateApplicant(body);
  if (!check.ok) return json({ error: check.reason }, 400);

  const resume = body.resume as { name?: unknown; data?: unknown } | undefined;
  if (!resume || typeof resume.data !== "string" || !resume.data)
    return json({ error: "Please attach your resume." }, 400);
  const buf = Buffer.from(resume.data, "base64");
  if (buf.length > MAX_RESUME_BYTES)
    return json({ error: "That file is too large. Please send a resume under 5 MB." }, 413);
  const kind = sniffResume(buf);
  if (!kind) return json({ error: "Please attach your resume as a PDF or Word file." }, 400);
  const originalName = String(resume.name ?? "").slice(0, 255) || null;

  let file: string;
  try {
    file = await storeResume(buf, kind);
  } catch (err) {
    console.error("Failed to store a job application:", err);
    return json({ error: "Something went wrong on our side. Please try again, or email your CV." }, 500);
  }

  const { name, email, phone, role, message } = check;
  const at = new Date();
  let id: number;
  try {
    const [saved] = await pool.execute<ResultSetHeader>(
      `INSERT INTO job_applications
         (name, email, phone, role, message, resume_file, original_name, bytes, client_ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, role, message || null, file, originalName, buf.length, ip, ua]
    );
    id = saved.insertId;
  } catch (err) {
    console.error("Failed to record a job application:", err);
    return json({ error: "Something went wrong on our side. Please try again, or email your CV." }, 500);
  }

  // Saved: now HR's email. Bounded at 10 s and never throws; the catch
  // is only a second guard, so the answer below is the same either way.
  await mailApplication({ id, at, name, email, phone, role, message, resume: buf, kind, originalName }).catch(
    () => undefined
  );

  // The 24-month limit /privacy promises; runs in the background.
  void purgeExpired();

  return json({ ok: true });
};
