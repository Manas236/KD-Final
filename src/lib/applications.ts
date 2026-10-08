/* ============================================================
   Job applications from /careers — server side
   ------------------------------------------------------------
   The "Apply here" form on /careers (src/scripts/apply-form.js) posts
   to /api/apply. Each application is:

     1. checked here (fields, and that the resume really is a PDF or a
        Word file — by its first bytes, not its name),
     2. written to disk under MEDIA_DIR/applications/ — NOT under
        MEDIA_DIR/gallery, the only folder /media/ serves, so a resume is
        never reachable by URL; editors download it through
        /api/applications/resume, behind the edit session,
     3. emailed to HR with the resume attached (src/lib/mailer.ts),
     4. recorded in job_applications with whether the email went.

   So nothing is lost when the email fails (SMTP not yet set up, Google
   refusing the password): the row and the file are there, and
   /studio/applications lists every application with its resume.

   Server-only: database pool and node:fs.
   ============================================================ */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import type { RowDataPacket } from "mysql2";
import pool from "./db";
import { cleanText } from "./editable";
import { mediaDir } from "./gallery-media";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_NAME = 100;
export const MAX_ROLE = 160;
export const MAX_MESSAGE = 1000;

/* Kept identical to db/schema.sql. */
const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS job_applications (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(120)  NOT NULL,
    email          VARCHAR(254)  NOT NULL,
    phone          VARCHAR(30)   NOT NULL,
    role           VARCHAR(160)  NOT NULL,
    message        TEXT          NULL,
    resume_file    VARCHAR(80)   NOT NULL,
    original_name  VARCHAR(255)  NULL,
    bytes          INT           NOT NULL,
    emailed        TINYINT(1)    NOT NULL DEFAULT 0,
    client_ip      VARCHAR(45)   NULL,
    user_agent     VARCHAR(255)  NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
`;

let ready: Promise<void> | null = null;

/** Create the table once per process; a failure is retried next call. */
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

export function applicationsDir(): string {
  return path.join(mediaDir(), "applications");
}

/* ------------------------------------------------------------
   The resume
   ------------------------------------------------------------ */
export type ResumeKind = "pdf" | "docx" | "doc";

export const RESUME_TYPES: Record<ResumeKind, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

/** What the file actually is, from its first bytes; null if neither. */
export function sniffResume(buf: Buffer): ResumeKind | null {
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  // .docx is a zip whose parts include word/document.xml.
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04)
    return buf.includes("word/") ? "docx" : null;
  // .doc is an OLE2 compound file.
  if (buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])))
    return "doc";
  return null;
}

/** A safe file name for the attachment: the applicant's name + kind. */
export function attachmentName(name: string, kind: ResumeKind): string {
  const base = name.replace(/[^A-Za-z0-9 ._-]+/g, "").trim().replace(/\s+/g, "-") || "applicant";
  return `Resume-${base.slice(0, 60)}.${kind}`;
}

export async function storeResume(buf: Buffer, kind: ResumeKind): Promise<string> {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const file = `cv-${day}-${randomBytes(6).toString("hex")}.${kind}`;
  await mkdir(applicationsDir(), { recursive: true });
  await writeFile(path.join(applicationsDir(), file), buf, { flag: "wx" });
  return file;
}

const RE_FILE = /^cv-\d{8}-[0-9a-f]{12}\.(pdf|docx|doc)$/;

export async function readResume(file: string): Promise<Buffer | null> {
  if (!RE_FILE.test(file)) return null;
  try {
    return await readFile(path.join(applicationsDir(), file));
  } catch {
    return null;
  }
}

export function kindOf(file: string): ResumeKind {
  return file.slice(file.lastIndexOf(".") + 1) as ResumeKind;
}

/* ------------------------------------------------------------
   The fields
   ------------------------------------------------------------ */
export interface Applicant {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly role: string;
  readonly message: string;
}

export type ApplicantCheck = ({ ok: true } & Applicant) | { ok: false; reason: string };

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateApplicant(input: Record<string, unknown>): ApplicantCheck {
  const name = cleanText(input.name);
  const email = cleanText(input.email).toLowerCase();
  const phone = cleanText(input.phone);
  const role = cleanText(input.role);
  const message = cleanText(input.message);

  if (!name) return { ok: false, reason: "Please enter your name." };
  if (name.length > MAX_NAME) return { ok: false, reason: "Please shorten your name." };
  if (!RE_EMAIL.test(email) || email.length > 254)
    return { ok: false, reason: "Please enter a valid email address." };
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15 || !/^[+\d\s()-]+$/.test(phone))
    return { ok: false, reason: "Please enter a valid phone number." };
  if (!role || role.length > MAX_ROLE)
    return { ok: false, reason: "Please choose the role you are applying for." };
  if (message.length > MAX_MESSAGE)
    return { ok: false, reason: `Please keep the message under ${MAX_MESSAGE} characters.` };

  return { ok: true, name, email, phone, role, message };
}

/* ------------------------------------------------------------
   Reading them back — /studio/applications
   ------------------------------------------------------------ */
export interface Application extends Applicant {
  readonly id: number;
  readonly file: string;
  readonly bytes: number;
  readonly emailed: boolean;
  readonly at: Date;
}

export async function listApplications(limit = 500): Promise<Application[] | null> {
  try {
    await ensureTable();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, role, message, resume_file, bytes, emailed, created_at
         FROM job_applications ORDER BY id DESC LIMIT ?`,
      [limit]
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      role: r.role,
      message: r.message ?? "",
      file: r.resume_file,
      bytes: r.bytes,
      emailed: !!r.emailed,
      at: new Date(r.created_at),
    }));
  } catch (err) {
    console.error("Failed to read job applications:", err);
    return null;
  }
}
