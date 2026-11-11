/* ============================================================
   The email HR gets for each application from /careers
   ------------------------------------------------------------
   POST /api/apply calls mailApplication() once the application's resume
   file and row are saved, and only then. One email per application:

     to        CAREERS_MAIL_TO (hr@kdconstructions.net)
     from      CAREERS_MAIL_FROM (careers@updates.kdconstructions.net)
     reply_to  the applicant's email, so Reply answers them
     subject   New application: <name> for <role>
     body      every field the applicant filled, when it arrived (IST),
               and a link to its row on /studio/applications; HTML and
               plain text
     resume    attached under the name it had on their computer, typed
               by what the file really is (src/lib/applications.ts).
               Over MAX_ATTACH_BYTES it is left off and the body says it
               is on /studio/applications. The form takes 5 MB at most
               (MAX_RESUME_BYTES), so today every resume is attached.

   NEVER THROWS, and sendToCareers() gives up after 10 s, so the
   applicant's answer is the same whatever happens here.

   The result goes in job_applications.mail_status, the one column the
   site's database user may UPDATE (`GRANT UPDATE (mail_status)`, at the
   foot of db/migrate.sql):

     sent: <Resend's id>   Resend accepted it
     failed: <reason>      Resend refused it, or did not answer in time
     skipped               RESEND_API_KEY is empty
     skipped: dry run      CAREERS_MAIL_DRY_RUN printed it instead

   NULL means nothing was recorded: the application came in before
   2026-11-11 (its old `emailed` flag says whether the SMTP copy went), or
   the UPDATE was refused. /studio/applications shows all of these.

   And one log line per application, `careers-mail: application <id>
   <result>`: the id, the result, Resend's id or the reason, and whether
   the result could not be saved. Never the key and never the applicant's
   details. The dry run is the exception it is named for.

   No em dashes in anything HR reads (CLAUDE.md).

   Server-only.
   ============================================================ */
import pool from "./db";
import { RESUME_TYPES, attachmentName, type Applicant, type ResumeKind } from "./applications";
import { describePayload, sendToCareers, type Attachment, type CareersMail, type MailResult } from "./mailer";

/** Resend takes 40 MB a message; HR's mailbox is happier with less. */
export const MAX_ATTACH_BYTES = 10 * 1024 * 1024;

export interface SavedApplication extends Applicant {
  readonly id: number;
  readonly at: Date;
  readonly resume: Buffer;
  readonly kind: ResumeKind;
  /** The file's name on the applicant's computer, if the browser sent one. */
  readonly originalName: string | null;
}

/** The studio row the email links to; the page gives each row this id. */
export function studioLink(id: number): string {
  return new URL(`/studio/applications#application-${id}`, import.meta.env.SITE).href;
}

export function istTime(at: Date): string {
  const s = at.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${s} IST`;
}

const EXT: Record<string, true> = { pdf: true, doc: true, docx: true };

/** The applicant's own file name, made safe; the right extension for what
    the file really is; attachmentName() when the browser sent none. */
export function resumeFilename(original: string | null, applicant: string, kind: ResumeKind): string {
  const clean = (original ?? "")
    .split(/[\\/]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f"<>:|?*]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const dot = clean.lastIndexOf(".");
  const ext = dot > 0 ? clean.slice(dot + 1) : "";
  const stem = (EXT[ext.toLowerCase()] ? clean.slice(0, dot) : clean).trim().slice(0, 140);
  if (!stem) return attachmentName(applicant, kind);
  return `${stem}.${ext.toLowerCase() === kind ? ext : kind}`;
}

function size(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function applicationEmail(app: SavedApplication): CareersMail {
  const link = studioLink(app.id);
  const filename = resumeFilename(app.originalName, app.name, app.kind);
  const attach = app.resume.length <= MAX_ATTACH_BYTES;
  const resumeLine = attach
    ? `${filename} (${size(app.resume.length)}), attached`
    : `${filename} (${size(app.resume.length)}) is too large to attach. Download it from the application in the studio (link below).`;

  const fields: [string, string][] = [
    ["Name", app.name],
    ["Email", app.email],
    ["Phone", app.phone],
    ["Role", app.role],
  ];
  if (app.message) fields.push(["Message", app.message]);
  fields.push(["Resume", resumeLine], ["Received", istTime(app.at)]);

  const text =
    `A new job application came in through the careers page on the website.\n\n` +
    fields.map(([k, v]) => (k === "Message" ? `${k}:\n${v}` : `${k}: ${v}`)).join("\n") +
    `\n\nIn the studio (sign in first): ${link}\n\n` +
    `Reply to this email to answer ${app.name} directly.\n`;

  const cell = "padding:6px 16px 6px 0;vertical-align:top;text-align:left";
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">` +
    `<p style="margin:0 0 16px">A new job application came in through the careers page on the website.</p>` +
    `<table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse">` +
    fields
      .map(
        ([k, v]) =>
          `<tr><th style="${cell};white-space:nowrap">${k}</th>` +
          `<td style="${cell}">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`
      )
      .join("") +
    `</table>` +
    `<p style="margin:16px 0 0"><a href="${escapeHtml(link)}">Open this application in the studio</a> (sign in first).</p>` +
    `<p style="margin:16px 0 0">Reply to this email to answer ${escapeHtml(app.name)} directly.</p>` +
    `</div>`;

  const attachment: Attachment | undefined = attach
    ? { filename, content: app.resume, contentType: RESUME_TYPES[app.kind] }
    : undefined;

  return {
    subject: `New application: ${app.name} for ${app.role}`,
    text,
    html,
    replyTo: app.email,
    attachment,
  };
}

export function mailStatus(r: MailResult): string {
  if (r.status === "sent") return `sent: ${r.id}`;
  if (r.status === "failed") return `failed: ${r.reason}`;
  return r.reason === "dry run" ? "skipped: dry run" : "skipped";
}

/** Email HR about a saved application and record the result. Never throws. */
export async function mailApplication(app: SavedApplication): Promise<MailResult> {
  let result: MailResult;
  try {
    const mail = applicationEmail(app);
    result = await sendToCareers(mail);
    if (result.status === "skipped" && result.reason === "dry run")
      console.log(`careers-mail: application ${app.id} dry run, not sent: ${describePayload(mail)}`);
  } catch (err) {
    result = { status: "failed", reason: `could not build the email: ${(err as Error)?.name || "error"}` };
  }

  let unsaved = "";
  try {
    await pool.execute("UPDATE job_applications SET mail_status = ? WHERE id = ?", [mailStatus(result), app.id]);
  } catch (err) {
    unsaved = `; mail_status not saved: ${(err as Error)?.message || "database error"}`;
  }

  const detail =
    result.status === "sent" ? `Resend id ${result.id}` : result.reason;
  console.log(`careers-mail: application ${app.id} ${result.status} (${detail})${unsaved}`);
  return result;
}
