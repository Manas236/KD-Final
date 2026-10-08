/* ============================================================
   Outgoing email — the /careers applications to HR
   ------------------------------------------------------------
   kdconstructions.net mail is Google Workspace, so the site sends
   through smtp.gmail.com as one Workspace mailbox, signed in with an
   App Password (not the mailbox's real password). All of it is in .env
   (see .env.example):

     SMTP_HOST   smtp.gmail.com
     SMTP_PORT   465
     SMTP_USER   the sending mailbox, e.g. website@kdconstructions.net
     SMTP_PASS   its 16-character App Password
     CAREERS_TO  where applications go (default hr@kdconstructions.net)

   With SMTP_USER or SMTP_PASS empty, mailConfigured() is false and
   nothing is sent — the application is still saved and listed in
   /studio/applications (src/lib/applications.ts).

   Server-only.
   ============================================================ */
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import "dotenv/config";

export function mailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function careersInbox(): string {
  return process.env.CAREERS_TO || "hr@kdconstructions.net";
}

let transport: Transporter | null = null;

function transporter(): Transporter {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: (process.env.SMTP_PASS || "").replace(/\s+/g, "") },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    });
  }
  return transport;
}

export interface Outgoing {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
  readonly replyTo: string;
  readonly attachment: { filename: string; content: Buffer; contentType: string };
}

/** Sends to the careers inbox; true when the SMTP server accepted it. */
export async function sendToCareers(mail: Outgoing): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    await transporter().sendMail({
      from: { name: "K.D. Constructions website", address: process.env.SMTP_USER! },
      to: careersInbox(),
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments: [mail.attachment],
    });
    return true;
  } catch (err) {
    console.error("Failed to email a job application:", err);
    return false;
  }
}
