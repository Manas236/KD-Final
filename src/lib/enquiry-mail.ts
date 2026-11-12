/* ============================================================
   The email K.D. gets for each enquiry from /contact (12 Nov 2026)
   ------------------------------------------------------------
   receiveEnquiry() (src/lib/enquiries.ts) calls mailEnquiry() once the
   enquiry's row is saved, and only then. One email per enquiry, built
   the way the careers email is (src/lib/application-mail.ts) and sent by
   the same call (sendThroughResend() in src/lib/mailer.ts):

     to        ENQUIRY_MAIL_TO, a comma-separated list. No default: who
               answers enquiries is K.D.'s choice, so with none set the
               enquiry is saved, listed in /studio/enquiries and not sent
     from      ENQUIRY_MAIL_FROM, an address on updates.kdconstructions.net
               (default K.D. Constructions Website
               <enquiries@updates.kdconstructions.net>)
     reply_to  the sender's email, so Reply answers them
     subject   New enquiry: <name>, or New enquiry: <name> from <company>
     body      every field, when it arrived (IST), and a link to its row
               on /studio/enquiries; HTML and plain text

   The key is RESEND_API_KEY, the one the careers email uses.
   ENQUIRY_MAIL_DRY_RUN=1 prints the whole request to the log instead of
   sending it: development only, since that line holds the sender's
   details. All four are read at send time (.env.example).

   NEVER THROWS, and Resend is given 10 s at most.

   The result goes in enquiries.mail_status, the one column of that table
   the site's database user may UPDATE (the foot of db/migrate.sql):

     sent: <Resend's id>      Resend accepted it
     failed: <reason>         Resend refused it, or did not answer in time
     skipped                  RESEND_API_KEY is empty
     skipped: no recipients   the key is set, ENQUIRY_MAIL_TO is empty
     skipped: dry run         ENQUIRY_MAIL_DRY_RUN printed it instead

   NULL means nothing was recorded: the UPDATE was refused (the grant is
   missing). /studio/enquiries shows all of these.

   And one log line per enquiry, `enquiry-mail: enquiry <id> <result>`:
   the id, the result, Resend's id or the reason, and whether the result
   could not be saved. Never the key and never the sender's details,
   except in the dry run.

   No em dashes in anything K.D. reads (CLAUDE.md).

   Server-only.
   ============================================================ */
import pool from "./db";
import type { EnquiryValues } from "./enquiry-rules";
import {
  addressList,
  describeBody,
  escapeHtml,
  flagOn,
  istTime,
  mailConfigured,
  mailStatus,
  resendBody,
  sendThroughResend,
  type MailResult,
  type OutgoingMail,
} from "./mailer";

const DEFAULT_FROM = "K.D. Constructions Website <enquiries@updates.kdconstructions.net>";
const NO_RECIPIENTS = "ENQUIRY_MAIL_TO is empty";

export interface SavedEnquiry extends EnquiryValues {
  readonly id: number;
  readonly at: Date;
}

/** Who gets enquiries; empty when ENQUIRY_MAIL_TO is unset. */
export function enquiryInbox(): string[] {
  return addressList(process.env.ENQUIRY_MAIL_TO ?? "");
}

export function enquirySender(): string {
  return (process.env.ENQUIRY_MAIL_FROM ?? "").trim() || DEFAULT_FROM;
}

export function enquiryDryRun(): boolean {
  return flagOn("ENQUIRY_MAIL_DRY_RUN");
}

/** The studio row the email links to; the page gives each row this id. */
export function enquiryLink(id: number): string {
  return new URL(`/studio/enquiries#enquiry-${id}`, import.meta.env.SITE).href;
}

export function enquiryEmail(e: SavedEnquiry): OutgoingMail {
  const link = enquiryLink(e.id);
  const fields: [string, string][] = [
    ["Name", e.name],
    ["Company", e.company || "Not given"],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Message", e.message],
    ["Received", istTime(e.at)],
  ];

  const text =
    `A new enquiry came in through the contact page on the website.\n\n` +
    fields.map(([k, v]) => (k === "Message" ? `${k}:\n${v}` : `${k}: ${v}`)).join("\n") +
    `\n\nIn the studio (sign in first): ${link}\n\n` +
    `Reply to this email to answer ${e.name} directly.\n`;

  const cell = "padding:6px 16px 6px 0;vertical-align:top;text-align:left";
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5">` +
    `<p style="margin:0 0 16px">A new enquiry came in through the contact page on the website.</p>` +
    `<table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse">` +
    fields
      .map(
        ([k, v]) =>
          `<tr><th style="${cell};white-space:nowrap">${k}</th>` +
          `<td style="${cell}">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`
      )
      .join("") +
    `</table>` +
    `<p style="margin:16px 0 0"><a href="${escapeHtml(link)}">Open this enquiry in the studio</a> (sign in first).</p>` +
    `<p style="margin:16px 0 0">Reply to this email to answer ${escapeHtml(e.name)} directly.</p>` +
    `</div>`;

  return {
    from: enquirySender(),
    to: enquiryInbox(),
    replyTo: e.email,
    subject: `New enquiry: ${e.name}${e.company ? ` from ${e.company}` : ""}`,
    text,
    html,
  };
}

/** mail_status for an enquiry: the careers form, plus "no recipients". */
export function enquiryMailStatus(r: MailResult): string {
  return r.status === "skipped" && r.reason === NO_RECIPIENTS ? "skipped: no recipients" : mailStatus(r);
}

/** Email K.D. about a saved enquiry and record the result. Never throws. */
export async function mailEnquiry(e: SavedEnquiry): Promise<MailResult> {
  let result: MailResult;
  try {
    const mail = enquiryEmail(e);
    if (enquiryDryRun()) {
      console.log(`enquiry-mail: enquiry ${e.id} dry run, not sent: ${describeBody(resendBody(mail))}`);
      result = { status: "skipped", reason: "dry run" };
    } else if (!mailConfigured()) {
      // No key: the plain "skipped", as the careers email records it.
      result = { status: "skipped", reason: "RESEND_API_KEY is empty" };
    } else if (!mail.to.length) {
      result = { status: "skipped", reason: NO_RECIPIENTS };
    } else {
      result = await sendThroughResend(resendBody(mail), "enquiries");
    }
  } catch (err) {
    result = { status: "failed", reason: `could not build the email: ${(err as Error)?.name || "error"}` };
  }

  let unsaved = "";
  try {
    await pool.execute("UPDATE enquiries SET mail_status = ? WHERE id = ?", [enquiryMailStatus(result), e.id]);
  } catch (err) {
    unsaved = `; mail_status not saved: ${(err as Error)?.message || "database error"}`;
  }

  const detail = result.status === "sent" ? `Resend id ${result.id}` : result.reason;
  console.log(`enquiry-mail: enquiry ${e.id} ${result.status} (${detail})${unsaved}`);
  return result;
}
