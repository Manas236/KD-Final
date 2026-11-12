/* ============================================================
   Outgoing email, through Resend: the one mail path the site has
   ------------------------------------------------------------
   Since 2026-11-11 the site sends through Resend's HTTP API
   (POST https://api.resend.com/emails) with Node's global fetch: no SDK,
   no SMTP, no npm dependency. The sending domain,
   updates.kdconstructions.net, is verified in Resend, so the mail is
   signed for that subdomain and never claims to come from
   kdconstructions.net's own Google Workspace.

   Two kinds of email go this way, each built by its own module and sent
   by sendThroughResend() below:

     /careers applications to HR    src/lib/application-mail.ts,
                                    through sendToCareers()
     /contact enquiries (12 Nov 2026)  src/lib/enquiry-mail.ts

   All of it is in .env (see .env.example), read at send time, so a
   change needs a restart and no rebuild:

     RESEND_API_KEY        the API key, shared by both. Empty: nothing is
                           sent and the result is "skipped"
     CAREERS_MAIL_TO       where applications go
                           (default hr@kdconstructions.net)
     CAREERS_MAIL_FROM     the sender, on the verified domain (default
                           K.D. Constructions Careers
                           <careers@updates.kdconstructions.net>)
     CAREERS_MAIL_DRY_RUN  1 = build the request and print it to the log
                           instead of sending it, the attachment as its
                           size. Development only: the log then holds the
                           applicant's details
     ENQUIRY_MAIL_*        the enquiries' own three, the same way
                           (src/lib/enquiry-mail.ts)

   sendThroughResend() NEVER THROWS and gives up after SEND_TIMEOUT_MS.
   What it sends is saved before it is called (src/pages/api/apply.ts,
   src/pages/api/enquiry.ts), so an email that fails loses nothing; the
   module that built it records what happened in the row's mail_status.

   The key is never logged and never returned: a failure's reason is
   Resend's own message, cut short, with anything shaped like a key or an
   email address taken out.

   Server-only.
   ============================================================ */
import "dotenv/config";

const ENDPOINT = "https://api.resend.com/emails";
export const SEND_TIMEOUT_MS = 10_000;

const DEFAULT_TO = "hr@kdconstructions.net";
const DEFAULT_FROM = "K.D. Constructions Careers <careers@updates.kdconstructions.net>";

function apiKey(): string {
  return (process.env.RESEND_API_KEY ?? "").trim();
}

/** True when RESEND_API_KEY is set, so mail can be sent at all. */
export function mailConfigured(): boolean {
  return apiKey() !== "";
}

/** 1, true or yes, read from the environment at call time. */
export function flagOn(name: string): boolean {
  return /^(1|true|yes)$/i.test((process.env[name] ?? "").trim());
}

export function dryRun(): boolean {
  return flagOn("CAREERS_MAIL_DRY_RUN");
}

/** A comma-separated list of addresses, as an array, blanks dropped. */
export function addressList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Where applications go; CAREERS_MAIL_TO may list several, comma-separated. */
export function careersInbox(): string {
  return (process.env.CAREERS_MAIL_TO ?? "").trim() || DEFAULT_TO;
}

export function careersSender(): string {
  return (process.env.CAREERS_MAIL_FROM ?? "").trim() || DEFAULT_FROM;
}

/** The time a row arrived, as the emails and the studio say it. */
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

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export interface Attachment {
  readonly filename: string;
  readonly content: Buffer;
  readonly contentType: string;
}

export interface CareersMail {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
  /** The applicant's own address, so HR's Reply goes to them. */
  readonly replyTo: string;
  /** Left out when the file is too large to send (application-mail.ts). */
  readonly attachment?: Attachment;
}

export type MailResult =
  | { readonly status: "sent"; readonly id: string }
  | { readonly status: "failed"; readonly reason: string }
  | { readonly status: "skipped"; readonly reason: string };

/** One email, ready to go: sender and recipients included. */
export interface OutgoingMail extends CareersMail {
  readonly from: string;
  readonly to: readonly string[];
}

/** What goes in a row's mail_status (see application-mail.ts):
    `sent: <Resend id>`, `failed: <reason>`, `skipped`, `skipped: dry run`. */
export function mailStatus(r: MailResult): string {
  if (r.status === "sent") return `sent: ${r.id}`;
  if (r.status === "failed") return `failed: ${r.reason}`;
  return r.reason === "dry run" ? "skipped: dry run" : "skipped";
}

/** The JSON body POSTed to Resend for an application to HR. */
export function resendPayload(mail: CareersMail): Record<string, unknown> {
  return resendBody({
    ...mail,
    from: careersSender(),
    to: addressList(careersInbox()),
  });
}

/** The JSON body POSTed to Resend (field names are Resend's). */
export function resendBody(mail: OutgoingMail): Record<string, unknown> {
  return {
    from: mail.from,
    to: [...mail.to],
    reply_to: mail.replyTo,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    ...(mail.attachment
      ? {
          attachments: [
            {
              filename: mail.attachment.filename,
              content: mail.attachment.content.toString("base64"),
              content_type: mail.attachment.contentType,
            },
          ],
        }
      : {}),
  };
}

/** A reason short and clean enough for the log and the database. */
export function shortReason(s: string): string {
  return (
    s
      .replace(/re_[A-Za-z0-9_-]+/g, "re_…")
      .replace(/[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+/g, "<address>")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) || "no reason given"
  );
}

/** The request as the dry run prints it: the attachment as its size. */
export function describePayload(mail: CareersMail): string {
  return describeBody(resendPayload(mail), mail.attachment);
}

/** Any request as a dry run prints it: the attachment as its size. */
export function describeBody(body: Record<string, unknown>, attachment?: Attachment): string {
  if (attachment)
    body.attachments = [
      {
        filename: attachment.filename,
        content: `<${attachment.content.length} bytes, base64>`,
        content_type: attachment.contentType,
      },
    ];
  return JSON.stringify(body);
}

/** Sends one email to the careers inbox. Never throws. */
export async function sendToCareers(mail: CareersMail): Promise<MailResult> {
  if (dryRun()) return { status: "skipped", reason: "dry run" };
  return sendThroughResend(resendPayload(mail), "careers");
}

/** POSTs one email body (resendBody()) to Resend. Never throws.
    `purpose` names the sender in the User-Agent: "careers", "enquiries". */
export async function sendThroughResend(body: Record<string, unknown>, purpose: string): Promise<MailResult> {
  const key = apiKey();
  if (!key) return { status: "skipped", reason: "RESEND_API_KEY is empty" };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "User-Agent": `kdconstructions.net ${purpose}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    const raw = await res.text();
    let data: { id?: unknown; message?: unknown; name?: unknown } = {};
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }
    if (res.ok && typeof data.id === "string" && data.id)
      return { status: "sent", id: data.id.slice(0, 100) };
    const said = typeof data.message === "string" ? data.message : typeof data.name === "string" ? data.name : "";
    return { status: "failed", reason: shortReason(`HTTP ${res.status}${said ? `: ${said}` : ""}`) };
  } catch (err) {
    const e = err as { name?: string; cause?: { code?: string }; message?: string };
    if (e?.name === "TimeoutError" || e?.name === "AbortError")
      return { status: "failed", reason: `no answer from Resend in ${SEND_TIMEOUT_MS / 1000} s` };
    return { status: "failed", reason: shortReason(`could not reach Resend: ${e?.cause?.code || e?.message || "error"}`) };
  }
}
